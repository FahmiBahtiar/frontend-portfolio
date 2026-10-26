import { NextRequest, NextResponse } from 'next/server';
import { proxyMultipartToBackend } from '@/lib/admin-proxy';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, message: 'No file uploaded' },
      { status: 400 },
    );
  }

  // Client-side pre-checks (the backend re-validates by magic bytes + auth).
  const isImageOrPdf =
    file.type.startsWith('image/') ||
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');

  if (!isImageOrPdf) {
    return NextResponse.json(
      { success: false, message: 'File must be an image or a PDF document' },
      { status: 400 },
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, message: 'File size must be less than 5MB' },
      { status: 400 },
    );
  }

  // Gate on admin session + forward to the (now auth-protected) backend upload.
  const formData = new FormData();
  formData.append('file', file);
  return proxyMultipartToBackend('/upload', formData);
}
