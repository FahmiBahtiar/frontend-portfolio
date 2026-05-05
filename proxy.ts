import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // Skip logging for internal API routes and auth endpoints
  const shouldSkipLogging = 
    pathname.startsWith('/api/auth') ||        // NextAuth endpoints (session, signin, signout, etc)
    pathname.startsWith('/api/_next') ||       // Next.js internal APIs
    pathname === '/api/logger/frontend';       // Our own logger endpoint

  // Only log if not in skip list
  if (!shouldSkipLogging) {
    logRequestToBackend(request, startTime).catch(console.error);
  }

  // Protect all admin routes except login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await auth();

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

async function logRequestToBackend(request: NextRequest, startTime: number) {
  try {
    const responseTime = Date.now() - startTime;
    
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    // Get country from Vercel headers
    const country = request.headers.get('x-vercel-ip-country') || undefined;

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

    // Send to backend logger endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Use fetch with timeout and don't wait for response
    fetch(`${backendUrl}/logger/frontend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    }).catch(() => {
      // Silently fail - don't block the request if logging fails
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

