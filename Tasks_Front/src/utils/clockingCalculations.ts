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
    hour12: true
  });
};

/**
 * Safe calendar-date formatter that:
 * 1) If sessionDate is "YYYY-MM-DD", formats it WITHOUT timezone math (no shifting).
 * 2) Otherwise falls back to a UTC timestamp rendered in the company timezone (so day matches your time columns).
 *
 * This ensures the displayed "Date" column matches the company timezone the backend used.
 */
export const formatCompanyCalendarDate = ({
  sessionDate,
  companyTimezone,
  utcFallback, // e.g., clock_in_utc
  locale = 'en-US',
}: {
  sessionDate?: string | null;
  companyTimezone: string;
  utcFallback?: string | null;
  locale?: string;
}): string => {
  const yyyyMmDd = sessionDate?.trim() ?? '';

  // 1) Strict YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (m) {
    const [, y, mm, dd] = m;
    // Render as a plain string (no Date construction => no timezone shifting)
    if (locale === 'en-US') {
      const shortMonths: Record<string, string> = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
        '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
      };
      const mon = shortMonths[mm] ?? mm;
      return `${mon} ${parseInt(dd, 10)}, ${y}`;
    } else {
      const monthNamesShortIntl = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monIdx = Math.max(1, Math.min(12, parseInt(mm, 10))) - 1;
      return `${parseInt(dd, 10)} ${monthNamesShortIntl[monIdx]} ${y}`;
    }
  }

  // 2) Fallback: use a UTC timestamp (e.g., clock_in_utc) and format only the date **in the company timezone**
  if (utcFallback) {
    const dt = new Date(utcFallback);
    return new Intl.DateTimeFormat(locale, {
      timeZone: companyTimezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour12: true
    }).format(dt);
  }

  // 3) Last resort: show whatever we got (prevents NaN)
  return yyyyMmDd || '';
};
export const companyTimeToUTC = (
  datetimeLocalValue: string,
  companyTimezone: string
): string => {
  if (!datetimeLocalValue) return '';

  // Input: "2025-01-15T14:30" (datetime-local)
  const [datePart, timePart] = datetimeLocalValue.split('T');
  const [year, month, day] = datePart.split('-');
  const [hours, minutes] = timePart.split(':');

  // Create date as if it's in the company timezone
  const naiveDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10),
    0
  );

  // Get what this time would be in UTC if interpreted as company timezone
  const utcDate = new Date(naiveDate);
  const companyDateString = new Intl.DateTimeFormat('en-US', {
    timeZone: companyTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(utcDate);

  const [companyDatePart, companyTimePart] = companyDateString.split(', ');
  const [companyMonth, companyDay, companyYear] = companyDatePart.split('/');
  const [companyHours, companyMinutes, companySeconds] = companyTimePart.split(':');

  const companyDate = new Date(
    parseInt(companyYear, 10),
    parseInt(companyMonth, 10) - 1,
    parseInt(companyDay, 10),
    parseInt(companyHours, 10),
    parseInt(companyMinutes, 10),
    parseInt(companySeconds, 10)
  );

  // Calculate offset
  const offset = utcDate.getTime() - companyDate.getTime();
  
  // Apply offset to get true UTC time
  const correctUTC = new Date(naiveDate.getTime() + offset);

  // Format: "2025-01-15T14:30:00Z"
  const year_ = correctUTC.getUTCFullYear();
  const month_ = String(correctUTC.getUTCMonth() + 1).padStart(2, '0');
  const day_ = String(correctUTC.getUTCDate()).padStart(2, '0');
  const hours_ = String(correctUTC.getUTCHours()).padStart(2, '0');
  const minutes_ = String(correctUTC.getUTCMinutes()).padStart(2, '0');
  const seconds_ = String(correctUTC.getUTCSeconds()).padStart(2, '0');

  return `${year_}-${month_}-${day_}T${hours_}:${minutes_}:${seconds_}Z`;
};
/**
 * Convert UTC ISO string to company timezone datetime-local format
 * For use in datetime-local input fields
 */
export const utcToCompanyDateTime = (
  utcIsoString: string,
  companyTimezone: string
): string => {
  if (!utcIsoString) return '';

  const date = new Date(utcIsoString);

  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: companyTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  // Extract parts: "MM/DD/YYYY, HH:MM:SS"
  const [datePart, timePart] = formatted.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hours, minutes] = timePart.split(':');

  // Return in datetime-local format: "YYYY-MM-DDTHH:mm"
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};