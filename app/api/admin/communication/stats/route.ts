import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/contact-messages/stats');
}
