import { NextRequest, NextResponse } from 'next/server';


// Use new Backend API endpoint
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isArchived = searchParams.get('isArchived');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    let url = `${BACKEND_URL}/contact-messages?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (isArchived) url += `&isArchived=${isArchived}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    // Data from backend already uses 'id', no _id transform needed
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to create message');
    }

    const data = await response.json();

    // Data from backend already uses 'id', no _id transform needed
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}