import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/contact-info/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch contact information');
    }

    const data = await response.json();
    
    // Transform _id to id for frontend compatibility
    const transformedData = {
      ...data,
      id: data._id,
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contact information' },
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

    const response = await fetch(`${BACKEND_URL}/contact-info/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to update contact information');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating contact information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update contact information' },
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
    const response = await fetch(`${BACKEND_URL}/contact-info/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete contact information');
    }

    return NextResponse.json({
      success: true,
      message: 'Contact information deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact information:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete contact information' },
      { status: 500 }
    );
  }
}