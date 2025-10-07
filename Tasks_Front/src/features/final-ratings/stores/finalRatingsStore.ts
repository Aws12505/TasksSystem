// features/finalRatings/stores/finalRatingsStore.ts
import { create } from 'zustand';
import { finalRatingService } from '../../../services/finalRatingService';
import { toast } from 'sonner';
import type {
  FinalRatingConfig,
  FinalRatingResponse,
  CalculateFinalRatingRequest,
  CreateConfigRequest,
  UpdateConfigRequest,
  FinalRatingConfigData,
} from '../../../types/FinalRating';

interface FinalRatingsState {
  configs: FinalRatingConfig[];
  activeConfig: FinalRatingConfig | null;
  currentConfig: FinalRatingConfig | null;
  defaultStructure: FinalRatingConfigData | null;
  calculationResult: FinalRatingResponse | null;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;

  // Actions
  fetchConfigs: () => Promise<void>;
  fetchConfig: (id: number) => Promise<void>;
  fetchActiveConfig: () => Promise<void>;
  fetchDefaultStructure: () => Promise<void>;
  createConfig: (data: CreateConfigRequest) => Promise<FinalRatingConfig | null>;
  updateConfig: (id: number, data: UpdateConfigRequest) => Promise<FinalRatingConfig | null>;
  deleteConfig: (id: number) => Promise<boolean>;
  activateConfig: (id: number) => Promise<boolean>;
  calculateRatings: (data: CalculateFinalRatingRequest) => Promise<FinalRatingResponse | null>;
  exportPdf: (data: CalculateFinalRatingRequest) => Promise<void>;
  clearCalculationResult: () => void;
  clearCurrentConfig: () => void;
}

export const useFinalRatingsStore = create<FinalRatingsState>((set) => ({
  configs: [],
  activeConfig: null,
  currentConfig: null,
  defaultStructure: null,
  calculationResult: null,
  isLoading: false,
  isExporting: false,
  error: null,

  fetchConfigs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.getConfigs();
      if (response.success && response.data) {
        set({ configs: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch configs', isLoading: false });
        toast.error(response.message || 'Failed to fetch configs');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch configs';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchConfig: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.getConfig(id);
      if (response.success && response.data) {
        set({ currentConfig: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch config', isLoading: false });
        toast.error(response.message || 'Failed to fetch config');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch config';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchActiveConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.getActiveConfig();
      if (response.success && response.data) {
        set({ activeConfig: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'No active config found', isLoading: false });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch active config';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchDefaultStructure: async () => {
    try {
      const response = await finalRatingService.getDefaultStructure();
      if (response.success && response.data) {
        set({ defaultStructure: response.data });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch default structure');
    }
  },

  createConfig: async (data: CreateConfigRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.createConfig(data);
      if (response.success && response.data) {
        set((state) => ({
          configs: [response.data!, ...state.configs],
          isLoading: false,
        }));
        toast.success('Configuration created successfully');
        return response.data;
      } else {
        set({ error: response.message || 'Failed to create config', isLoading: false });
        toast.error(response.message || 'Failed to create config');
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create config';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  updateConfig: async (id: number, data: UpdateConfigRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.updateConfig(id, data);
      if (response.success && response.data) {
        set((state) => ({
          configs: state.configs.map((config) =>
            config.id === id ? response.data! : config
          ),
          currentConfig: state.currentConfig?.id === id ? response.data : state.currentConfig,
          isLoading: false,
        }));
        toast.success('Configuration updated successfully');
        return response.data;
      } else {
        set({ error: response.message || 'Failed to update config', isLoading: false });
        toast.error(response.message || 'Failed to update config');
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update config';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  deleteConfig: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.deleteConfig(id);
      if (response.success) {
        set((state) => ({
          configs: state.configs.filter((config) => config.id !== id),
          currentConfig: state.currentConfig?.id === id ? null : state.currentConfig,
          isLoading: false,
        }));
        toast.success('Configuration deleted successfully');
        return true;
      } else {
        set({ error: response.message || 'Failed to delete config', isLoading: false });
        toast.error(response.message || 'Failed to delete config');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete config';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  activateConfig: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.activateConfig(id);
      if (response.success && response.data) {
        set((state) => ({
          configs: state.configs.map((config) => ({
            ...config,
            is_active: config.id === id,
          })),
          activeConfig: response.data,
          isLoading: false,
        }));
        toast.success('Configuration activated successfully');
        return true;
      } else {
        set({ error: response.message || 'Failed to activate config', isLoading: false });
        toast.error(response.message || 'Failed to activate config');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to activate config';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  calculateRatings: async (data: CalculateFinalRatingRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await finalRatingService.calculateRatings(data);
      if (response.success && response.data) {
        set({ calculationResult: response.data, isLoading: false });
        toast.success('Ratings calculated successfully');
        return response.data;
      } else {
        set({ error: response.message || 'Failed to calculate ratings', isLoading: false });
        toast.error(response.message || 'Failed to calculate ratings');
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to calculate ratings';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  exportPdf: async (data: CalculateFinalRatingRequest) => {
    set({ isExporting: true, error: null });
    try {
      const { blob, filename } = await finalRatingService.exportPdf(data);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      set({ isExporting: false });
      toast.success('PDF package exported successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to export PDF';
      set({ error: errorMessage, isExporting: false });
      toast.error(errorMessage);
    }
  },

  clearCalculationResult: () => set({ calculationResult: null, error: null }),
  clearCurrentConfig: () => set({ currentConfig: null, error: null }),
}));
