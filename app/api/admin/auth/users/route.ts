import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/admin/auth/users', { role: 'admin' });
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/auth/users', {
    method: 'POST',
    body,
    role: 'admin',
  });
}
