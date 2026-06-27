import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams.toString();
  return proxyToBackend('/contact-messages', { searchParams });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyToBackend('/contact-messages', { method: 'POST', body });
}
