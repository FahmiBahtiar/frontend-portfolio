'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useInView } from 'motion/react';
import Image from 'next/image';
import { 
  Radio, 
  Radar, 
  Gamepad2, 
  Plane, 
  Wifi, 
  WifiOff, 
  ExternalLink, 
  Clock, 
  Disc,
  Compass
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LanyardActivity {
  id?: string;
  name: string;
  type: number;
  state?: string | null;
  details?: string | null;
  timestamps?: { start?: number; end?: number } | null;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  } | null;
}

interface LanyardResponse {
  data?: {
    discord_status: 'online' | 'idle' | 'dnd' | 'offline';
    discord_user: {
      id: string;
      username: string;
      discriminator: string;
      avatar: string;
      avatar_decoration_data?: { asset?: string } | null;
      global_name?: string;
    };
    activities: LanyardActivity[];
    listening_to_spotify?: boolean;
    spotify?: {
      song: string;
      artist: string;
      album_art_url: string;
    } | null;
  };
}

interface IvaoResponse {
  online: boolean;
  type?: 'pilot' | 'atc';
  vid: string;
  callsign?: string;
  departure?: string;
  arrival?: string;
  aircraft?: string;
  altitude?: number;
  groundSpeed?: number;
  heading?: number;
  state?: string;
  frequency?: string;
  status?: string;
}

