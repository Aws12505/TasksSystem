import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummary } from '../../../types/Analytics'
import { formatAvg, formatDate } from '../../../utils/formatters'

interface TrendChartsProps {
  data: DashboardSummary | null
  isLoading: boolean
}

const TrendCharts: React.FC<TrendChartsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-muted" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data || !data.trends) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No trend data available</p>
        </CardContent>
      </Card>
    )
  }

  const taskTrend = data.trends.task_ratings_trend ?? []
  const ticketsTrend = data.trends.tickets_solved_trend ?? []
  const helpTrend = data.trends.help_requests_trend ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Task Ratings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {taskTrend.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data</p>
          ) : (
            <div className="space-y-2">
              {taskTrend.slice(0, 5).map((item, index) => {
                const avg = formatAvg((item as any).avg_value)
                const display = avg ?? (item as any).count ?? '—'
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {formatDate((item as any).date)}
                    </span>
                    <span className="text-sm font-medium text-foreground">{display}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Tickets Solved</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsTrend.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data</p>
          ) : (
            <div className="space-y-2">
              {ticketsTrend.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {formatDate((item as any).date)}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {(item as any).count ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Help Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {helpTrend.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data</p>
          ) : (
            <div className="space-y-2">
              {helpTrend.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {formatDate((item as any).date)}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {(item as any).count ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TrendCharts
