import React from 'react'
import { Button } from '@/components/ui/button'
import { useDashboardData } from '../hooks/useDashboardData'
import MetricsCards from '../components/MetricsCards'
import ActivityFeed from '../components/ActivityFeed'
import TrendCharts from '../components/TrendCharts'
import DashboardFilters from '../components/DashboardFilters'
import { useAuthStore } from '../../auth/stores/authStore'

const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refresh } = useDashboardData()
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-sans">Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-sans">
            Welcome back, {user?.name}! Here's your project overview.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refresh}
          disabled={isLoading}
          className="border-border hover:bg-accent hover:text-accent-foreground"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Filters */}
      <DashboardFilters />

      {/* Metrics Cards */}
      <MetricsCards data={data} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ActivityFeed data={data} isLoading={isLoading} />
        </div>
        <div>
          <TrendCharts data={data} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
