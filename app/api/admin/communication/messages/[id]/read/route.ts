import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/contact_messages/${id}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}