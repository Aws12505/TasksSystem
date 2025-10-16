// src/features/clocking/hooks/useClockingRecords.ts

import { useEffect } from 'react';
import { useClockingStore } from '../stores/clockingStore';

/**
 * Employee clocking records hook
 * Handles fetching and exporting user's clocking records
 */
export const useClockingRecords = (filters?: any) => {
  const {
    records,
    recordsPagination,
    isLoading,
    isExporting,
    error,
    fetchRecords,
    exportRecords,
    clearError,
  } = useClockingStore();

  // Fetch records when filters change
  useEffect(() => {
    fetchRecords(filters);
  }, [JSON.stringify(filters)]);

  return {
    // Data
    records,
    pagination: recordsPagination,
    
    // UI State
    isLoading,
    isExporting,
    error,
    
    // Actions
    refresh: () => fetchRecords(filters),
    exportRecords,
    clearError,
  };
};
