// features/finalRatings/hooks/useFinalRatingConfig.ts
import { useEffect } from 'react';
import { useFinalRatingsStore } from '../stores/finalRatingsStore';

export const useFinalRatingConfig = (configId?: number) => {
  const {
    currentConfig,
    isLoading,
    error,
    fetchConfig,
    updateConfig,
    clearCurrentConfig,
  } = useFinalRatingsStore();

  useEffect(() => {
    if (configId) {
      fetchConfig(configId);
    }

    return () => {
      clearCurrentConfig();
    };
  }, [configId, fetchConfig, clearCurrentConfig]);

  return {
    config: currentConfig,
    isLoading,
    error,
    updateConfig,
  };
};
