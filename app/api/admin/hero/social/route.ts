import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/hero/social');
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/hero/social', { method: 'POST', body });
}
