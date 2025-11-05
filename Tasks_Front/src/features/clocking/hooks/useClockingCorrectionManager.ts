// src/features/clocking/hooks/useClockingCorrectionManager.ts

import { useEffect } from 'react';
import { useClockingStore } from '../stores/clockingStore';

export const useClockingCorrectionManager = () => {
  const {
    allPendingCorrections,
    correctionLoading,
    getAllPendingCorrections,
    handleCorrection,
  } = useClockingStore();

  useEffect(() => {
    getAllPendingCorrections();
  }, [getAllPendingCorrections]);

  return {
    corrections: allPendingCorrections,
    isLoading: correctionLoading,
    handleCorrection,
    refresh: getAllPendingCorrections,
  };
};
