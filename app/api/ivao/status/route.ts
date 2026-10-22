import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vid = searchParams.get('vid') || '704291';
  const vidNum = parseInt(vid, 10);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.ivao.aero/v2/tracker/whazzup', {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({
        online: false,
        vid,
        status: 'Standby',
      });
    }

    const data = await res.json();
    const pilot = data?.clients?.pilots?.find((p: { userId?: number }) => p.userId === vidNum);

    if (pilot) {
      return NextResponse.json({
        online: true,
        type: 'pilot',
        vid,
        callsign: pilot.callsign || 'N/A',
        departure: pilot.flightPlan?.departureId || 'N/A',
        arrival: pilot.flightPlan?.arrivalId || 'N/A',
        aircraft: pilot.flightPlan?.aircraftId || pilot.aircraft?.icaoCode || 'Aircraft',
        altitude: pilot.lastTrack?.altitude || 0,
        groundSpeed: pilot.lastTrack?.groundSpeed || 0,
        heading: pilot.lastTrack?.heading || 0,
        state: pilot.lastTrack?.state || 'En Route',
      });
    }

    const atc = data?.clients?.atcs?.find((a: { userId?: number }) => a.userId === vidNum);
    if (atc) {
      return NextResponse.json({
        online: true,
        type: 'atc',
        vid,
        callsign: atc.callsign || 'ATC',
        frequency: atc.frequency || '122.800',
        rating: atc.rating || 1,
      });
    }

    return NextResponse.json({
      online: false,
      vid,
      status: 'Standby',
    });
  } catch {
    return NextResponse.json({
      online: false,
      vid,
      status: 'Standby',
    });
  }
}
