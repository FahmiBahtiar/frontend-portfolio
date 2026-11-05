import { NextResponse } from 'next/server';
import { INTERNAL_API_URL } from '@/lib/config';

const BACKEND_URL = INTERNAL_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/maintenance`);

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch maintenance status' },
      { status: 500 }
    );
  }
}
