import { proxyInternal } from '@/lib/admin-proxy';

// Admin UI duplicate-check. Gated on an admin session; forwards to the backend's
// @Internal() check endpoint with an internal-scoped token.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ email: string }> },
) {
  const { email } = await params;
  return proxyInternal(
    `/api/admin/auth/users/check/${encodeURIComponent(email)}`,
  );
}
