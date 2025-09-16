import { useEffect } from 'react'
import { useDashboardStore } from '../stores/dashboardStore'
import { useFiltersStore } from '../../../stores/filtersStore'
import { useAuthStore } from '../../auth/stores/authStore'

export const useDashboardData = () => {
  const { data, isLoading, error, fetchDashboardData } = useDashboardStore()
  const { dateRange } = useFiltersStore()
  const { user, isAuthenticated } = useAuthStore()

  const loadData = () => {
    if (!isAuthenticated || !user) {
      return
    }
    
    fetchDashboardData(
      user?.id,
      dateRange.start?.toISOString().split('T')[0],
      dateRange.end?.toISOString().split('T')[0]
    )
  }

  useEffect(() => {
    loadData()
  }, [dateRange.start, dateRange.end, user?.id, isAuthenticated])

  return {
    data,
    isLoading,
    error,
    refresh: loadData
  }
}
