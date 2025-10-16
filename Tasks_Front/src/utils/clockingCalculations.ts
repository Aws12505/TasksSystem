// src/utils/clockingCalculations.ts

/**
 * Calculate duration in seconds between two UTC timestamps
 */
export const calculateDuration = (startUtc: string, endUtc: string | null): number => {
  const start = new Date(startUtc).getTime();
  const end = endUtc ? new Date(endUtc).getTime() : Date.now();
  return Math.floor((end - start) / 1000);
};

/**
 * Calculate total break duration (all breaks combined)
 */
export const calculateTotalBreakDuration = (breaks: Array<{ break_start_utc: string; break_end_utc: string | null }>): number => {
  return breaks.reduce((total, breakRecord) => {
    return total + calculateDuration(breakRecord.break_start_utc, breakRecord.break_end_utc);
  }, 0);
};

/**
 * Calculate work duration (total elapsed - breaks)
 */
export const calculateWorkDuration = (
  clockInUtc: string,
  clockOutUtc: string | null,
  breaks: Array<{ break_start_utc: string; break_end_utc: string | null }>
): number => {
  const totalElapsed = calculateDuration(clockInUtc, clockOutUtc);
  const totalBreaks = calculateTotalBreakDuration(breaks);
  return Math.max(0, totalElapsed - totalBreaks);
};

/**
 * Format seconds to HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Convert UTC to company timezone
 */
export const convertToCompanyTime = (utcTime: string, timezone: string): string => {
  const date = new Date(utcTime);
  return date.toLocaleString('en-US', { 
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};
