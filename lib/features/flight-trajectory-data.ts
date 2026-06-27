// Shared data + pure helpers for the education "flight trajectory" visuals.
// Imported by BOTH the WebGL scene (HolographicFlightTrajectory) and the
// lightweight 2D/SVG fallback (FlightTrajectory2D) so they stay in sync.
// Dependency-free (no three.js, no React) — safe for the lite chunk.

import type { Education } from '@/lib/types/admin';

export interface Waypoint {
  id: string;
  badge: string;
  title: string;
  institution: string;
  period: string;
  description: string;
  gpa: string;
  color: string;
  altitude: number; // 0..100
}

// ── Fallback data (mirrors the previous timeline) ────────────────────────
export const DEFAULT_EDUCATION: Education[] = [
  { id: '1', degree: 'Elementary School', institution: 'SD Negeri 1 Jakarta', period: '2006-2012', gpa: 'Top 10 Student', color: 'cyan', order: 1, description: 'Building strong academic foundation and character development. Active in mathematics and science clubs.', createdAt: '', updatedAt: '' },
  { id: '2', degree: 'Junior High School', institution: 'SMP Negeri 5 Jakarta', period: '2012-2015', gpa: '9.2 / 10', color: 'green', order: 2, description: 'National Science Olympiad participant. Started programming journey with basic algorithms.', createdAt: '', updatedAt: '' },
  { id: '3', degree: 'Senior High School', institution: 'SMA Negeri 8 Jakarta', period: '2015-2018', gpa: '92 / 100', color: 'orange', order: 3, description: 'Science major focus on Mathematics & Physics. Won regional robotics competition. Developed first web applications.', createdAt: '', updatedAt: '' },
  { id: '4', degree: 'Intensive Bootcamp', institution: 'Tech Academy Scholarship', period: '2019-2020', gpa: 'Graduate with Distinction', color: 'orange', order: 4, description: 'Received full scholarship for intensive coding bootcamp. Mastered modern web technologies, agile development, and real-world projects.', createdAt: '', updatedAt: '' },
  { id: '5', degree: 'Bachelor Degree', institution: 'University of Technology', period: '2020-2024', gpa: '3.85 / 4.00', color: 'purple', order: 5, description: 'Specialized in Network Security, Cloud Computing, and Full-Stack Development. Final project: Smart Network Monitoring System using AI/ML.', createdAt: '', updatedAt: '' },
];

export const LEVEL_COLORS = ['#22d3ee', '#4ade80', '#f59e0b', '#fb923c', '#a78bfa'];
export const SUMMIT_COLOR = '#a78bfa';

export function colorForIndex(i: number, n: number): string {
  if (i === n - 1) return SUMMIT_COLOR;
  return LEVEL_COLORS[Math.min(i, LEVEL_COLORS.length - 1)];
}

export function badgeForIndex(i: number, n: number): string {
  if (i === 0) return 'Base Camp';
  if (i === n - 1) return '🎓 SUMMIT';
  return `Camp ${i}`;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatETA(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── Sequence timing (ms) ─────────────────────────────────────────────────
export const BOOT_MS = 1600;
export const SURVEY_MS = 4200;
export const DWELL_MS = 5000;
export const TRAVEL_MS = 2200;
export const SUMMIT_MS = 3200;

/** Build the ordered waypoint list from education records (or the default set). */
export function buildWaypoints(educationRecords?: Education[]): Waypoint[] {
  const records = (educationRecords && educationRecords.length > 0 ? educationRecords : DEFAULT_EDUCATION)
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const n = records.length;
  return records.map((r, i) => ({
    id: r.id,
    badge: badgeForIndex(i, n),
    title: r.degree,
    institution: r.institution,
    period: r.period,
    description: r.description || '',
    gpa: r.gpa || '',
    color: colorForIndex(i, n),
    altitude: n > 1 ? (i / (n - 1)) * 100 : 100,
  }));
}
