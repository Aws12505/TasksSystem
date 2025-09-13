import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummary } from '../../../types/Analytics'

interface TrendChartsProps {
  data: DashboardSummary | null
  isLoading: boolean
}

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Ratings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.trends.task_ratings_trend?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-sm font-medium">
                  {item.avg_value ? item.avg_value.toFixed(1) : item.count}
                </span>
              </div>
            )) || <p className="text-gray-500">No data</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tickets Solved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.trends.tickets_solved_trend?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            )) || <p className="text-gray-500">No data</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Help Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.trends.help_requests_trend?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            )) || <p className="text-gray-500">No data</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TrendCharts
