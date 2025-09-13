import { useEffect } from 'react'
import { useAnalyticsStore } from '../stores/analyticsStore'

export const useProjectAnalytics = (projectId: number | string, startDate?: string, endDate?: string) => {
  const {
    projectAnalytics,
    isLoading,
    error,
    fetchProjectAnalytics
  } = useAnalyticsStore()

  const id = typeof projectId === 'string' ? parseInt(projectId) : projectId

  useEffect(() => {
    if (id) {
      fetchProjectAnalytics(id, startDate, endDate)
    }
  }, [id, startDate, endDate, fetchProjectAnalytics])

  return {
    projectAnalytics,
    isLoading,
    error,
    refreshProjectAnalytics: () => fetchProjectAnalytics(id, startDate, endDate)
  }
}
