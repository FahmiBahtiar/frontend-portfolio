import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams.toString();
  return proxyToBackend('/api/experience/flights', { searchParams });
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/experience/flights', { method: 'POST', body });
}
