import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

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

    const data = await response.json();

    // Transform _id to id for frontend compatibility
    if (data.success && data.data) {
      data.data = data.data.map((item: any) => ({
        ...item,
        id: item._id,
        _id: undefined,
      }));
    }

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

    // Transform _id to id for frontend compatibility
    if (data.success && data.data) {
      data.data = {
        ...data.data,
        id: data.data._id,
        _id: undefined,
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}