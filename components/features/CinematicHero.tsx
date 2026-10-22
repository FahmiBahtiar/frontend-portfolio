'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import useSWR from 'swr';
import {
  Compass,
  Code2,
  Plane,
  Mountain,
  MapPin,
  ChevronDown,
  ArrowDown,
  Radio,
  Disc,
  Activity,
  Terminal,
} from 'lucide-react';
import { HeroService } from '@/lib/services/hero';
import { SpotifyService } from '@/lib/services/spotify';
import { useIsLiteGraphics } from '@/components/providers/GraphicsModeProvider';
import { useIsMobile } from '@/components/ui/use-mobile';
import Image from 'next/image';

interface CinematicHeroProps {
  onNavigate: (page: number) => void;
  isReady?: boolean;
}

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export function CinematicHero({ onNavigate, isReady = true }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const lite = useIsLiteGraphics();
  const isMobile = useIsMobile();
  const calm = lite || isMobile;

  const { data: heroProfile, isLoading: loading } = useSWR(
    'heroProfile',
    () => HeroService.getHeroProfile(),
    { errorRetryCount: 3, errorRetryInterval: 1000 }
  );

  const { data: spotifyData, isLoading: spotifyLoading } = useSWR(
    'spotifyData',
    () => SpotifyService.getNowPlaying(),
    { refreshInterval: 30000, errorRetryCount: 3, dedupingInterval: 10000 }
  );

  // ---- Subtitle typing rotation ----
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [subtitleCharIndex, setSubtitleCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const subtitles = useMemo(() => heroProfile?.titles || ['Software Engineer', 'Data Scientist', 'Backend Developer'], [heroProfile]);

  // ---- Orchestrated reveal state ----
  const [revealPhase, setRevealPhase] = useState(0);

  // ---- Magnetic cursor effect for name (desktop) ----
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 75, damping: 25, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 75, damping: 25, mass: 0.8 });
  const nameTranslateX = useTransform(springX, [-500, 500], [-8, 8]);
  const nameTranslateY = useTransform(springY, [-500, 500], [-5, 5]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!nameRef.current) return;
    const rect = nameRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // ---- Orchestrated reveal sequence triggered on isReady ----
  useEffect(() => {
    if (!heroProfile || loading) return;
    if (!isReady) {
      setRevealPhase(0);
      setTypedSubtitle('');
      setSubtitleCharIndex(0);
      setIsDeleting(false);
      return;
    }

    const timers = [
      setTimeout(() => setRevealPhase(1), 100),   // badge
      setTimeout(() => setRevealPhase(2), 250),   // name
      setTimeout(() => setRevealPhase(3), 550),   // subtitle & bio
      setTimeout(() => setRevealPhase(4), 850),   // passion chips & actions
      setTimeout(() => setRevealPhase(5), 1150),  // bento cards & scroll hint
    ];

    return () => timers.forEach(clearTimeout);
  }, [heroProfile, loading, isReady]);

  // ---- Subtitle typing with delete effect ----
  useEffect(() => {
    if (revealPhase < 3) return;

    if (calm) {
      setTypedSubtitle(subtitles[0] ?? '');
      return;
    }

    const currentText = subtitles[currentSubtitleIndex];

    if (!isDeleting) {
      if (subtitleCharIndex < currentText.length) {
        const timer = setTimeout(() => {
          setTypedSubtitle(currentText.slice(0, subtitleCharIndex + 1));
          setSubtitleCharIndex(prev => prev + 1);
        }, 40);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setIsDeleting(true), 2500);
        return () => clearTimeout(timer);
      }
    } else {
      if (subtitleCharIndex > 0) {
        const timer = setTimeout(() => {
          setSubtitleCharIndex(prev => prev - 1);
          setTypedSubtitle(currentText.slice(0, subtitleCharIndex - 1));
        }, 25);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
      }
    }
  }, [subtitleCharIndex, isDeleting, currentSubtitleIndex, subtitles, revealPhase, calm]);

  // Split name for balanced monumental typography
  const nameLines = useMemo(() => {
    const fullName = heroProfile?.name || 'Fahmi Bahtiar Adi Nugroho';
    const words = fullName.split(' ');
    if (words.length <= 2) return [fullName];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }, [heroProfile]);

  // Tech stack icon mapping
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Code2,
    Plane,
    Mountain,
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#E2F4F3]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ===== BACKGROUND AERO-TOPOGRAPHIC ATMOSPHERE ===== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Subtle Radial Pure White Glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 38%, rgba(255, 255, 255, 0.95) 0%, rgba(185, 231, 230, 0.35) 55%, transparent 80%)',
          }}
        />

        {/* Concentric Altitude / Flight Telemetry Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none opacity-[0.35]">
          <svg className="w-full h-full" viewBox="0 0 900 900" fill="none">
            {/* Outer Compass Ring */}
            <circle cx="450" cy="450" r="420" stroke="#B9E7E6" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="450" cy="450" r="300" stroke="#B9E7E6" strokeWidth="1.2" />
            <circle cx="450" cy="450" r="180" stroke="#B9E7E6" strokeWidth="1" strokeDasharray="6 6" />
            {/* Crosshair Cardinal Ticks */}
            <line x1="450" y1="20" x2="450" y2="50" stroke="#0891b2" strokeWidth="2" />
            <line x1="450" y1="850" x2="450" y2="880" stroke="#0891b2" strokeWidth="2" />
            <line x1="20" y1="450" x2="50" y2="450" stroke="#0891b2" strokeWidth="2" />
            <line x1="850" y1="450" x2="880" y2="450" stroke="#0891b2" strokeWidth="2" />
          </svg>
        </div>

        {/* Soft Ambient Mesh Drift */}
        {!calm && (
          <>
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full opacity-20 will-change-transform"
              style={{
                background: 'radial-gradient(circle, rgba(111, 212, 225, 0.5) 0%, rgba(185, 231, 230, 0.2) 50%, transparent 70%)',
                top: '15%',
                left: '12%',
              }}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -25, 15, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[450px] h-[450px] rounded-full opacity-15 will-change-transform"
              style={{
                background: 'radial-gradient(circle, rgba(111, 212, 225, 0.45) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 70%)',
                bottom: '15%',
                right: '10%',
              }}
              animate={{
                x: [0, -25, 25, 0],
                y: [0, 20, -20, 0],
              }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Texture Grain */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: GRAIN_SVG,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
      </div>

      {/* ===== HERO CONTENT SECTION ===== */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-24 flex flex-col items-center text-center">
        
        {/* Eyebrow Badge with Active Beacon */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={revealPhase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 sm:mb-6"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-[#B9E7E6] shadow-[0_2px_12px_rgba(111,212,225,0.15)] text-[#0c282d] text-xs font-bold tracking-wide hover:border-[#6FD4E1] transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6FD4E1] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0891b2]" />
            </span>
            <Compass className="w-3.5 h-3.5 text-[#0891b2]" />
            <span>{(heroProfile?.badge || "I'm Strong Because I'm Ultraman").replace(/Ultramen/g, 'Ultraman')}</span>
            <span className="text-[#B9E7E6]">|</span>
            <span className="text-[10px] font-mono font-extrabold text-[#0891b2] tracking-wider uppercase">RADAR ACTIVE</span>
          </div>
        </motion.div>

        {/* Hero Name with Monumental Typography */}
        <motion.div
          ref={nameRef}
          style={calm ? undefined : { x: nameTranslateX, y: nameTranslateY }}
          className={calm ? 'mb-5 sm:mb-6' : 'mb-5 sm:mb-6 will-change-transform'}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[1.02] text-[#0c282d]">
            {nameLines.map((line, i) => (
              <span key={i} className="block overflow-hidden py-0.5 sm:py-1">
                <motion.span
                  className="block text-[#0c282d]"
                  initial={{ y: '105%', opacity: 0 }}
                  animate={revealPhase >= 2 ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
                  transition={{
                    duration: 0.85,
                    delay: i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
        </motion.div>

        {/* Dynamic Monospace Role Pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 sm:mb-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/90 border border-[#B9E7E6] shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-[#0891b2]" />
            <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-[#0c282d]">
              {typedSubtitle}
              <motion.span
                animate={calm ? undefined : { opacity: [1, 0, 1] }}
                transition={calm ? undefined : { duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-[2px] h-[1.1em] bg-[#0891b2] ml-1 align-middle"
              />
            </span>
          </div>
        </motion.div>

        {/* Bio Description with High Contrast */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#1e4a52] text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mb-8 sm:mb-9 font-medium"
        >
          {heroProfile?.description ||
            'Backend developer, data scientist and cybersecurity enthusiast with a passion for aviation and mountaineering, building secure, data-driven systems and exploring new heights on and off the ground.'}
        </motion.p>

        {/* Passion / Tech Chips (ALPHA, BRAVO, CHARLIE) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 sm:mb-10 w-full"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {(heroProfile?.techStack || [
              { callsign: 'ALPHA-01', label: 'Development', icon: 'Code2' },
              { callsign: 'BRAVO-02', label: 'Aviation', icon: 'Plane' },
              { callsign: 'CHARLIE-03', label: 'Mountaineer', icon: 'Mountain' },
            ]).map((item, idx) => {
              const IconComponent = iconMap[item.icon] || Code2;
              const displayLabel = item.label.toLowerCase() === 'mountainner' ? 'Mountaineer' : item.label;
              return (
                <motion.div
                  key={item.callsign || idx}
                  whileHover={{ y: -3 }}
                  className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 border border-[#B9E7E6] shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all cursor-default"
                >
                  <div className="h-8 w-8 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm group-hover:bg-[#6FD4E1]/20 transition-colors">
                    <IconComponent className="h-4 w-4 text-[#0891b2]" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-mono text-[#0891b2] tracking-[0.2em] uppercase font-bold">
                      {item.callsign}
                    </div>
                    <div className="text-xs sm:text-sm text-[#0c282d] font-bold tracking-tight">
                      {displayLabel}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive Call-to-Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-10 sm:mb-12"
        >
          <button
            onClick={() => onNavigate(3)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6FD4E1] hover:bg-[#B9E7E6] text-[#0c282d] font-bold text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Explore Projects & Flights</span>
            <ArrowDown className="w-4 h-4 text-[#0c282d]" />
          </button>
          <button
            onClick={() => onNavigate(4)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#E2F4F3] border border-[#B9E7E6] text-[#0c282d] font-bold text-sm shadow-sm transition-all hover:border-[#6FD4E1] hover:-translate-y-0.5 active:translate-y-0"
          >
            <Radio className="w-4 h-4 text-[#0891b2]" />
            <span>Contact Flight Deck</span>
          </button>
        </motion.div>

        {/* ===== BENTO COMMAND TELEMETRY GRID ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={revealPhase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mb-10 sm:mb-14"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Card 1: System Status */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/95 p-5 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#0891b2]" />
                    <span className="text-[10px] text-[#527d85] uppercase tracking-[0.2em] font-extrabold font-mono">
                      SYSTEM STATUS
                    </span>
                  </div>
                  <span className="text-[10px] text-[#0891b2] font-mono uppercase tracking-wider font-bold bg-[#E2F4F3] border border-[#6FD4E1] px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#0c282d] leading-snug">
                  {heroProfile?.status || 'Software Engineer at Pura Group'}
                </h3>
              </div>
              <p className="text-[11px] text-[#527d85] font-semibold mt-3 pt-2 border-t border-[#B9E7E6]/40">
                Active Career Deployment
              </p>
            </div>

            {/* Card 2: Location & Coordinates */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/95 p-5 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0891b2]" />
                    <span className="text-[10px] text-[#527d85] uppercase tracking-[0.2em] font-extrabold font-mono">
                      BASE COORDINATES
                    </span>
                  </div>
                  <span className="text-[10px] text-[#0891b2] font-mono font-bold bg-[#E2F4F3] border border-[#B9E7E6] px-2 py-0.5 rounded-full">
                    ID
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#0c282d] leading-snug">
                  {heroProfile?.location || 'Semarang, Indonesia'}
                </h3>
              </div>
              <p className="text-[11px] text-[#527d85] font-mono font-semibold mt-3 pt-2 border-t border-[#B9E7E6]/40">
                7°00&apos;S 110°24&apos;E • Central Java
              </p>
            </div>

            {/* Card 3: Audio Telemetry (Spotify) */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/95 p-5 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[#0891b2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="text-[10px] text-[#527d85] uppercase tracking-[0.2em] font-extrabold font-mono">
                      AUDIO TELEMETRY
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    spotifyData?.isPlaying ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6]'
                  }`}>
                    {spotifyData?.isPlaying ? 'PLAYING' : 'STANDBY'}
                  </span>
                </div>

                {spotifyLoading ? (
                  <p className="text-xs text-[#527d85] font-semibold py-1">Connecting telemetry...</p>
                ) : spotifyData?.isPlaying && spotifyData.song ? (
                  <div className="flex items-center gap-3 pt-1">
                    {spotifyData.song.albumImageUrl && (
                      <Image
                        src={spotifyData.song.albumImageUrl}
                        alt={spotifyData.song.title}
                        width={36}
                        height={36}
                        className="rounded-lg border border-[#B9E7E6] shadow-sm shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-[#0c282d] truncate">
                        {spotifyData.song.title}
                      </h4>
                      <p className="text-[11px] text-[#2d5f68] font-semibold truncate">{spotifyData.song.artist}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 pt-1">
                    <Disc className="w-5 h-5 text-[#0891b2] opacity-70 animate-spin" style={{ animationDuration: '8s' }} />
                    <div>
                      <h4 className="text-xs font-bold text-[#0c282d]">Radio Silent</h4>
                      <p className="text-[11px] text-[#527d85] font-medium">Cockpit audio on standby</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Equalizer / Waveform Graphic */}
              <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#B9E7E6]/40">
                {[12, 18, 14, 22, 16, 8].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-[#0891b2]/60 rounded-full"
                    style={{
                      height: `${spotifyData?.isPlaying ? h : 4}px`,
                      animation: spotifyData?.isPlaying ? `pulse 1.${i+2}s infinite ease-in-out` : 'none',
                    }}
                  />
                ))}
                <span className="text-[10px] font-mono text-[#527d85] font-semibold ml-2">
                  {spotifyData?.isPlaying ? 'STREAM LIVE' : 'STATION 108.5'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Explorer Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={revealPhase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate(1)}
        >
          <div className="px-3.5 py-1.5 rounded-full bg-white/80 border border-[#B9E7E6] shadow-sm flex items-center gap-2 group-hover:border-[#6FD4E1] transition-all">
            <span className="text-[10px] text-[#0c282d] font-bold tracking-[0.2em] uppercase font-mono group-hover:text-[#0891b2] transition-colors">
              Scroll to explore
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#0891b2] group-hover:translate-y-0.5 transition-transform" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
