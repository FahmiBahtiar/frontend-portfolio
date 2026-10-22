import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/education/records');
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/education/records', { method: 'POST', body });
}
