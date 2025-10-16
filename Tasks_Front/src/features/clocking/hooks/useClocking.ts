// src/features/clocking/hooks/useClocking.ts

import { useEffect } from 'react';
import { useClockingStore } from '../stores/clockingStore';

/**
 * Employee clocking hook
 * Fetches initial data, provides actions
 * NO WebSocket
 */
export const useClocking = () => {
  const {
    session,
    companyTimezone,
    isLoading,
    error,
    fetchInitialData,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    clearError,
  } = useClockingStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    session,
    companyTimezone,
    isLoading,
    error,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    refresh: fetchInitialData,
    clearError,
  };
};
