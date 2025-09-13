import { useEffect } from 'react'
import { useAnalyticsStore } from '../stores/analyticsStore'

export const useUserAnalytics = (userId: number | string, startDate?: string, endDate?: string) => {
  const {
    userPerformance,
    isLoading,
    error,
    fetchUserPerformance
  } = useAnalyticsStore()

  const id = typeof userId === 'string' ? parseInt(userId) : userId

  useEffect(() => {
    if (id) {
      fetchUserPerformance(id, startDate, endDate)
    }
  }, [id, startDate, endDate, fetchUserPerformance])

  return {
    userPerformance,
    isLoading,
    error,
    refreshUserPerformance: () => fetchUserPerformance(id, startDate, endDate)
  }
}
