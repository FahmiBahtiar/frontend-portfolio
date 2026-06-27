import { proxyToBackend } from '@/lib/admin-proxy';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(`/api/admin/about/skills/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/api/admin/about/skills/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
