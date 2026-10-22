import { preload } from 'swr';
import { API_BASE_URL } from '@/lib/config';
import { HeroService } from '@/lib/services/hero';
import { AboutService } from '@/lib/services/about';
import { EducationService } from '@/lib/services/education';
import type { FlightEntry, HangarItem } from '@/lib/types/admin';

const flightFetcher = async (url: string): Promise<FlightEntry[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  const result = await res.json();
  return result.success && result.data
    ? result.data.sort((a: FlightEntry, b: FlightEntry) => a.order - b.order)
    : [];
};

const hangarFetcher = async (url: string): Promise<HangarItem[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  const result = await res.json();
  return result.success && result.data
    ? result.data.sort((a: HangarItem, b: HangarItem) => a.order - b.order)
    : [];
};

const jsonFetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Preload all sections into SWR cache in the background.
 * This warms up backend serverless routes and ensures sections load
 * instantly when scrolled to without showing spinners.
 */
export function preloadAllSections() {
  try {
    // Hero Section
    preload('heroProfile', () => HeroService.getHeroProfile());
    preload('socialLinks', () => HeroService.getSocialLinks());

    // About Section
    preload('passions', () => AboutService.getPassions());
    preload('highlights', () => AboutService.getHighlights());

    // Education Section
    preload('educationRecords', () => EducationService.getEducationRecords());
    preload('achievementsData', () => EducationService.getAchievements());

    // Experience & Projects Section
    preload(`${API_BASE_URL}/api/experience/flights`, flightFetcher);
    preload(`${API_BASE_URL}/api/experience/projects`, hangarFetcher);

    // Contact Section
    preload('/api/contact-info', jsonFetcher);
  } catch (err) {
    // Non-critical background task
    console.warn('Background prefetch error:', err);
  }
}
