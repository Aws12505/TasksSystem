// features/finalRatings/hooks/useFinalRatings.ts
import { useEffect } from 'react';
import { useFinalRatingsStore } from '../stores/finalRatingsStore';

export const useFinalRatings = () => {
  const {
    configs,
    activeConfig,
    currentConfig,
    defaultStructure,
    calculationResult,
    isLoading,
    isExporting, // Add this
    error,
    fetchConfigs,
    fetchActiveConfig,
    fetchDefaultStructure,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    calculateRatings,
    exportPdf, // Add this
    clearCalculationResult,
    clearCurrentConfig,
  } = useFinalRatingsStore();

  useEffect(() => {
    if (configs.length === 0) {
      fetchConfigs();
    }
    if (!activeConfig) {
      fetchActiveConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    configs,
    activeConfig,
    currentConfig,
    defaultStructure,
    calculationResult,
    isLoading,
    isExporting,
    error,
    fetchConfigs,
    fetchActiveConfig,
    fetchDefaultStructure,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    calculateRatings,
    exportPdf,
    clearCalculationResult,
    clearCurrentConfig,
  };
};
