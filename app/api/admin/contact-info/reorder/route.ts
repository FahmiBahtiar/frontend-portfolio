import { proxyToBackend } from '@/lib/admin-proxy';

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/contact-info/reorder', { method: 'POST', body });
}
