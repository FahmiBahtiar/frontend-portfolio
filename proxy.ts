import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { auth } from '@/lib/auth';
import { API_BASE_URL, INTERNAL_API_URL } from '@/lib/config';

const BACKEND_URL = INTERNAL_API_URL;
const PUBLIC_FILE = /\.(.*)$/;

// In-memory cache for maintenance check to avoid blocking fetch on every request
let maintenanceCache: { isActive: boolean; expiresAt: number } | null = null;
const MAINTENANCE_CACHE_TTL_MS = 20_000; // 20s TTL

async function checkMaintenanceStatus(): Promise<boolean> {
  const now = Date.now();
  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.isActive;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/maintenance`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Fast timeout so middleware never hangs
      signal: AbortSignal.timeout(1500),
    });

    if (response.ok) {
      const payload = await response.json();
      const isActive = Boolean(payload?.data?.isActive);
      maintenanceCache = {
        isActive,
        expiresAt: now + MAINTENANCE_CACHE_TTL_MS,
      };
      return isActive;
    }
  } catch {
    // Fail open to avoid blocking traffic if maintenance check fails
  }

  if (maintenanceCache) {
    maintenanceCache.expiresAt = now + 5000;
    return maintenanceCache.isActive;
  }

  return false;
}

const shouldSkipMaintenance = (pathname: string) =>
  pathname.startsWith('/admin') ||
  pathname.startsWith('/api/admin') ||
  pathname.startsWith('/api/auth') ||
  pathname.startsWith('/api/maintenance') ||
  pathname.startsWith('/maintenance') ||
  pathname.startsWith('/_next') ||
  pathname.startsWith('/favicon') ||
  PUBLIC_FILE.test(pathname);

const isProd = process.env.NODE_ENV === 'production';

/**
 * Build the Content-Security-Policy. In production, scripts are restricted to a
 * per-request nonce (no 'unsafe-inline') — Next.js auto-applies the nonce to its
 * own scripts when it sees it in the request CSP header, and we apply it to the
 * JSON-LD scripts in the layout. In development we keep 'unsafe-inline'/'unsafe-eval'
 * so HMR/React-refresh keep working.
 */
function buildCsp(nonce: string): string {
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}'`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' https: wss: ${isProd ? '' : 'http://localhost:3001'} ${process.env.NEXT_PUBLIC_API_URL || ''}`.trim(),
    "media-src 'self' https:",
    "frame-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export async function proxy(request: NextRequest, event?: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // Per-request CSP nonce. Web Crypto + btoa are available in the edge runtime.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Forward the nonce to the app: Next reads the CSP request header to nonce its
  // own scripts; our layout reads x-nonce to nonce the JSON-LD scripts.
  const requestHeaders = new Headers(request.headers);
  if (isProd) {
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('content-security-policy', csp);
  }

  // Attach the CSP to any response we return.
  const withCsp = <T extends NextResponse>(response: T): T => {
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };
  const forward = () =>
    withCsp(NextResponse.next({ request: { headers: requestHeaders } }));

  // Skip logging for internal API routes and auth endpoints
  const shouldSkipLogging = 
    pathname.startsWith('/api/auth') ||        // NextAuth endpoints (session, signin, signout, etc)
    pathname.startsWith('/api/_next') ||       // Next.js internal APIs
    pathname === '/api/logger/frontend';       // Our own logger endpoint

  // Only log if not in skip list
  if (!shouldSkipLogging) {
    const logPromise = logRequestToBackend(request, startTime);
    if (event?.waitUntil) {
      event.waitUntil(logPromise);
    } else {
      logPromise.catch((err) => console.error('[proxy logger error]', err));
    }
  }

  if (!shouldSkipMaintenance(pathname)) {
    const isMaintenance = await checkMaintenanceStatus();
    if (isMaintenance) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return withCsp(
        NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
      );
    }
  }

  // Protect admin API routes at the edge (defense in depth — each route handler
  // also gates via requireAdmin()). Return 401 JSON, not an HTML redirect.
  if (pathname.startsWith('/api/admin') || pathname === '/api/upload') {
    const session = await auth();
    if (!session?.user?.email) {
      return withCsp(
        NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 },
        ),
      );
    }
  }

  // Protect all admin pages except login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await auth();

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      return withCsp(NextResponse.redirect(loginUrl));
    }
  }

  return forward();
}

async function logRequestToBackend(request: NextRequest, startTime: number) {
  try {
    const responseTime = Date.now() - startTime;
    
    // Get client IP
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    // Get country from Cloudflare or Vercel headers
    const country =
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-vercel-ip-country') ||
      undefined;

    // Parse query parameters
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const logData = {
      method: request.method,
      path: request.nextUrl.pathname,
      statusCode: 200, // Will be updated after response
      ip,
      userAgent: request.headers.get('user-agent') || 'Unknown',
      referer: request.headers.get('referer') || undefined,
      country,
      responseTime,
      timestamp: new Date().toISOString(),
      query: Object.keys(query).length > 0 ? query : undefined,
    };

    // Await fetch so promise settles cleanly in event.waitUntil
    await fetch(`${BACKEND_URL}/logger/frontend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
  } catch (error) {
    // Silently fail - logging should never break the app
    console.error('Logging error:', error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

