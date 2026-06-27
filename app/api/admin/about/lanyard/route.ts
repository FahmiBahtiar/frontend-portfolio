import { proxyToBackend } from '@/lib/admin-proxy';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams.toString();
  return proxyToBackend('/api/about/lanyard', { searchParams });
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToBackend('/api/admin/about/lanyard', { method: 'POST', body });
}

export async function PUT(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    const { NextResponse } = await import('next/server');
    return NextResponse.json(
      { success: false, message: 'Lanyard ID is required' },
      { status: 400 }
    );
  }
  const body = await request.text();
  return proxyToBackend(`/api/admin/about/lanyard/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
  });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    const { NextResponse } = await import('next/server');
    return NextResponse.json(
      { success: false, message: 'Lanyard ID is required' },
      { status: 400 }
    );
  }
  return proxyToBackend(`/api/admin/about/lanyard/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
