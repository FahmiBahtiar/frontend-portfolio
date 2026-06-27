import { proxyToBackend } from '@/lib/admin-proxy';

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(`/contact-messages/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'read' }),
  });
}
