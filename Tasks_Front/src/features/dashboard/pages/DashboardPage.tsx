// pages/DashboardPage.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardData } from '../hooks/useDashboardData'
import MetricsCards from '../components/MetricsCards'
// import ActivityFeed from '../components/ActivityFeed'
// import TrendCharts from '../components/TrendCharts'
import DashboardFilters from '../components/DashboardFilters'
import { useAuthStore } from '../../auth/stores/authStore'
import { RefreshCw } from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refresh } = useDashboardData()
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with other pages) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading…' : 'Refresh'}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Filters (wrapped in card to match page rhythm) */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <DashboardFilters />
          </CardContent>
        </Card>

        {/* Metrics cards (leave inner layout to component) */}
        <MetricsCards data={data} isLoading={isLoading} />

        {/* Main content grid wrapped in cards (list-in-card parity)
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <div className="flex-1 overflow-hidden">
                <ActivityFeed data={data} isLoading={isLoading} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <div className="flex-1 overflow-hidden">
                <TrendCharts data={data} isLoading={isLoading} />
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  )
}

export default DashboardPage
