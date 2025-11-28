import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/education/achievements`);
    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