export function LiveStatusCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '200px' });

  // 1. Fetch Discord presence via Lanyard API (only when visible)
  const { data: lanyardRes } = useSWR<LanyardResponse>(
    isInView ? 'https://api.lanyard.rest/v1/users/467600406000697354' : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      dedupingInterval: 15000,
      errorRetryCount: 2,
    }
  );

  // 2. Fetch IVAO status via internal proxy API (fetch ONCE when visible, zero background interval polling to keep Discord logs completely silent)
  const { data: ivaoData } = useSWR<IvaoResponse>(
    isInView ? '/api/ivao/status?vid=704291' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 120000,
      errorRetryCount: 0,
    }
  );

  const discordData = lanyardRes?.data;
  const user = discordData?.discord_user;
  const status = discordData?.discord_status || 'offline';

  // Find custom status and active game/activity
  const customStatusActivity = discordData?.activities?.find((a) => a.type === 4);
  const customStatusText = customStatusActivity?.state || '';
  
  const gameActivity = discordData?.activities?.find((a) => a.type !== 4 && a.name !== 'Spotify');

  // Elapsed timer for game activity
  const [elapsedString, setElapsedString] = useState<string>('');

  useEffect(() => {
    if (!gameActivity?.timestamps?.start) {
      setElapsedString('');
      return;
    }

    const startTime = gameActivity.timestamps.start;
    const updateElapsed = () => {
      const diffSec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsedString(
        hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)} elapsed` : `${pad(minutes)}:${pad(seconds)} elapsed`
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [gameActivity?.timestamps?.start]);

  // Status mapping
  const statusConfig = {
    online: { label: 'ONLINE', dotColor: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    dnd: { label: 'DO NOT DISTURB', dotColor: 'bg-rose-500', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
    idle: { label: 'AWAY', dotColor: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    offline: { label: 'OFFLINE', dotColor: 'bg-slate-400', badgeClass: 'bg-slate-50 text-slate-600 border-slate-200' },
  }[status];

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ===== DISCORD STATUS CARD (ARCTIC ICE) ===== */}
      <Card className="border border-[#B9E7E6] hover:border-[#6FD4E1] hover:shadow-md transition-all bg-white/95 shadow-sm rounded-2xl">
        <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm">
                <Radio className="w-5 h-5 text-[#0891b2]" />
              </div>
              <div>
                <div className="text-sm font-mono text-[#0c282d] tracking-wide font-bold">DISCORD NETWORK</div>
                <div className="text-xs text-[#527d85] font-medium">Real-time gateway presence</div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusConfig.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
              <span>{statusConfig.label}</span>
            </div>
          </div>

          {/* User Profile Block */}
          <div className="rounded-xl border border-[#B9E7E6] bg-[#E2F4F3]/35 p-4 mb-4">
            <div className="flex items-center gap-3.5">
              {/* Avatar with Status Ring */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white">
                  <Image
                    src={avatarUrl}
                    alt={user?.username || 'Discord Avatar'}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${statusConfig.dotColor}`} />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#0c282d] truncate">
                    {user?.username || 'blimbing_'}
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2F4F3] border border-[#B9E7E6] text-[#0891b2]">
                    JAWA
                  </span>
                </div>
                {customStatusText ? (
                  <p className="text-xs text-[#2d5f68] font-medium italic truncate mt-0.5">
                    &ldquo;{customStatusText}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-[#527d85] font-mono font-medium truncate mt-0.5">
                    Live Discord Presence
                  </p>
                )}
              </div>
            </div>

            {/* Active Game / Rich Activity Box */}
            <div className="mt-3.5 pt-3 border-t border-[#B9E7E6]/50">
              {gameActivity ? (
                <div className="flex items-center justify-between gap-3 bg-white/90 rounded-lg p-2.5 border border-[#B9E7E6] shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0c282d] truncate">{gameActivity.name}</div>
                      {elapsedString && (
                        <div className="text-[10px] text-[#527d85] font-mono font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-[#0891b2]" />
                          <span>{elapsedString}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0891b2] bg-[#E2F4F3] px-2 py-0.5 rounded-full border border-[#B9E7E6] shrink-0">
                    ACTIVE
                  </span>
                </div>
              ) : discordData?.listening_to_spotify && discordData.spotify ? (
                <div className="flex items-center justify-between gap-3 bg-white/90 rounded-lg p-2.5 border border-[#B9E7E6] shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shrink-0">
                      <Disc className="w-4 h-4 text-[#0891b2] animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0c282d] truncate">{discordData.spotify.song}</div>
                      <div className="text-[10px] text-[#527d85] truncate">{discordData.spotify.artist}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    SPOTIFY
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#527d85] font-medium py-1">
                  <Wifi className="w-3.5 h-3.5 text-[#0891b2]" />
                  <span>Discord client connected &bull; Ready to chat</span>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Footer */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#527d85] pt-2 border-t border-[#B9E7E6]/40">
            <span>VOICE SYSTEM: ONLINE</span>
            <span className="text-[#0891b2] font-bold">UID: 4676...7354</span>
          </div>
        </CardContent>
      </Card>

      {/* ===== IVAO TELEMETRY CARD (ARCTIC ICE) ===== */}
      <Card className="border border-[#B9E7E6] hover:border-[#6FD4E1] hover:shadow-md transition-all bg-white/95 shadow-sm rounded-2xl">
        <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm">
                <Radar className="w-5 h-5 text-[#0891b2]" />
              </div>
              <div>
                <div className="text-sm font-mono text-[#0c282d] tracking-wide font-bold">IVAO NETWORK</div>
                <div className="text-xs text-[#527d85] font-medium">Flight simulation telemetry</div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              ivaoData?.online ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#E2F4F3] text-[#0891b2] border-[#B9E7E6]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${ivaoData?.online ? 'bg-emerald-500' : 'bg-[#0891b2]'} animate-pulse`} />
              <span>{ivaoData?.online ? 'AIRBORNE' : 'STANDBY'}</span>
            </div>
          </div>

          {/* Pilot Identity & Flight Telemetry */}
          <div className="rounded-xl border border-[#B9E7E6] bg-[#E2F4F3]/35 p-4 mb-4">
            <div className="flex items-center gap-3.5">
              {/* Radar Ring Airplane Emblem */}
              <div className="w-14 h-14 rounded-full bg-white border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm shrink-0">
                <Plane className="w-6 h-6 text-[#0891b2] transform -rotate-45" />
              </div>

              {/* Pilot Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#0c282d] truncate">
                    FAHMI BAHTIAR
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2F4F3] border border-[#B9E7E6] text-[#0891b2]">
                    VID: 704291
                  </span>
                </div>
                <p className="text-xs text-[#2d5f68] font-medium truncate mt-0.5">
                  International Virtual Aviation Organisation
                </p>
              </div>
            </div>

            {/* Flight Telemetry / Standby Box */}
            <div className="mt-3.5 pt-3 border-t border-[#B9E7E6]/50">
              {ivaoData?.online ? (
                <div className="bg-white/90 rounded-lg p-2.5 border border-[#B9E7E6] shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#0c282d]">
                      {ivaoData.callsign} &bull; {ivaoData.departure} &rarr; {ivaoData.arrival}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {ivaoData.state || 'EN ROUTE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#527d85]">
                    <span>ALT: {ivaoData.altitude?.toLocaleString()} FT</span>
                    <span>&bull;</span>
                    <span>SPD: {ivaoData.groundSpeed} KTS</span>
                    <span>&bull;</span>
                    <span>HDG: {ivaoData.heading}&deg;</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 bg-white/90 rounded-lg p-2.5 border border-[#B9E7E6] shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shrink-0">
                      <WifiOff className="w-4 h-4 text-[#527d85]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0c282d]">Flight Deck Standby</div>
                      <div className="text-[10px] text-[#527d85] font-mono">Transponder 1200 &bull; VFR Standby</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#527d85] bg-[#E2F4F3] px-2 py-0.5 rounded-full border border-[#B9E7E6] shrink-0">
                    HANGAR
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Footer */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#527d85] pt-2 border-t border-[#B9E7E6]/40">
            <span>FIR: WARR (SEMARANG)</span>
            <a
              href="https://www.ivao.aero/Member.aspx?Id=704291"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0891b2] font-bold hover:underline flex items-center gap-1"
            >
              <span>ivao.aero</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
