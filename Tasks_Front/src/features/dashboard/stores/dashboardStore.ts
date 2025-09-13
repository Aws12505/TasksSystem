import { create } from 'zustand'
import { analyticsService } from '../../../services/analyticsService'
import type { DashboardSummary } from '../../../types/Analytics'
import { toast } from 'sonner'

interface DashboardState {
  data: DashboardSummary | null
  isLoading: boolean
  error: string | null
  fetchDashboardData: (userId?: number, startDate?: string, endDate?: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async (userId?: number, startDate?: string, endDate?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.getDashboardSummary(userId, startDate, endDate)
      
      if (response.success) {
        set({ data: response.data, isLoading: false })
      } else {
        set({ error: response.message || 'Failed to load dashboard', isLoading: false })
        toast.error(response.message || 'Failed to load dashboard')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load dashboard data'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },
}))
