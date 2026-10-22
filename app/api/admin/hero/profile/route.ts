import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/hero/profile');
}

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/hero/profile', { method: 'PUT', body });
}
