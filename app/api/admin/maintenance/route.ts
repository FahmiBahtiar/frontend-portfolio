import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET() {
  return proxyToBackend('/api/admin/maintenance');
}

export async function PUT(request: NextRequest) {
  const body = await request.text();
  // Toggling maintenance mode is admin-only (backend enforces @Roles('admin')).
  return proxyToBackend('/api/admin/maintenance', {
    method: 'PUT',
    body,
    role: 'admin',
  });
}
