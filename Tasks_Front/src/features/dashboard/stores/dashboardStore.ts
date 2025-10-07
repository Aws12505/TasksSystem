// features/dashboard/stores/dashboardStore.ts
import { create } from 'zustand';
import { dashboardService } from '../../../services/dashboardService';
import { toast } from 'sonner';
import type {
  EmployeeDashboardData,
  ManagerAnalyticsData,
  PeriodType,
} from '../../../types/Dashboard';

interface DashboardState {
  employeeDashboard: EmployeeDashboardData | null;
  managerAnalytics: ManagerAnalyticsData | null;
  currentPeriod: PeriodType;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEmployeeDashboard: () => Promise<void>;
  fetchManagerAnalytics: (period: PeriodType) => Promise<void>;
  setPeriod: (period: PeriodType) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  employeeDashboard: null,
  managerAnalytics: null,
  currentPeriod: 'today',
  isLoading: false,
  error: null,

  fetchEmployeeDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getEmployeeDashboard();
      if (response.success && response.data) {
        set({ employeeDashboard: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch dashboard', isLoading: false });
        toast.error(response.message || 'Failed to fetch dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch dashboard';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchManagerAnalytics: async (period: PeriodType) => {
    set({ isLoading: true, error: null, currentPeriod: period });
    try {
      const response = await dashboardService.getManagerAnalytics(period);
      if (response.success && response.data) {
        set({ managerAnalytics: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch analytics', isLoading: false });
        toast.error(response.message || 'Failed to fetch analytics');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch analytics';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  setPeriod: (period: PeriodType) => {
    set({ currentPeriod: period });
    get().fetchManagerAnalytics(period);
  },

  clearError: () => set({ error: null }),
}));
