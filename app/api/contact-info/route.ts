import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';


// Use new Supabase backend endpoint
const BACKEND_URL = API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    // Supabase backend endpoint (new)
    const response = await fetch(`${BACKEND_URL}/contact-info`);

    if (!response.ok) {
      throw new Error('Failed to fetch contact information');
    }

    // Data from Supabase already uses 'id', no _id transform needed
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contact information' },
      { status: 500 }
    );
  }
}