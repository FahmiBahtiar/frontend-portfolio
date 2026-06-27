import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/about/skills');
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/about/skills', { method: 'POST', body });
}
