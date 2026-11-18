/**
 * Utility functions for calculating flight logbook / project durations and dates.
 */

/**
 * Calculates duration in months between start date and end date (or current date if ongoing).
 * If end date is absent and role is active/in-progress, calculates duration from start date to today.
 *
 * @param startDateStr - Departure / Start Date in YYYY-MM-DD format
 * @param endDateStr - Arrival / End Date in YYYY-MM-DD format (optional)
 * @param isActive - Whether the project/role is currently active
 * @param status - Arrival status (e.g. 'In Progress', 'Landed', 'Complete')
 * @returns number of months (minimum 1 if dates are valid, 0 if missing start date)
 */
export function calculateDurationInMonths(
  startDateStr?: string | null,
  endDateStr?: string | null,
  isActive?: boolean,
  status?: string
): number {
  if (!startDateStr || typeof startDateStr !== 'string') return 0;

  const cleanStart = startDateStr.split('T')[0].trim();
  const [sYear, sMonth, sDay] = cleanStart.split('-').map(Number);
  if (!sYear || !sMonth) return 0;

  const start = new Date(sYear, sMonth - 1, sDay || 1);
  if (isNaN(start.getTime())) return 0;

  const isOngoing = Boolean(isActive) || status === 'In Progress';
  const hasNoEndDate =
    !endDateStr ||
    typeof endDateStr !== 'string' ||
    endDateStr.trim() === '' ||
    endDateStr.startsWith('0001-01-01');

  let end: Date;
  if (hasNoEndDate) {
    if (!isOngoing) return 0;
    end = new Date();
  } else {
    const cleanEnd = endDateStr.split('T')[0].trim();
    const [eYear, eMonth, eDay] = cleanEnd.split('-').map(Number);
    if (!eYear || !eMonth) {
      if (!isOngoing) return 0;
      end = new Date();
    } else {
      end = new Date(eYear, eMonth - 1, eDay || 1);
    }
  }

  if (isNaN(end.getTime()) || end < start) return 1;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const dayDiff = end.getDate() - start.getDate();
  if (dayDiff >= 15) {
    months += 1;
  }

  return Math.max(1, months);
}

export interface FlightDurationTarget {
  duration?: string;
  departure?: {
    date?: string;
  };
  arrival?: {
    date?: string;
    status?: string;
  };
  isActive?: boolean;
}

/**
 * Returns the effective display duration for a flight entry.
 * If the role is currently active and has no end date, returns the dynamically computed months.
 * Otherwise falls back to stored entry.duration.
 */
export function getDisplayDuration(entry: FlightDurationTarget): string {
  const isOngoing = Boolean(entry.isActive) || entry.arrival?.status === 'In Progress';
  const hasNoEndDate =
    !entry.arrival?.date ||
    entry.arrival.date.trim() === '' ||
    entry.arrival.date.startsWith('0001-01-01');

  if (isOngoing && hasNoEndDate && entry.departure?.date) {
    const calc = calculateDurationInMonths(
      entry.departure.date,
      '',
      true,
      entry.arrival?.status
    );
    if (calc > 0) {
      return calc.toString();
    }
  }

  return entry.duration || '1';
}

/**
 * Returns formatted end date string. If the role is active or in progress without end date,
 * returns 'Present'.
 */
export function getDisplayEndDate(
  arrival?: { date?: string; status?: string },
  isActive?: boolean,
  locale = 'en-US'
): string {
  const isOngoing = Boolean(isActive) || arrival?.status === 'In Progress';
  const hasNoEndDate =
    !arrival?.date ||
    arrival.date.trim() === '' ||
    arrival.date.startsWith('0001-01-01');

  if (isOngoing && hasNoEndDate) {
    return 'Present';
  }

  if (arrival?.date && !arrival.date.startsWith('0001-01-01')) {
    const [year, month, day] = arrival.date.split('T')[0].split('-').map(Number);
    if (year && month) {
      const date = new Date(year, month - 1, day || 1);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(locale, {
          month: 'short',
          year: 'numeric',
        });
      }
    }
  }

  return isOngoing ? 'Present' : 'N/A';
}
