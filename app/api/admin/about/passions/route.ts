import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/about/passions');
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/about/passions', { method: 'POST', body });
}
