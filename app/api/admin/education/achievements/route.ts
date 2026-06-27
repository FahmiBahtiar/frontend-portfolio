import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams.toString();
  return proxyToBackend('/api/education/achievements', { searchParams });
}
