import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummary } from '../../../types/Analytics'

interface TrendChartsProps {
  data: DashboardSummary | null
  isLoading: boolean
}

// Helpers
const formatAvg = (v: unknown): string | null => {
  // Accept number or numeric string; otherwise return null
  const n =
    typeof v === 'number'
      ? v
      : v == null
      ? NaN
      : Number.parseFloat(String(v).trim())

  return Number.isFinite(n) ? n.toFixed(1) : null
}

const formatDate = (d: string | number | Date) =>
  new Date(d).toLocaleDateString()

const TrendCharts: React.FC<TrendChartsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data || !data.trends) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">No trend data available</p>
        </CardContent>
      </Card>
    )
  }

  const taskTrend = data.trends.task_ratings_trend ?? []
  const ticketsTrend = data.trends.tickets_solved_trend ?? []
  const helpTrend = data.trends.help_requests_trend ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Ratings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {taskTrend.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <div className="space-y-2">
              {taskTrend.slice(0, 5).map((item, index) => {
                const avg = formatAvg((item as any).avg_value)
                const display = avg ?? (item as any).count ?? '—'
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {formatDate((item as any).date)}
                    </span>
                    <span className="text-sm font-medium">{display}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tickets Solved</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsTrend.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <div className="space-y-2">
              {ticketsTrend.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {formatDate((item as any).date)}
                  </span>
                  <span className="text-sm font-medium">
                    {(item as any).count ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Help Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {helpTrend.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <div className="space-y-2">
              {helpTrend.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {formatDate((item as any).date)}
                  </span>
                  <span className="text-sm font-medium">
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
