import { useEffect } from 'react'
import { useAnalyticsStore } from '../stores/analyticsStore'
import type { AnalyticsFilters } from '../../../types/Analytics'

export const useAnalytics = (filters?: AnalyticsFilters) => {
  const {
    dashboardSummary,
    comprehensiveReport,
    topPerformers,
    systemStats,
    realTimeStats,
    performanceAlerts,
    isLoading,
    error,
    lastUpdated,
    fetchDashboardSummary,
    fetchComprehensiveReport,
    fetchTopPerformers,
    fetchSystemStats,
    fetchRealTimeStats,
    fetchPerformanceAlerts,
    markAlertAsRead,
    refreshAllData
  } = useAnalyticsStore()

  useEffect(() => {
    fetchDashboardSummary(filters?.user_id, filters?.start_date, filters?.end_date)
    fetchTopPerformers(10, filters?.start_date, filters?.end_date)
    fetchSystemStats(filters?.start_date, filters?.end_date)
    fetchPerformanceAlerts()
  }, [
    fetchDashboardSummary,
    fetchTopPerformers,
    fetchSystemStats,
    fetchPerformanceAlerts,
    filters?.user_id,
    filters?.start_date,
    filters?.end_date
  ])

  // Real-time stats refresh
  useEffect(() => {
    fetchRealTimeStats()
    const interval = setInterval(fetchRealTimeStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [fetchRealTimeStats])

  return {
    dashboardSummary,
    comprehensiveReport,
    topPerformers,
    systemStats,
    realTimeStats,
    performanceAlerts,
    isLoading,
    error,
    lastUpdated,
    fetchComprehensiveReport,
    markAlertAsRead,
    refreshAllData
  }
}
