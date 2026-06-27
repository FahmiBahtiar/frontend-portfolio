'use client';

// "Scroll Story" journey timeline — a cinematic, scroll-driven replacement for
// the flight-trajectory visual. The vertical spine draws itself as you scroll
// (bound to scroll progress, not a timer), a glowing comet rides the tip, and
// each milestone fades/slides in as it reaches the viewport center. Because the
// user controls the tempo, it never feels mechanical ("kaku"), and there's no
// loud metaphor to fight the content. Reuses buildWaypoints() so it stays in
// sync with the same Education/CMS data the old visuals consumed.

import { useRef } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import type { Education } from '@/lib/types/admin';
import { buildWaypoints, type Waypoint } from '@/lib/features/flight-trajectory-data';

export function JourneyScrollStory({
  educationRecords,
}: {
  educationRecords?: Education[];
}) {
  const waypoints = buildWaypoints(educationRecords);
  const containerRef = useRef<HTMLDivElement>(null);

  // Progress runs 0 → 1 as the timeline scrolls from "top hits center" to
  // "bottom hits center" — the spine fills exactly while it's on screen.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });
  const cometTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Spine gradient echoes the journey's own colors, bottom = summit color.
  const spineGradient = `linear-gradient(to bottom, ${waypoints
    .map((w) => w.color)
    .join(', ')})`;

  return (
    <div ref={containerRef} className="relative py-4">
      {/* Static spine (dim rail) */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-5 md:left-1/2 w-px -translate-x-1/2 bg-white/10" />

      {/* Progress spine — scales from the top as you scroll */}
      <motion.div
        aria-hidden
        style={{ scaleY: scrollYProgress, background: spineGradient }}
        className="pointer-events-none absolute top-0 bottom-0 left-5 md:left-1/2 w-px -translate-x-1/2 origin-top"
      />

      {/* Comet riding the tip of the progress line */}
      <motion.div
        aria-hidden
        style={{ top: cometTop }}
        className="pointer-events-none absolute left-5 md:left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
      >
        <span
          className="block h-3 w-3 rounded-full bg-white"
          style={{
            boxShadow:
              '0 0 12px 4px rgba(255,255,255,0.7), 0 0 30px 8px rgba(34,211,238,0.45)',
          }}
        />
      </motion.div>

      <div className="space-y-24 md:space-y-36">
        {waypoints.map((w, i) => (
          <Milestone
            key={w.id}
            w={w}
            index={i}
            side={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>
    </div>
  );
}

function Milestone({
  w,
  index,
  side,
}: {
  w: Waypoint;
  index: number;
  side: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  const reduce = useReducedMotion();

  const isLeft = side === 'left';
  const shown = inView || !!reduce;
  const num = String(index + 1).padStart(2, '0');

  return (
    <div
      ref={ref}
      className="relative pl-16 md:grid md:grid-cols-2 md:gap-x-20 md:pl-0"
    >
      {/* Node sitting on the spine */}
      <span className="absolute top-2 left-5 z-10 -translate-x-1/2 md:left-1/2">
        <motion.span
          aria-hidden
          animate={{ scale: shown ? 1 : 0.72, opacity: shown ? 1 : 0.55 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="block h-4 w-4 rounded-full"
          style={{
            background: w.color,
            boxShadow: shown
              ? `0 0 0 4px ${w.color}22, 0 0 22px 4px ${w.color}99`
              : `0 0 0 3px ${w.color}14`,
          }}
        />
      </span>

      {/* Milestone card / scene */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 36, x: isLeft ? 24 : -24 }}
        animate={{ opacity: shown ? 1 : 0.4, y: shown ? 0 : 12, x: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.6 }}
        className={`flex flex-col ${
          isLeft
            ? 'md:col-start-1 md:items-end md:text-right'
            : 'md:col-start-2 md:items-start md:text-left'
        }`}
      >
        {/* Ghost index — editorial accent */}
        <span
          className="select-none text-6xl font-black leading-none md:text-7xl"
          style={{ color: w.color, opacity: 0.12 }}
        >
          {num}
        </span>

        <div className="mt-3 flex items-center gap-2">
          <span
            className="rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-widest"
            style={{
              color: w.color,
              background: `${w.color}14`,
              border: `1px solid ${w.color}33`,
            }}
          >
            {w.badge}
          </span>
          <span className="font-mono text-xs text-slate-400">{w.period}</span>
        </div>

        <h4 className="mt-3 text-xl font-bold text-white md:text-2xl">
          {w.title}
        </h4>
        <p className="mt-1 text-sm font-medium" style={{ color: w.color }}>
          {w.institution}
        </p>

        {w.description && (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            {w.description}
          </p>
        )}

        {w.gpa && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-300">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: w.color }}
              />
              {w.gpa}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
