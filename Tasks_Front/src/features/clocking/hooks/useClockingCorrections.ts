// src/features/clocking/hooks/useClockingCorrections.ts - NEW FILE

import { useEffect } from 'react';
import { useClockingStore } from '../stores/clockingStore';

export const useClockingCorrections = () => {
  const {
    pendingCorrections,
    correctionLoading,
    correctionError,
    getPendingCorrections,
    requestCorrection,
    clearCorrectionError,
  } = useClockingStore();

  useEffect(() => {
    getPendingCorrections();
  }, [getPendingCorrections]);

  return {
    pendingCorrections,
    isLoading: correctionLoading,
    error: correctionError,
    requestCorrection,
    refresh: getPendingCorrections,
    clearError: clearCorrectionError,
  };
};
