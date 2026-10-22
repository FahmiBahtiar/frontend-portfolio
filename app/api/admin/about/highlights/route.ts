import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/about/highlights');
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/about/highlights', { method: 'POST', body });
}
