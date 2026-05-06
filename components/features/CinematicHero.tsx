'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import useSWR from 'swr';
import { Sparkles, Code2, Plane, Mountain, MapPin, ChevronDown } from 'lucide-react';
import { HeroService } from '@/lib/services/hero';
import { SpotifyService } from '@/lib/services/spotify';
import Image from 'next/image';

interface CinematicHeroProps {
  onNavigate: (page: number) => void;
}

// Noise grain SVG filter as data URI
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export function CinematicHero({ onNavigate }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // ---- Data fetching (same SWR hooks) ----
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
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const nameTranslateX = useTransform(springX, [-400, 400], [-6, 6]);
  const nameTranslateY = useTransform(springY, [-400, 400], [-4, 4]);

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
      setTimeout(() => setRevealPhase(1), 100),   // badge
      setTimeout(() => setRevealPhase(2), 300),   // name
      setTimeout(() => setRevealPhase(3), 700),   // subtitle + desc
      setTimeout(() => setRevealPhase(4), 1100),  // info grid
      setTimeout(() => setRevealPhase(5), 1500),  // scroll hint
    ];

    return () => timers.forEach(clearTimeout);
  }, [heroProfile, loading]);

  // ---- Subtitle typing with delete effect ----
  useEffect(() => {
    if (revealPhase < 3) return;

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
  }, [subtitleCharIndex, isDeleting, currentSubtitleIndex, subtitles, revealPhase]);

  // Split name into lines for dramatic reveal
  const nameLines = useMemo(() => {
    if (!heroProfile?.name) return [];
    const words = heroProfile.name.split(' ');
    if (words.length <= 2) return [heroProfile.name];
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

        {/* Layer 2: Gradient mesh orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.8) 0%, transparent 70%)',
              top: '10%',
              left: '15%',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 20, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%)',
              bottom: '20%',
              right: '10%',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 20, -30, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.8) 0%, transparent 70%)',
              top: '50%',
              left: '60%',
              filter: 'blur(100px)',
            }}
            animate={{
              x: [0, 20, -40, 0],
              y: [0, -40, 10, 0],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Layer 3: Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Layer 4: Noise grain overlay */}
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

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={revealPhase >= 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[13px] text-slate-300 tracking-wide">{heroProfile?.badge || ''}</span>
          </div>
        </motion.div>

        {/* Name — the hero */}
        <motion.div
          ref={nameRef}
          style={{ x: nameTranslateX, y: nameTranslateY }}
          className="mb-6 sm:mb-8 will-change-transform"
        >
          {nameLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={revealPhase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className=""
            >
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] text-white"
                style={{
                  textShadow: '0 0 80px rgba(56, 189, 248, 0.15)',
                }}
              >
                {line}
              </h1>
            </motion.div>
          ))}
        </motion.div>

        {/* Subtitle with typing effect */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-4 sm:mb-5 h-8 flex items-center justify-center"
        >
          <span className="text-base sm:text-lg md:text-xl text-slate-400 font-mono tracking-wide">
            {typedSubtitle}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-[2px] h-[1.1em] bg-cyan-400 ml-0.5 align-middle"
            />
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={revealPhase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed mb-10 sm:mb-14"
        >
          {heroProfile?.description || ''}
        </motion.p>

        {/* ===== BENTO INFO GRID ===== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-2xl mb-10 sm:mb-14"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0 }}
              className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400/40"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="relative w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-medium">Status</span>
              </div>
              <p className="text-sm text-emerald-400 font-medium">{heroProfile?.status || ''}</p>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-medium">Location</span>
              </div>
              <p className="text-sm text-slate-300 font-medium">{heroProfile?.location || ''}</p>
            </motion.div>

            {/* Spotify */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 col-span-2 md:col-span-1"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  {spotifyData?.isPlaying && (
                    <motion.div
                      className="absolute -inset-0.5 rounded-full bg-[#1DB954]/30"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <svg className="w-3.5 h-3.5 text-[#1DB954] relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-medium">Now Playing</span>
              </div>

              {spotifyLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : spotifyData?.isPlaying && spotifyData.song ? (
                <div className="flex items-center gap-2.5">
                  {spotifyData.song.albumImageUrl && (
                    <Image
                      src={spotifyData.song.albumImageUrl}
                      alt={spotifyData.song.title}
                      width={28}
                      height={28}
                      className="rounded shadow-sm"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[#1DB954] truncate block font-medium">
                      {spotifyData.song.title}
                    </span>
                    <p className="text-xs text-slate-500 truncate">{spotifyData.song.artist}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Not listening</p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ===== TECH STACK / PASSIONS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={revealPhase >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12 sm:mb-16"
        >
          {(heroProfile?.techStack || []).map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Code2;
            const colors = colorMap[item.icon] || colorMap.Code2;
            return (
              <motion.div
                key={item.callsign}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={revealPhase >= 4 ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.25 + idx * 0.06 }}
                whileHover={{ y: -3, scale: 1.04 }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${colors.bg} border ${colors.border} hover:shadow-lg ${colors.glow} transition-all duration-300 cursor-default`}
              >
                <IconComponent className={`w-4 h-4 ${colors.accent}`} />
                <div className="flex flex-col">
                  <span className={`text-[9px] font-mono ${colors.accent} tracking-[0.15em] uppercase opacity-70`}>
                    {item.callsign}
                  </span>
                  <span className="text-xs text-slate-300">{item.label}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ===== SCROLL HINT ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealPhase >= 5 ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate(1)}
        >
          <span className="text-[11px] text-slate-600 tracking-[0.2em] uppercase group-hover:text-slate-400 transition-colors">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </motion.div>
        </motion.div>
      </div>


    </div>
  );
}
