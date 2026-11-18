import { describe, it, expect } from 'vitest';
import {
  calculateDurationInMonths,
  getDisplayDuration,
  getDisplayEndDate,
} from './duration';

describe('calculateDurationInMonths', () => {
  it('returns 0 if start date is missing or invalid', () => {
    expect(calculateDurationInMonths('')).toBe(0);
    expect(calculateDurationInMonths(null)).toBe(0);
    expect(calculateDurationInMonths('invalid-date')).toBe(0);
  });

  it('calculates duration from start date to today when ongoing without end date', () => {
    // Current date in test runtime is around November 2026
    const dur = calculateDurationInMonths('2026-09-01', '', true, 'In Progress');
    expect(dur).toBeGreaterThanOrEqual(2);
  });

  it('calculates duration between two specified dates', () => {
    // Exactly 1 year apart (Sep 2024 to Sep 2025)
    expect(calculateDurationInMonths('2024-09-01', '2025-09-01', false, 'Landed')).toBe(12);
  });

  it('returns at least 1 month if start date equals end date', () => {
    expect(calculateDurationInMonths('2024-09-01', '2024-09-01', false, 'Landed')).toBe(1);
  });

  it('handles 0001-01-01 as no end date when ongoing', () => {
    const dur = calculateDurationInMonths('2026-09-01', '0001-01-01', true, 'In Progress');
    expect(dur).toBeGreaterThanOrEqual(2);
  });

  it('returns 0 when no end date and role is NOT ongoing', () => {
    expect(calculateDurationInMonths('2026-09-01', '', false, 'Landed')).toBe(0);
  });
});

describe('getDisplayDuration', () => {
  it('returns dynamic calculation for active ongoing role without end date', () => {
    const entry = {
      duration: '1',
      departure: { date: '2026-09-01' },
      arrival: { date: '', status: 'In Progress' },
      isActive: true,
    };
    const display = getDisplayDuration(entry);
    expect(Number(display)).toBeGreaterThanOrEqual(2);
  });

  it('preserves static duration for completed/landed flight', () => {
    const entry = {
      duration: '14',
      departure: { date: '2024-01-07' },
      arrival: { date: '2026-03-31', status: 'Landed' },
      isActive: false,
    };
    expect(getDisplayDuration(entry)).toBe('14');
  });
});

describe('getDisplayEndDate', () => {
  it('returns Present for active role without end date', () => {
    expect(getDisplayEndDate({ date: '', status: 'In Progress' }, true)).toBe('Present');
    expect(getDisplayEndDate({ date: '0001-01-01', status: 'In Progress' }, true)).toBe('Present');
  });

  it('formats valid end date properly', () => {
    expect(getDisplayEndDate({ date: '2025-07-01', status: 'Landed' }, false)).toBe('Jul 2025');
  });

  it('returns N/A if missing and not ongoing', () => {
    expect(getDisplayEndDate({ date: '', status: 'Landed' }, false)).toBe('N/A');
  });
});
