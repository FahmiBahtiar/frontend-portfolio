import { NextRequest, NextResponse } from 'next/server';


// Use new Backend API endpoint
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/contact-info/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder contact information');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reordering contact information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reorder contact information' },
      { status: 500 }
    );
  }
}