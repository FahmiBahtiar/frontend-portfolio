import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mintUserToken, mintInternalToken } from '@/lib/backend-auth';
import { API_BASE_URL } from '@/lib/config';

const BACKEND_URL = API_BASE_URL;

export interface AdminSession {
  email: string;
  role: string;
  userId?: string;
}

type Gate =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse };

const unauthorized = () =>
  NextResponse.json(
    { success: false, message: 'Unauthorized' },
    { status: 401 },
  );

const forbidden = () =>
  NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

/**
 * Verify the request carries a valid next-auth admin session.
 * Pass { role: 'admin' } to additionally require the admin role.
 */
export async function requireAdmin(opts: { role?: 'admin' } = {}): Promise<Gate> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, response: unauthorized() };
  }
  const role = session.user.role || 'editor';
  if (opts.role === 'admin' && role !== 'admin') {
    return { ok: false, response: forbidden() };
  }
  return {
    ok: true,
    session: { email: session.user.email, role, userId: session.user.userId },
  };
}

export interface ProxyInit {
  method?: string;
  /** Pre-serialized JSON body (or undefined). */
  body?: BodyInit | null;
  /** Forwarded query string. */
  searchParams?: URLSearchParams | string;
  /** Require admin role (default: any authorized user). */
  role?: 'admin';
}

/**
 * Gate on an authenticated admin session, then forward a JSON request to the
 * backend with a short-lived backend JWT. Returns the backend's JSON response.
 */
export async function proxyToBackend(
  backendPath: string,
  init: ProxyInit = {},
): Promise<NextResponse> {
  const gate = await requireAdmin({ role: init.role });
  if (!gate.ok) return gate.response;

  let token: string;
  try {
    token = await mintUserToken(gate.session);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server auth not configured' },
      { status: 500 },
    );
  }

  const qs = init.searchParams
    ? `?${typeof init.searchParams === 'string' ? init.searchParams : init.searchParams.toString()}`
    : '';

  try {
    const res = await fetch(`${BACKEND_URL}${backendPath}${qs}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: init.body ?? undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend request failed' },
      { status: 502 },
    );
  }
}

/**
 * For multipart/form-data (file upload) proxying — gate on session, then forward
 * the FormData with a backend JWT. Content-Type is intentionally NOT set so the
 * runtime generates the correct multipart boundary.
 */
export async function proxyMultipartToBackend(
  backendPath: string,
  body: FormData,
): Promise<NextResponse> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let token: string;
  try {
    token = await mintUserToken(gate.session);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server auth not configured' },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend request failed' },
      { status: 502 },
    );
  }
}

/**
 * Gate on an admin session, then call a backend @Internal() endpoint with an
 * internal-scoped token (used where the backend route is internal-only).
 */
export async function proxyInternal(
  backendPath: string,
  init: { method?: string; body?: BodyInit | null } = {},
): Promise<NextResponse> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  let token: string;
  try {
    token = await mintInternalToken();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server auth not configured' },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: init.body ?? undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend request failed' },
      { status: 502 },
    );
  }
}
