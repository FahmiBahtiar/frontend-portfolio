'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
  isApiLoaded?: boolean;
  isWarmingUp?: boolean;
  apiError?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Orbital ring of dots around the logo                               */
/* ------------------------------------------------------------------ */
function OrbitalDots() {
  const dots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 72;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          delay: i * 0.12,
          size: i % 3 === 0 ? 4 : 2,
        };
      }),
    [],
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: dot.size,
            height: dot.size,
            left: `calc(50% + ${dot.x}px)`,
            top: `calc(50% + ${dot.y}px)`,
            background: `radial-gradient(circle, rgba(125,211,252,0.9), rgba(56,189,248,0.3))`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{
            delay: dot.delay,
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating ambient particles                                         */
/* ------------------------------------------------------------------ */
function AmbientParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 6 + 8,
        delay: Math.random() * 4,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `rgba(125, 211, 252, ${p.opacity})`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() > 0.5 ? 15 : -15, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Circular progress arc                                              */
/* ------------------------------------------------------------------ */
function ProgressArc({ progress }: { progress: number }) {
  const radius = 62;
  const stroke = 2.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      className="absolute inset-0 m-auto"
      width="160"
      height="160"
      viewBox="0 0 160 160"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background track */}
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke="rgba(148, 163, 184, 0.08)"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <motion.circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo "B" SVG                                                       */
/* ------------------------------------------------------------------ */
function LogoMark() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="loadingLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path
        d="M32 25 h20 c8 0 14 4 14 11 c0 5 -3 8 -7 9 c5 1 9 5 9 11 c0 8 -7 12 -15 12 h-21 z M40 33 v12 h10 c4 0 7 -2 7 -6 c0 -4 -3 -6 -7 -6 z M40 52 v13 h11 c5 0 8 -2 8 -6.5 c0 -4.5 -3 -6.5 -8 -6.5 z"
        fill="url(#loadingLogoGrad)"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main loading screen                                                */
/* ------------------------------------------------------------------ */
export function LoadingScreen({
  onComplete,
  isApiLoaded = false,
  isWarmingUp = false,
  apiError = null,
}: LoadingScreenProps) {
  const [loadingText, setLoadingText] = useState('Initializing');
  const [progress, setProgress] = useState(0);

  // Loading text sequence
  useEffect(() => {
    if (apiError) {
      setLoadingText('Connection failed');
      return;
    }

    if (isWarmingUp) {
      setLoadingText('Warming up server');
      return;
    }

    const messages = [
      { text: 'Initializing', delay: 0 },
      { text: 'Loading assets', delay: 800 },
      { text: 'Preparing experience', delay: 1600 },
    ];

    const timeouts = messages.map(({ text, delay }) =>
      setTimeout(() => setLoadingText(text), delay),
    );

    return () => timeouts.forEach(clearTimeout);
  }, [apiError, isWarmingUp]);

  // Progress bar animation — sync with API loading
  useEffect(() => {
    if (apiError) return;

    if (!isApiLoaded) {
      // When warming up, keep progress oscillating gently around 70-80%
      // to signal activity without implying completion
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (isWarmingUp) {
            // Slow pulse between 65-85 during warming up
            if (prev >= 85) return 65;
            return prev + 1;
          }
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 2;
        });
      }, 200);
      return () => clearInterval(interval);
    }

    // API ready → animate to 100 quickly
    let intervalId: number | null = null;
    setLoadingText('Ready');

    intervalId = window.setInterval(() => {
      setProgress((prev) => {
        const delta = Math.max(2, Math.round((100 - prev) / 4));
        const next = Math.min(100, prev + delta);
        if (next === 100 && intervalId) {
          clearInterval(intervalId);
          setTimeout(() => onComplete(), 150);
        }
        return next;
      });
    }, 50);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isApiLoaded, isWarmingUp, apiError, onComplete]);

  // Fallback auto-complete
  useEffect(() => {
    if (apiError || isApiLoaded) return;
    const timer = setTimeout(() => onComplete(), 15000);
    return () => clearTimeout(timer);
  }, [onComplete, isApiLoaded, apiError]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 40%, #0c1929 0%, #060d19 50%, #020409 100%)',
      }}
    >
      {/* ---- Gradient mesh overlay ---- */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle 600px at 30% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 70%),
            radial-gradient(circle 500px at 70% 70%, rgba(56, 189, 248, 0.08) 0%, transparent 60%),
            radial-gradient(circle 400px at 50% 50%, rgba(125, 211, 252, 0.05) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      {/* ---- Subtle noise grain ---- */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* ---- Ambient particles ---- */}
      <AmbientParticles />

      {/* ---- Central composition ---- */}
      <div className="relative flex flex-col items-center gap-10 z-10 select-none">
        {/* Logo + orbital ring + progress arc */}
        <div className="relative w-[160px] h-[160px] flex items-center justify-center">
          {/* Glow behind logo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              background:
                'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Orbital dots */}
          <OrbitalDots />

          {/* Progress arc */}
          <ProgressArc progress={progress} />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <LogoMark />
          </motion.div>
        </div>

        {/* Name */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1
            className="text-lg md:text-xl tracking-[0.35em] uppercase font-light"
            style={{
              background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fahmi Bahtiar
          </h1>
          <span
            className="text-[11px] tracking-[0.5em] uppercase font-normal"
            style={{ color: 'rgba(148,163,184,0.45)' }}
          >
            Portfolio
          </span>
        </motion.div>

        {/* Status line */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Loading text + blinking dot */}
          <div className="flex items-center gap-2">
            <motion.span
              className="inline-block w-[6px] h-[6px] rounded-full"
              style={{
                background: apiError
                  ? '#f87171'
                  : isWarmingUp
                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                    : 'linear-gradient(135deg, #38bdf8, #7dd3fc)',
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span
              className="text-xs tracking-[0.2em] uppercase font-light"
              style={{
                color: apiError
                  ? '#f87171'
                  : isWarmingUp
                    ? 'rgba(251,191,36,0.75)'
                    : 'rgba(148,163,184,0.6)',
              }}
            >
              {loadingText}
            </span>
          </div>

          {/* Progress percentage */}
          {!apiError && (
            <span
              className="text-[10px] font-light tabular-nums"
              style={{ color: 'rgba(125,211,252,0.45)' }}
            >
              {progress.toFixed(0)}%
            </span>
          )}

          {/* Error message */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 max-w-xs text-center"
            >
              <p
                className="text-[11px] leading-relaxed font-light"
                style={{ color: 'rgba(248,113,113,0.7)' }}
              >
                {apiError}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
