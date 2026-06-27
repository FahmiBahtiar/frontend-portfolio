import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams.toString();
  return proxyToBackend('/contact-info', { searchParams });
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/contact-info', { method: 'POST', body });
}
