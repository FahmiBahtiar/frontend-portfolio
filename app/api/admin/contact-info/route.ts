import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/contact-info`);

    if (!response.ok) {
      throw new Error('Failed to fetch contact information');
    }

    const data = await response.json();
    // Transform _id to id for frontend compatibility
    const transformedData = Array.isArray(data) ? data.map(item => ({
      ...item,
      id: item._id,
      _id: undefined
    })) : data;

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contact information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/contact-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to create contact information');
    }

    const data = await response.json();
    // Transform _id to id for frontend compatibility
    const transformedData = Array.isArray(data) ? data.map(item => ({
      ...item,
      id: item._id,
      _id: undefined
    })) : data;
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error creating contact information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create contact information' },
      { status: 500 }
    );
  }
}