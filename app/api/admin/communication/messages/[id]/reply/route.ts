import { proxyToBackend } from '@/lib/admin-proxy';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return proxyToBackend(`/contact-messages/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ reply: body.reply, status: 'replied' }),
  });
}
