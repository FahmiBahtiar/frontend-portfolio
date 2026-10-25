'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import useSWR from 'swr';
import {
  Sparkles,
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

function cleanText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// ── Isolated Subtitle Typing Pill (Prevents full Hero re-rendering on every keystroke) ─
function TypingRolePill({ subtitles }: { subtitles: string[] }) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [subtitleCharIndex, setSubtitleCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typedSubtitle, setTypedSubtitle] = useState('');

  useEffect(() => {
    if (!subtitles || subtitles.length === 0) return;

    const safeIndex = currentSubtitleIndex % subtitles.length;
    const currentText = subtitles[safeIndex] || '';

    if (!isDeleting) {
      if (subtitleCharIndex < currentText.length) {
        const timer = setTimeout(() => {
          setTypedSubtitle(currentText.slice(0, subtitleCharIndex + 1));
          setSubtitleCharIndex((prev) => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
      } else {
        if (subtitles.length > 1) {
          const timer = setTimeout(() => setIsDeleting(true), 2800);
          return () => clearTimeout(timer);
        }
      }
    } else {
      if (subtitleCharIndex > 0) {
        const timer = setTimeout(() => {
          setSubtitleCharIndex((prev) => prev - 1);
          setTypedSubtitle(currentText.slice(0, subtitleCharIndex - 1));
        }, 28);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
      }
    }
  }, [subtitleCharIndex, isDeleting, currentSubtitleIndex, subtitles]);

  return (
    <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-[#0c282d]">
      {typedSubtitle}
      <span className="inline-block w-[2px] h-[1.1em] bg-[#0891b2] ml-1 align-middle animate-pulse" />
    </span>
  );
}

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

  // Subtitles
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
      return;
    }

    const timers = [
      setTimeout(() => setRevealPhase(1), 100),   // badge / quote
      setTimeout(() => setRevealPhase(2), 240),   // name
      setTimeout(() => setRevealPhase(3), 520),   // subtitle & bio
      setTimeout(() => setRevealPhase(4), 800),   // passion chips & actions
      setTimeout(() => setRevealPhase(5), 1080),  // bento cards & scroll hint
    ];

    return () => timers.forEach(clearTimeout);
  }, [heroProfile, loading, isReady]);

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
      className="relative min-h-screen w-full flex flex-col items-center justify-between bg-[#E2F4F3]"
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
              'radial-gradient(ellipse 75% 55% at 50% 36%, rgba(255, 255, 255, 0.95) 0%, rgba(185, 231, 230, 0.35) 55%, transparent 80%)',
          }}
        />

        {/* Concentric Altitude Rings - Positioned behind headline and smoothly faded out to prevent intersecting lower cards/buttons */}
        <div 
          className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] pointer-events-none opacity-[0.28]"
          style={{
            maskImage: 'radial-gradient(circle 360px at center, black 40%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle 360px at center, black 40%, transparent 85%)',
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 760 760" fill="none">
            {/* Outer Compass Ring */}
            <circle cx="380" cy="380" r="350" stroke="#B9E7E6" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="380" cy="380" r="260" stroke="#B9E7E6" strokeWidth="1.2" />
            <circle cx="380" cy="380" r="160" stroke="#B9E7E6" strokeWidth="1" strokeDasharray="6 6" />
            {/* Lateral Ticks */}
            <line x1="20" y1="380" x2="50" y2="380" stroke="#0891b2" strokeWidth="2" />
            <line x1="710" y1="380" x2="740" y2="380" stroke="#0891b2" strokeWidth="2" />
            <line x1="380" y1="20" x2="380" y2="50" stroke="#0891b2" strokeWidth="2" />
          </svg>
        </div>

        {/* Soft Ambient Mesh Drift */}
        {!calm && (
          <>
            <motion.div
              className="absolute w-[480px] h-[480px] rounded-full opacity-20 will-change-transform"
              style={{
                background: 'radial-gradient(circle, rgba(111, 212, 225, 0.5) 0%, rgba(185, 231, 230, 0.2) 50%, transparent 70%)',
                top: '12%',
                left: '12%',
              }}
              animate={{
                x: [0, 25, -20, 0],
                y: [0, -20, 15, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[420px] h-[420px] rounded-full opacity-15 will-change-transform"
              style={{
                background: 'radial-gradient(circle, rgba(111, 212, 225, 0.45) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 70%)',
                bottom: '15%',
                right: '10%',
              }}
              animate={{
                x: [0, -20, 20, 0],
                y: [0, 15, -15, 0],
              }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Texture Grain */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: GRAIN_SVG,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
      </div>

      {/* ===== HERO CONTENT SECTION ===== */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-8 sm:pb-10 flex flex-col items-center text-center flex-1 justify-center">
        
        {/* Personal Motto / Quote Badge (Clean, elegant, frosted without radar clutter) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={revealPhase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-3 sm:mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#B9E7E6] shadow-sm text-xs font-semibold text-[#1e4a52] hover:border-[#6FD4E1] hover:text-[#0c282d] transition-all">
            <Sparkles className="w-3.5 h-3.5 text-[#0891b2]" />
            <span>&ldquo;{(heroProfile?.badge || "I'm Strong Because I'm Ultraman").replace(/Ultramen/g, 'Ultraman')}&rdquo;</span>
          </div>
        </motion.div>

        {/* Hero Name with Balanced Typography Scale */}
        <motion.div
          ref={nameRef}
          style={calm ? undefined : { x: nameTranslateX, y: nameTranslateY }}
          className={calm ? 'mb-3 sm:mb-4' : 'mb-3 sm:mb-4 will-change-transform'}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black tracking-[-0.04em] leading-[1.04] text-[#0c282d]">
            {nameLines.map((line, i) => (
              <span key={i} className="block overflow-hidden py-0.5 sm:py-1">
                <motion.span
                  className="block text-[#0c282d]"
                  initial={{ y: '105%', opacity: 0 }}
                  animate={revealPhase >= 2 ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
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
          initial={{ opacity: 0, y: 12 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-3 sm:mb-3.5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/90 border border-[#B9E7E6] shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-[#0891b2]" />
            <TypingRolePill subtitles={subtitles} />
          </div>
        </motion.div>

        {/* Bio Description with High Contrast */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#1e4a52] text-sm sm:text-base max-w-2xl leading-relaxed mb-6 sm:mb-7 font-medium"
        >
          {heroProfile?.description ||
            'Backend developer, data scientist and cybersecurity enthusiast with a passion for aviation and mountaineering, building secure, data-driven systems and exploring new heights on and off the ground.'}
        </motion.p>

        {/* Passion / Tech Chips (ALPHA, BRAVO, CHARLIE) - Substantial & Spacious */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-7 w-full"
        >
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
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
                  className="group flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white/95 border border-[#B9E7E6] shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all cursor-default"
                >
                  <div className="h-9 w-9 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm group-hover:bg-[#6FD4E1]/20 transition-colors">
                    <IconComponent className="h-4.5 w-4.5 text-[#0891b2]" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-mono text-[#0891b2] tracking-[0.2em] uppercase font-bold">
                      {item.callsign}
                    </div>
                    <div className="text-sm font-bold text-[#0c282d] tracking-tight">
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
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-8 sm:mb-9"
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

        {/* ===== BENTO COMMAND TELEMETRY GRID (Spacious, High-Impact & Full Width) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={revealPhase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mb-7 sm:mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-left">
            {/* Card 1: System Status */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/95 p-6 sm:p-7 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#0891b2]" />
                    <span className="text-xs text-[#527d85] uppercase tracking-[0.18em] font-extrabold font-mono">
                      SYSTEM STATUS
                    </span>
                  </div>
                  <span className="text-xs text-emerald-700 font-mono uppercase tracking-wider font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    LIVE
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0c282d] leading-snug">
                  {heroProfile?.status || 'Software Engineer at Pura Group'}
                </h3>
              </div>
              <p className="text-xs sm:text-[13px] text-[#2d5f68] font-semibold mt-3 pt-3 border-t border-[#B9E7E6]/40">
                Active Career Deployment
              </p>
            </div>

            {/* Card 2: Location & Coordinates */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/95 p-6 sm:p-7 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#0891b2]" />
                    <span className="text-xs text-[#527d85] uppercase tracking-[0.18em] font-extrabold font-mono">
                      BASE COORDINATES
                    </span>
                  </div>
                  <span className="text-xs text-[#0891b2] font-mono font-bold bg-[#E2F4F3] border border-[#B9E7E6] px-2.5 py-0.5 rounded-full">
                    ID
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0c282d] leading-snug">
                  {heroProfile?.location || 'Semarang, Indonesia'}
                </h3>
              </div>
              <p className="text-xs sm:text-[13px] text-[#2d5f68] font-mono font-semibold mt-3 pt-3 border-t border-[#B9E7E6]/40">
                7°00&apos;S 110°24&apos;E • Central Java
              </p>
            </div>

            {/* Card 3: Audio Telemetry (Spotify) */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/95 p-6 sm:p-7 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between min-h-[145px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#0891b2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="text-xs text-[#527d85] uppercase tracking-[0.18em] font-extrabold font-mono">
                      AUDIO TELEMETRY
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    spotifyData?.isPlaying ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6]'
                  }`}>
                    {spotifyData?.isPlaying ? 'PLAYING' : 'STANDBY'}
                  </span>
                </div>

                {spotifyLoading ? (
                  <p className="text-xs sm:text-sm text-[#527d85] font-semibold py-1">Connecting telemetry...</p>
                ) : spotifyData?.isPlaying && spotifyData.song ? (
                  <div className="flex items-center gap-3.5 pt-1">
                    {spotifyData.song.albumImageUrl && (
                      <Image
                        src={spotifyData.song.albumImageUrl}
                        alt={spotifyData.song.title}
                        width={46}
                        height={46}
                        className="rounded-xl border border-[#B9E7E6] shadow-sm shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#0c282d] truncate">
                        {cleanText(spotifyData.song.title)}
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#2d5f68] font-semibold truncate">{cleanText(spotifyData.song.artist)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-1">
                    <Disc className="w-6 h-6 text-[#0891b2] opacity-70 animate-spin" style={{ animationDuration: '8s' }} />
                    <div>
                      <h4 className="text-sm font-bold text-[#0c282d]">Radio Silent</h4>
                      <p className="text-xs text-[#527d85] font-medium">Cockpit audio on standby</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Equalizer / Waveform Graphic */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#B9E7E6]/40">
                {[14, 22, 16, 26, 18, 10].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-[#0891b2]/60 rounded-full"
                    style={{
                      height: `${spotifyData?.isPlaying ? h : 4}px`,
                      animation: spotifyData?.isPlaying ? `pulse 1.${i+2}s infinite ease-in-out` : 'none',
                    }}
                  />
                ))}
                <span className="text-xs font-mono text-[#527d85] font-semibold ml-2">
                  {spotifyData?.isPlaying ? 'STREAM LIVE' : 'STATION 108.5'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Explorer Prompt (Clear, well-spaced, unobstructed by any background lines) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={revealPhase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-1.5 cursor-pointer group mt-1"
          onClick={() => onNavigate(1)}
        >
          <div className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#B9E7E6] shadow-sm flex items-center gap-2 group-hover:border-[#6FD4E1] transition-all">
            <span className="text-[11px] text-[#0c282d] font-bold tracking-[0.2em] uppercase font-mono group-hover:text-[#0891b2] transition-colors">
              Scroll to explore
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#0891b2] group-hover:translate-y-0.5 transition-transform" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
