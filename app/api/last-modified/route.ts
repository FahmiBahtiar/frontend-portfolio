import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the last modified date from the most recently modified file in the project
    // For now, we'll use a static date or get it from git
    // In a real implementation, you might want to check file modification times

    // You can also get this from your backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      // Try to get from backend first
      const backendResponse = await fetch(`${backendUrl}/api/last-modified`, {
        cache: 'no-store',
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        return NextResponse.json(backendData);
      }
    } catch (backendError) {
      // Backend not available, using local calculation
    }

    // Fallback: Calculate from local files or use current date
    const now = new Date();
    const formattedDate = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;

    return NextResponse.json({
      success: true,
      formattedDate,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching last modified date:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch last modified date',
        formattedDate: '11/04/2025', // Fallback date
      },
      { status: 500 }
    );
  }
}
