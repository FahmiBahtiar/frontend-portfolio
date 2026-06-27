import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/contact-info/${encodeURIComponent(id)}`);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.text();
  return proxyToBackend(`/contact-info/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/contact-info/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
