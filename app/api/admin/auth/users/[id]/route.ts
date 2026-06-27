import { proxyToBackend } from '@/lib/admin-proxy';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(`/api/admin/auth/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
    role: 'admin',
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(`/api/admin/auth/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    role: 'admin',
  });
}
