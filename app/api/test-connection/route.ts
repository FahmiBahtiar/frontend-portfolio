import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test connection to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Test multiple endpoints
    const endpoints = [
      '/api/admin/about/passions',
      '/api/admin/about/highlights',
      '/api/admin/hero/profile',
    ];

    const results: Record<string, any> = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${backendUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          results[endpoint] = {
            status: 'success',
            data: data,
          };
        } else {
          results[endpoint] = {
            status: 'error',
            statusCode: response.status,
            message: response.statusText,
          };
        }
      } catch (error) {
        results[endpoint] = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Frontend-Backend connection test completed',
      backendUrl,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}