import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test connection to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const [educationResponse, achievementsResponse] = await Promise.all([
      fetch(`${backendUrl}/api/admin/education/records`),
      fetch(`${backendUrl}/api/admin/education/achievements`)
    ]);

    const educationData = await educationResponse.json();
    const achievementsData = await achievementsResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Education API test completed',
      backendUrl,
      results: {
        education: {
          status: educationResponse.ok ? 'success' : 'error',
          data: educationData
        },
        achievements: {
          status: achievementsResponse.ok ? 'success' : 'error',
          data: achievementsData
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Education API test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}