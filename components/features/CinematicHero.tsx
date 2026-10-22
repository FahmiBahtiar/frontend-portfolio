'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import useSWR from 'swr';
import { Compass, Code2, Plane, Mountain, MapPin, ChevronDown } from 'lucide-react';
import { HeroService } from '@/lib/services/hero';
import { SpotifyService } from '@/lib/services/spotify';
import { useIsLiteGraphics } from '@/components/providers/GraphicsModeProvider';
import { useIsMobile } from '@/components/ui/use-mobile';
import Image from 'next/image';

interface CinematicHeroProps {
  onNavigate: (page: number) => void;
}

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export function CinematicHero({ onNavigate }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const lite = useIsLiteGraphics();
  const isMobile = useIsMobile();
  // On weak/mobile CPUs, run a calm variant: static background orbs, no typing
  // loop, no infinite blink/pulse. Desktop keeps the full animated experience.
  const calm = lite || isMobile;

  const { data: heroProfile, isLoading: loading } = useSWR(
    'heroProfile',
    () => HeroService.getHeroProfile(),
    { errorRetryCount: 3, errorRetryInterval: 1000 }
  );

  const { data: socialLinks = [] } = useSWR(
    'socialLinks',
    () => HeroService.getSocialLinks(),
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

  const subtitles = useMemo(() => heroProfile?.titles || ['Loading...'], [heroProfile]);

  // ---- Orchestrated reveal state ----
  const [revealPhase, setRevealPhase] = useState(0);
  // 0 = nothing, 1 = badge, 2 = name, 3 = subtitle+desc, 4 = info grid, 5 = scroll hint

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

  // ---- Mount ----
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ---- Orchestrated reveal sequence ----
  useEffect(() => {
    if (!heroProfile || loading) return;

    const timers = [
      setTimeout(() => setRevealPhase(1), 60),    // badge
      setTimeout(() => setRevealPhase(2), 200),   // name
      setTimeout(() => setRevealPhase(3), 650),   // subtitle + desc
      setTimeout(() => setRevealPhase(4), 1050),  // info grid
      setTimeout(() => setRevealPhase(5), 1450),  // scroll hint
    ];

    return () => timers.forEach(clearTimeout);
  }, [heroProfile, loading]);

  // ---- Subtitle typing with delete effect ----
  useEffect(() => {
    if (revealPhase < 3) return;

    // Calm mode (mobile/lite): show the first subtitle in full and skip the
    // 25-40Hz setTimeout re-render loop entirely (big main-thread saving).
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
        // Pause before deleting
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

  // Split name into lines. Use a static fallback so the <h1> (the LCP element)
  // can paint immediately on mount instead of waiting for the API — the real
  // name from the API replaces it seamlessly once loaded.
  const nameLines = useMemo(() => {
    const fullName = heroProfile?.name || 'Fahmi Bahtiar Adi Nugroho';
    const words = fullName.split(' ');
    if (words.length <= 2) return [fullName];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }, [heroProfile]);

  // Tech stack icon mapping
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Code2, Plane, Mountain
  };

  const colorMap: Record<string, { accent: string; bg: string; border: string; glow: string }> = {
    Code2: { accent: 'text-cyan-400', bg: 'bg-cyan-500/8', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/10' },
    Plane: { accent: 'text-sky-400', bg: 'bg-sky-500/8', border: 'border-sky-500/20', glow: 'shadow-sky-500/10' },
    Mountain: { accent: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ===== BACKGROUND LAYERS (all faded at bottom to blend with page) ===== */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
        }}
      >
        {/* Layer 1: Subtle decorative glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 45% at 50% 35%, rgba(15, 23, 42, 0.6) 0%, transparent 70%)',
          }}
        />

        {/* Layer 2: Gradient mesh orbs. In lite mode (no GPU), the blur filter is
            stripped by global CSS and the infinite transform loops would still burn
            CPU — so render a single static, blur-free ambient gradient instead. */}
        <div className="absolute inset-0 overflow-hidden">
          {calm ? (
            <div
              className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
              style={{
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, transparent 70%)',
                top: '10%',
                left: '20%',
              }}
            />
          ) : (
            <>
              <motion.div
                className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] will-change-transform"
                style={{
                  // No blur() filter: animating x/y on a blurred layer forces a
                  // full re-raster every frame (scroll jank). A multi-stop radial
                  // gradient keeps the soft glow while the transform stays on the
                  // compositor — cheap to animate.
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(56, 189, 248, 0.12) 40%, transparent 72%)',
                  top: '10%',
                  left: '15%',
                }}
                whileInView={{
                  x: [0, 40, -20, 0],
                  y: [0, -30, 20, 0],
                }}
                viewport={{ once: false, amount: 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] will-change-transform"
                style={{
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.55) 0%, rgba(99, 102, 241, 0.12) 40%, transparent 72%)',
                  bottom: '20%',
                  right: '10%',
                }}
                whileInView={{
                  x: [0, -30, 20, 0],
                  y: [0, 20, -30, 0],
                }}
                viewport={{ once: false, amount: 0 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04] will-change-transform"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 211, 238, 0.55) 0%, rgba(34, 211, 238, 0.12) 40%, transparent 72%)',
                  top: '50%',
                  left: '60%',
                }}
                whileInView={{
                  x: [0, 20, -40, 0],
                  y: [0, -40, 10, 0],
                }}
                viewport={{ once: false, amount: 0 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </div>

        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: GRAIN_SVG,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />

        {/* Layer 5: Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(6, 6, 18, 0.5) 100%)',
          }}
        />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-28 flex flex-col items-center text-center">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={revealPhase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#B9E7E6] text-[#0c282d] text-xs font-semibold tracking-wide shadow-sm hover:border-[#6FD4E1] transition-colors duration-300">
            <Compass className="w-3.5 h-3.5 text-[#0891b2]" />
            <span>{(heroProfile?.badge || '').replace(/Ultramen/g, 'Ultraman')}</span>
          </div>
        </motion.div>

        {/* Name — the hero with solid, confident typography */}
        <motion.div
          ref={nameRef}
          style={calm ? undefined : { x: nameTranslateX, y: nameTranslateY }}
          className={calm ? 'mb-6 sm:mb-8' : 'mb-6 sm:mb-8 will-change-transform'}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.035em] leading-[1.05] text-[#0c282d]">
            {nameLines.map((line, i) => (
              <span key={i} className="block overflow-hidden py-0.5 sm:py-1">
                <motion.span
                  className="block text-[#0c282d]"
                  initial={{ y: '105%', opacity: 0 }}
                  animate={revealPhase >= 2 ? { y: '0%', opacity: 1 } : {}}
                  transition={{
                    duration: 0.85,
                    delay: i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
        </motion.div>

        {/* Subtitle with typing effect */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 sm:mb-5 h-8 flex items-center justify-center"
        >
          <span className="text-base sm:text-lg md:text-xl text-[#164e63] font-mono tracking-normal font-medium">
            {typedSubtitle}
            <motion.span
              animate={calm ? undefined : { opacity: [1, 0, 1] }}
              transition={calm ? undefined : { duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-[2px] h-[1.1em] bg-[#0891b2] ml-1 align-middle"
            />
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#2d5f68] text-sm sm:text-base max-w-xl leading-relaxed mb-10 sm:mb-14 font-normal"
        >
          {heroProfile?.description || ''}
        </motion.p>

        {/* ===== TECH STACK / PASSIONS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {(heroProfile?.techStack || []).map((item, idx) => {
              const IconComponent = iconMap[item.icon] || Code2;
              const displayLabel = item.label.toLowerCase() === 'mountainner' ? 'Mountaineer' : item.label;
              return (
                <motion.div
                  key={item.callsign}
                  initial={{ opacity: 0, y: 14 }}
                  animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.15 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/90 border border-[#B9E7E6] hover:border-[#6FD4E1] shadow-sm transition-all duration-300"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2]">
                    <IconComponent className="h-3.5 w-3.5 text-[#0891b2]" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] font-mono text-[#0891b2] tracking-[0.2em] uppercase font-bold">
                      {item.callsign}
                    </div>
                    <div className="text-xs text-[#0c282d] font-semibold tracking-wide">
                      {displayLabel}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ===== BENTO INFO GRID ===== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mb-10 sm:mb-14"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/90 px-5 py-4 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#6FD4E1]" />
                  <span className="text-[11px] text-[#527d85] uppercase tracking-[0.18em] font-semibold font-mono">Status</span>
                </div>
                <span className="text-[10px] text-[#0891b2] font-mono uppercase tracking-[0.15em] font-bold">Live</span>
              </div>
              <p className="relative mt-2 text-sm text-[#0c282d] font-bold tracking-wide">
                {heroProfile?.status || ''}
              </p>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.33, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/90 px-5 py-4 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="relative flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0891b2]" />
                <span className="text-[11px] text-[#527d85] uppercase tracking-[0.18em] font-semibold font-mono">Location</span>
              </div>
              <p className="relative mt-2 text-sm text-[#0c282d] font-bold tracking-wide">
                {heroProfile?.location || ''}
              </p>
            </motion.div>

            {/* Spotify */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.41, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-[#B9E7E6] bg-white/90 px-5 py-4 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="relative flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#0891b2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="text-[11px] text-[#527d85] uppercase tracking-[0.18em] font-semibold font-mono">Now Playing</span>
              </div>

              {spotifyLoading ? (
                <p className="relative mt-2 text-sm text-slate-400">Loading...</p>
              ) : spotifyData?.isPlaying && spotifyData.song ? (
                <div className="relative mt-2 flex items-center gap-3">
                  {spotifyData.song.albumImageUrl && (
                    <Image
                      src={spotifyData.song.albumImageUrl}
                      alt={spotifyData.song.title}
                      width={32}
                      height={32}
                      className="rounded-md border border-slate-700/60 shadow-sm"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-200 truncate block font-semibold">
                      {spotifyData.song.title}
                    </span>
                    <p className="text-xs text-slate-400 truncate">{spotifyData.song.artist}</p>
                  </div>
                </div>
              ) : (
                <p className="relative mt-2 text-sm text-slate-500">Not listening</p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ===== SCROLL HINT ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={revealPhase >= 5 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate(1)}
        >
          <span className="text-[11px] text-slate-400 tracking-[0.2em] uppercase group-hover:text-slate-200 transition-colors">
            Scroll to explore
          </span>
          <motion.div
            animate={calm ? undefined : { y: [0, 6, 0] }}
            transition={calm ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </motion.div>
        </motion.div>
      </div>


    </div>
  );
}
