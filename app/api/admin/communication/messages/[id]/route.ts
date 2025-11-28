import { NextRequest, NextResponse } from 'next/server';


// Use new Backend API endpoint
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/contact_messages/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }

    const data = await response.json();

    // Data from backend already uses 'id', no _id transform needed
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/contact_messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to update message');
    }

    const data = await response.json();

    // Data from backend already uses 'id', no _id transform needed
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/contact_messages/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete message' },
      { status: 500 }
    );
  }
}