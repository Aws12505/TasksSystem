import { create } from 'zustand'
import { analyticsService } from '../../../services/analyticsService'
import type {
  DashboardSummary,
  ComprehensiveReport,
  UserPerformanceOverview,
  ProjectAnalytics,
  TopPerformer,
  SystemStats,
  AnalyticsFilters,
  TrendDataPoint
} from '../../../types/Analytics'
import { toast } from 'sonner'

interface AnalyticsState {
  // Core data
  dashboardSummary: DashboardSummary | null
  comprehensiveReport: ComprehensiveReport | null
  userPerformance: UserPerformanceOverview | null
  projectAnalytics: ProjectAnalytics | null
  topPerformers: TopPerformer[]
  systemStats: SystemStats | null
  
  // Trend data
  trendData: TrendDataPoint[]
  
  // User rankings and comparisons
  userRankings: Array<{
    user_id: number
    name: string
    email: string
    performance_score: number
    rank: number
  }>
  
  // Real-time data
  realTimeStats: {
    active_users_now: number
    tasks_completed_today: number
    tickets_resolved_today: number
    help_requests_today: number
    average_performance_today: number
    system_health_score: number
  } | null
  
  // Performance alerts
  performanceAlerts: Array<{
    id: number
    type: 'low_performance' | 'overdue_tasks' | 'rating_drop' | 'system_issue'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    user_id?: number
    project_id?: number
    created_at: string
    is_read: boolean
  }>
  
  // State management
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
  
  // Actions
  fetchDashboardSummary: (userId?: number, startDate?: string, endDate?: string) => Promise<void>
  fetchComprehensiveReport: (filters?: AnalyticsFilters) => Promise<void>
  fetchUserPerformance: (userId: number, startDate?: string, endDate?: string) => Promise<void>
  fetchProjectAnalytics: (projectId: number, startDate?: string, endDate?: string) => Promise<void>
  fetchTopPerformers: (limit?: number, startDate?: string, endDate?: string) => Promise<void>
  fetchSystemStats: (startDate?: string, endDate?: string) => Promise<void>
  fetchTrendData: (metric: 'task_ratings' | 'tickets_solved' | 'help_requests', startDate?: string, endDate?: string) => Promise<void>
  fetchUserRankings: (startDate?: string, endDate?: string) => Promise<void>
  fetchRealTimeStats: () => Promise<void>
  fetchPerformanceAlerts: () => Promise<void>
  markAlertAsRead: (alertId: number) => Promise<void>
  compareUsers: (userIds: number[], startDate?: string, endDate?: string) => Promise<UserPerformanceOverview[]>
  compareProjects: (projectIds: number[], startDate?: string, endDate?: string) => Promise<ProjectAnalytics[]>
  
  // Utility actions
  clearAnalytics: () => void
  setFilters: (filters: AnalyticsFilters) => void
  refreshAllData: () => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  // Initial state
  dashboardSummary: null,
  comprehensiveReport: null,
  userPerformance: null,
  projectAnalytics: null,
  topPerformers: [],
  systemStats: null,
  trendData: [],
  userRankings: [],
  realTimeStats: null,
  performanceAlerts: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Fetch dashboard summary
  fetchDashboardSummary: async (userId, startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.getDashboardSummary(userId, startDate, endDate)
      if (response.success) {
        set({
          dashboardSummary: response.data,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch dashboard summary'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch comprehensive report
  fetchComprehensiveReport: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.getComprehensiveReport(filters)
      if (response.success) {
        set({
          comprehensiveReport: response.data,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch comprehensive report'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch user performance
  fetchUserPerformance: async (userId, startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.getUserAnalytics(userId, startDate, endDate)
      if (response.success) {
        set({
          userPerformance: response.data,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch user performance'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch project analytics
  fetchProjectAnalytics: async (projectId, startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.getProjectAnalytics(projectId, startDate, endDate)
      if (response.success) {
        set({
          projectAnalytics: response.data,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch project analytics'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch top performers
  fetchTopPerformers: async (limit = 10, startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.getTopPerformers(limit, startDate, endDate)
      if (response.success) {
        set({
          topPerformers: response.data,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch top performers'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch system stats
  fetchSystemStats: async (startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.getSystemStats(startDate, endDate)
      if (response.success) {
        set({
          systemStats: response.data,
          isLoading: false,
          lastUpdated: new Date().toISOString()
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch system stats'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch trend data
  fetchTrendData: async (metric, startDate, endDate) => {
    try {
      const response = await analyticsService.getTrendData(metric, startDate, endDate)
      if (response.success) {
        set({ trendData: response.data })
      } else {
        toast.error(response.message)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch trend data')
    }
  },

  // Fetch user rankings
  fetchUserRankings: async (startDate, endDate) => {
    try {
      const response = await analyticsService.getUserRankings(startDate, endDate)
      if (response.success) {
        set({ userRankings: response.data })
      } else {
        toast.error(response.message)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch user rankings')
    }
  },

  // Fetch real-time stats
  fetchRealTimeStats: async () => {
    try {
      const response = await analyticsService.getRealTimeStats()
      if (response.success) {
        set({ realTimeStats: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch real-time stats:', error)
    }
  },

  // Fetch performance alerts
  fetchPerformanceAlerts: async () => {
    try {
      const response = await analyticsService.getPerformanceAlerts()
      if (response.success) {
        set({ performanceAlerts: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch performance alerts:', error)
    }
  },

  // Mark alert as read
  markAlertAsRead: async (alertId: number) => {
    try {
      const response = await analyticsService.markAlertAsRead(alertId)
      if (response.success) {
        set(state => ({
          performanceAlerts: state.performanceAlerts.map(alert =>
            alert.id === alertId ? { ...alert, is_read: true } : alert
          )
        }))
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark alert as read')
    }
  },

  // Compare users
  compareUsers: async (userIds, startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.compareUsers(userIds, startDate, endDate)
      if (response.success) {
        set({ isLoading: false })
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return []
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to compare users'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return []
    }
  },

  // Compare projects
  compareProjects: async (projectIds, startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await analyticsService.compareProjects(projectIds, startDate, endDate)
      if (response.success) {
        set({ isLoading: false })
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return []
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to compare projects'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return []
    }
  },

  // Utility actions
  clearAnalytics: () => {
    set({
      dashboardSummary: null,
      comprehensiveReport: null,
      userPerformance: null,
      projectAnalytics: null,
      topPerformers: [],
      systemStats: null,
      trendData: [],
      userRankings: [],
      realTimeStats: null,
      performanceAlerts: [],
      error: null,
      lastUpdated: null
    })
  },

  setFilters: () => {
    // This could be used to store current filters for persistence
    set({ error: null })
  },

  refreshAllData: async () => {
    const state = get()
    await Promise.all([
      state.fetchDashboardSummary(),
      state.fetchTopPerformers(),
      state.fetchSystemStats(),
      state.fetchRealTimeStats(),
      state.fetchPerformanceAlerts()
    ])
  }
}))
