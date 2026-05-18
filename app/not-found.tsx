'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const linearEase = (t: number) => t;

const sweepTransition = {
  duration: 10,
  repeat: Infinity,
  ease: linearEase,
};

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(14,116,144,0.2),transparent_60%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.88))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.1)_1px,transparent_1px)] [background-size:32px_32px] opacity-35" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-20 md:flex-row md:items-center md:px-12">
        <div className="max-w-2xl">
          <motion.p
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Radar signal lost
          </motion.p>

          <motion.h1
            className="text-balance text-5xl font-semibold leading-tight text-white md:text-7xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            404 — This page fell off the radar.
          </motion.h1>

          <motion.p
            className="mt-5 text-pretty text-base text-slate-300 md:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            The route you entered is not in the flight plan. Return to the main runway or re-check the navigation path.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Return to home
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>

          </motion.div>

          <motion.div
            className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="h-px w-12 bg-slate-700" />
            Recalibrating radar sweep
          </motion.div>
        </div>

        <div className="hidden md:flex md:items-center">
          <motion.div
            className="relative h-[360px] w-[360px] rounded-full border border-cyan-400/25 bg-[radial-gradient(circle,rgba(6,182,212,0.16),rgba(2,6,23,0.92)_70%)] shadow-[0_0_50px_rgba(56,189,248,0.18)]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_58%,rgba(56,189,248,0.12)_59%,transparent_60%),radial-gradient(circle,transparent_36%,rgba(56,189,248,0.18)_37%,transparent_38%)]" />
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_right,rgba(56,189,248,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.1)_1px,transparent_1px)] [background-size:30px_30px] opacity-70" />
            <motion.div
              className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(34,211,238,0.35),rgba(34,211,238,0.0)_55deg,transparent_95deg)]"
              animate={{ rotate: 360 }}
              transition={sweepTransition}
            />
            <motion.div
              className="absolute left-[62%] top-[35%] h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              animate={{ opacity: [0.4, 1, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[38%] top-[62%] h-2 w-2 rounded-full bg-cyan-300/80 shadow-[0_0_10px_rgba(56,189,248,0.6)]"
              animate={{ opacity: [0.3, 0.9, 0.4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
            <div className="absolute inset-6 rounded-full border border-cyan-400/20" />
            <div className="absolute inset-12 rounded-full border border-cyan-400/10" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
