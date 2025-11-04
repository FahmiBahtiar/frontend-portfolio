import { NextRequest, NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/hero';

export async function GET(request: NextRequest) {
  try {
    const heroProfile = await HeroService.getHeroProfile();

    return NextResponse.json({
      success: true,
      message: 'Hero profile test from frontend',
      data: heroProfile,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to load hero profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}