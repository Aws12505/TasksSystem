// src/hooks/useClockingTimers.ts

import { useState, useEffect } from 'react';
import { calculateDuration, formatDuration } from '../utils/clockingCalculations';

/**
 * Live clock
 */
export const useLiveClock = (): Date => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
};

/**
 * Live timer - calculates from UTC timestamp
 * 
 * @param startUtc - Start time in UTC
 * @param endUtc - End time in UTC (null if still running)
 * @param isRunning - Whether timer should actively count
 * @returns Formatted time string (HH:MM:SS)
 */
export const useLiveTimer = (
  startUtc: string | null,
  endUtc: string | null,
  isRunning: boolean
): string => {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    if (!startUtc) {
      setTime('00:00:00');
      return;
    }

    const calculate = (): string => {
      // If not running and has end time, use that
      if (!isRunning && endUtc) {
        const seconds = calculateDuration(startUtc, endUtc);
        return formatDuration(seconds);
      }

      // If running or no end time, calculate to now
      const seconds = calculateDuration(startUtc, isRunning ? null : endUtc);
      return formatDuration(seconds);
    };

    setTime(calculate());
    
    if (!isRunning) {
      return; // Don't update if not running
    }

    const interval = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [startUtc, endUtc, isRunning]);

  return time;
};

/**
 * Work timer - pauses during breaks
 */
export const useWorkTimer = (
  clockInUtc: string | null,
  clockOutUtc: string | null,
  breaks: Array<{ break_start_utc: string; break_end_utc: string | null }>,
  status: 'active' | 'on_break' | 'completed' | null
): string => {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    if (!clockInUtc) {
      setTime('00:00:00');
      return;
    }

    const calculate = (): string => {
      const totalElapsed = calculateDuration(clockInUtc, clockOutUtc);
      const totalBreaks = breaks.reduce((total, b) => {
        return total + calculateDuration(b.break_start_utc, b.break_end_utc);
      }, 0);
      const workSeconds = Math.max(0, totalElapsed - totalBreaks);
      return formatDuration(workSeconds);
    };

    setTime(calculate());
    
    // Only update when status is active (working)
    if (status !== 'active') {
      return;
    }

    const interval = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [clockInUtc, clockOutUtc, breaks, status]);

  return time;
};

/**
 * Break timer - only runs during break
 */
export const useBreakTimer = (
  breaks: Array<{ break_start_utc: string; break_end_utc: string | null }>,
  status: 'active' | 'on_break' | 'completed' | null
): string => {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    if (!breaks.length) {
      setTime('00:00:00');
      return;
    }

    const calculate = (): string => {
      const totalBreakSeconds = breaks.reduce((total, b) => {
        return total + calculateDuration(b.break_start_utc, b.break_end_utc);
      }, 0);
      return formatDuration(totalBreakSeconds);
    };

    setTime(calculate());
    
    // Only update when on break
    if (status !== 'on_break') {
      return;
    }

    const interval = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [breaks, status]);

  return time;
};
