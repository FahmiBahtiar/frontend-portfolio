/**
 * Centralized runtime configuration. Single source of truth for environment
 * values so call sites don't each re-read process.env with their own fallback
 * (which drifts and hides typos). Safe to import from server, client, and edge
 * code — NEXT_PUBLIC_* values are inlined at build time.
 */

/** Base URL of the NestJS backend API. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Public site origin (used for SEO: canonical, sitemap, robots, metadata). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://blimbing.me';
