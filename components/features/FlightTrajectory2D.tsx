'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useMotionValueEvent } from 'motion/react';
import { Plane, Trophy } from 'lucide-react';
import type { Education } from '@/lib/types/admin';
import {
  type Waypoint,
  buildWaypoints,
  pad2,
  formatETA,
  clamp,
  lerp,
} from '@/lib/features/flight-trajectory-data';

/* ────────────────────────────────────────────────────────────────────────
 * Flight Trajectory — 2D / SVG fallback
 * The lightweight stand-in for HolographicFlightTrajectory used when the
 * browser has no GPU acceleration (lite mode). Renders the same education
 * "journey" as a flat SVG flight path with a plane traveling along it.
 *
 * Stays smooth on the CPU by animating ONLY:
 *   - SVG pathLength (stroke reveal, via Framer Motion → strokeDashoffset)
 *   - the plane's `transform` (translate + rotate), set imperatively per frame
 *   - opacity on overlay panels
 * No filter/blur, no box-shadow, no backdrop-filter, no three.js.
 * ──────────────────────────────────────────────────────────────────────── */

interface FlightTrajectory2DProps {
  educationRecords?: Education[];
}

// SVG coordinate space (fixed; preserveAspectRatio scales it to the container).
const VB_W = 1000;
const VB_H = 480;
const PAD_X = 90;
const PAD_TOP = 78;
const PAD_BOTTOM = 96;

interface PlacedWaypoint {
  wp: Waypoint;
  x: number;
  y: number;
}

// Catmull-Rom → cubic bezier so the route curves smoothly through waypoints.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function FlightTrajectory2D({ educationRecords }: FlightTrajectory2DProps = {}) {
  const waypoints = useMemo<Waypoint[]>(() => buildWaypoints(educationRecords), [educationRecords]);
  const n = waypoints.length;

  // Lay waypoints out: X spreads evenly, Y from altitude (higher = nearer top).
  const placed = useMemo<PlacedWaypoint[]>(() => {
    const usableW = VB_W - 2 * PAD_X;
    const usableH = VB_H - PAD_TOP - PAD_BOTTOM;
    return waypoints.map((wp, i) => ({
      wp,
      x: PAD_X + (n > 1 ? i / (n - 1) : 0.5) * usableW,
      y: VB_H - PAD_BOTTOM - (wp.altitude / 100) * usableH,
    }));
  }, [waypoints, n]);

  const pathD = useMemo(() => smoothPath(placed.map((p) => ({ x: p.x, y: p.y }))), [placed]);

  const [activePanel, setActivePanel] = useState<number | null>(null);
  const active = activePanel !== null ? waypoints[activePanel] : null;

  const rootRef = useRef<HTMLDivElement>(null);
  // Imperative refs (updated per-frame without React re-renders).
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const spdRef = useRef<HTMLSpanElement>(null);
  const rngRef = useRef<HTMLSpanElement>(null);
  const etaRef = useRef<HTMLSpanElement>(null);
  const hdgRef = useRef<HTMLSpanElement>(null);
  const lastReadoutRef = useRef(0);

  const progress = useMotionValue(0);
  const loopSeconds = Math.max(7, n * 1.7);

  // Drive plane position (every frame) + readouts (throttled ~90ms).
  const onProgress = useCallback(
    (v: number, force = false) => {
      const path = pathRef.current;
      if (!path) return;
      const len = path.getTotalLength();
      if (!len) return;
      const cv = clamp(v, 0, 1);
      const p = path.getPointAtLength(cv * len);
      const ahead = path.getPointAtLength(clamp(cv + 0.002, 0, 1) * len);
      const angleDeg = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
      planeRef.current?.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angleDeg})`);

      const now = typeof performance !== 'undefined' ? performance.now() : 0;
      if (!force && now - lastReadoutRef.current < 90) return;
      lastReadoutRef.current = now;

      const f = n > 1 ? cv * (n - 1) : 0;
      const i = Math.min(Math.floor(f), n - 1);
      const frac = f - i;
      const altPct = lerp(waypoints[i]?.altitude ?? 0, waypoints[Math.min(i + 1, n - 1)]?.altitude ?? 0, frac);
      const hdg = ((Math.round(angleDeg) % 360) + 360) % 360;
      const nextFrac = Math.ceil(f) - f;

      if (altRef.current) altRef.current.textContent = String(Math.round(altPct * 410));
      if (spdRef.current) spdRef.current.textContent = String(Math.round(420 + 25 * Math.sin(cv * Math.PI * 2)));
      if (rngRef.current) rngRef.current.textContent = String(Math.round(nextFrac * 120));
      if (etaRef.current) etaRef.current.textContent = formatETA((1 - cv) * loopSeconds * 1000);
      if (hdgRef.current) hdgRef.current.textContent = pad2(Math.floor(hdg / 10)) + String(hdg % 10);
    },
    [waypoints, n, loopSeconds],
  );

  useMotionValueEvent(progress, 'change', (v) => onProgress(v));

  // Start / freeze the plane loop. Respect prefers-reduced-motion (the route
  // reveal itself is a Framer Motion animation, already gated by MotionConfig),
  // and only run the loop while the section is actually on-screen —
  // content-visibility skips paint when offscreen, but the JS animation would
  // otherwise keep burning CPU, which matters on the low-power devices that end
  // up in lite mode.
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (n < 2 || reduced) {
      // Park the plane at the summit, freeze readouts at final values.
      progress.set(1);
      onProgress(1, true);
      return;
    }

    onProgress(0, true);

    let controls: ReturnType<typeof animate> | null = null;
    const start = () => {
      if (!controls) {
        controls = animate(progress, 1, {
          duration: loopSeconds,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        });
      }
    };
    const stop = () => {
      controls?.stop();
      controls = null;
    };

    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      start();
      return () => stop();
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [n, loopSeconds, progress, onProgress]);

  const reduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      ref={rootRef}
      className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/15"
      style={{
        height: 'clamp(440px, 56vw, 560px)',
        background: 'radial-gradient(120% 120% at 50% 20%, #0a0a1c 0%, #060612 70%)',
      }}
    >
      {/* ── Flight path (SVG) ── */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
      >
        {/* faint grid */}
        <g stroke="#22d3ee" strokeOpacity={0.06} strokeWidth={1}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={(i / 8) * VB_W} y1={0} x2={(i / 8) * VB_W} y2={VB_H} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(i / 4) * VB_H} x2={VB_W} y2={(i / 4) * VB_H} />
          ))}
        </g>

        {/* static full route (also the geometry we sample for the plane) */}
        <path ref={pathRef} d={pathD} fill="none" stroke="#22d3ee" strokeOpacity={0.18} strokeWidth={2.5} />

        {/* animated reveal on top (pathLength → strokeDashoffset under the hood) */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#22d3ee"
          strokeOpacity={0.85}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 1.6, ease: 'easeInOut' }}
        />

        {/* waypoint markers */}
        {placed.map((p, i) => {
          const isSummit = i === n - 1;
          return (
            <g
              key={p.wp.id ?? i}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={() => setActivePanel((cur) => (cur === i ? null : i))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePanel((cur) => (cur === i ? null : i));
                }
              }}
            >
              {/* hit area */}
              <circle cx={p.x} cy={p.y} r={26} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={11} fill="none" stroke={p.wp.color} strokeOpacity={0.5} strokeWidth={2} />
              <circle cx={p.x} cy={p.y} r={5} fill={p.wp.color} />
              {/* badge */}
              <text
                x={p.x}
                y={p.y - 20}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize={13}
                letterSpacing={1}
                fill={p.wp.color}
              >
                {p.wp.badge}
              </text>
              {/* title */}
              <text
                x={p.x}
                y={p.y + 30}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize={12}
                fill="#ffffff"
                fillOpacity={0.65}
              >
                {p.wp.title}
              </text>
              {isSummit && (
                <g transform={`translate(${p.x - 8} ${p.y - 46})`}>
                  <Trophy width={16} height={16} color={p.wp.color} />
                </g>
              )}
            </g>
          );
        })}

        {/* traveling plane (transform set imperatively in onProgress) */}
        <g ref={planeRef}>
          <path d="M 16 0 L -12 9 L -5 0 L -12 -9 Z" fill="#22d3ee" />
        </g>
      </svg>

      {/* ── HUD overlay (flat — no glow/blur) ── */}
      <div className="absolute inset-0 pointer-events-none font-mono select-none">
        {/* corner brackets */}
        <span className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-cyan-400/50" />
        <span className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-cyan-400/50" />
        <span className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-cyan-400/50" />
        <span className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-cyan-400/50" />

        {/* top-left status */}
        <div className="absolute top-5 left-6 text-[10px] md:text-xs">
          <div className="flex items-center gap-2 text-cyan-300/90">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-[0.2em]">NAV RADAR · LITE</span>
          </div>
          <div className="text-cyan-300/40 mt-1 tracking-wider">TRAJECTORY ASCENT PLAN</div>
        </div>

        {/* top-center heading readout */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <div className="text-[10px] text-cyan-300/80 tracking-widest">
            HDG <span ref={hdgRef}>000</span>
          </div>
        </div>

        {/* top-right readouts */}
        <div className="absolute top-5 right-6 text-right text-[10px] md:text-xs space-y-1.5">
          {[
            { label: 'ALTITUDE', ref: altRef, unit: 'FT' },
            { label: 'AIRSPEED', ref: spdRef, unit: 'KT' },
            { label: 'RANGE NXT', ref: rngRef, unit: 'NM' },
            { label: 'ETA', ref: etaRef, unit: '' },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-end gap-2">
              <span className="text-cyan-300/40 tracking-wider">{r.label}</span>
              <span className="min-w-[52px] text-right text-cyan-200 tabular-nums">
                <span ref={r.ref}>—</span>
                {r.unit && <span className="text-cyan-300/40 ml-1">{r.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* bottom caption */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-cyan-300/40 tracking-[0.3em]">
          TRAJECTORY ASCENT · {n} WAYPOINTS · TAP A WAYPOINT
        </div>

        {/* scanline + soft vignette (cheap: gradients only) */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #22d3ee 0px, transparent 1px, transparent 3px, #22d3ee 4px)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 120% at 50% 45%, transparent 55%, rgba(0,0,0,0.65) 100%)' }}
        />
      </div>

      {/* ── Briefing panel (flat) ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={`panel-${activePanel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <button
              type="button"
              aria-label="Close briefing"
              className="absolute inset-0 bg-black/55 cursor-default"
              onClick={() => setActivePanel(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md rounded-2xl border bg-[#080816] p-5 md:p-6 overflow-hidden"
              style={{ borderColor: active.color }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: active.color }} />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center border"
                    style={{ borderColor: `${active.color}55`, background: `${active.color}15` }}
                  >
                    <Plane className="w-5 h-5" style={{ color: active.color }} />
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] tracking-widest border"
                    style={{ color: active.color, borderColor: `${active.color}66`, background: `${active.color}12` }}
                  >
                    {active.badge}
                  </span>
                </div>
                <span className="text-[10px] tracking-widest text-white/40 font-mono">
                  WPT {pad2((activePanel ?? 0) + 1)}/{pad2(n)}
                </span>
              </div>

              <h3 className="text-white text-xl md:text-2xl font-bold leading-tight mb-1">{active.title}</h3>
              <p className="text-[11px] md:text-xs text-white/50 mb-4">
                {active.institution} · {active.period}
              </p>

              {active.description && (
                <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4">{active.description}</p>
              )}

              <div className="h-px w-full mb-4" style={{ background: `linear-gradient(90deg, ${active.color}40, transparent)` }} />

              {active.gpa && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" style={{ color: active.color }} />
                  <span className="text-sm font-mono" style={{ color: active.color }}>
                    {active.gpa}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
