import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, FolderOpen, CheckSquare, Star, Ticket, TrendingUp } from 'lucide-react'
import type { DashboardSummary } from '../../../types/Analytics'
import { safeToFixed } from '@/utils/formatters'

interface MetricsCardsProps {
  data: DashboardSummary | null
  isLoading: boolean
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20 bg-muted" />
              <Skeleton className="h-8 w-8 rounded-full bg-muted" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2 bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">No data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Users',
      value: data.system_metrics?.general_stats?.total_users || 0,
      icon: Users,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10'
    },
    {
      title: 'Active Projects',
      value: data.project_health?.active_projects || 0,
      icon: FolderOpen,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10'
    },
    {
      title: 'Tasks Completed',
      value: data.system_metrics?.activity_stats?.tasks_completed || 0,
      icon: CheckSquare,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10'
    },
    {
      title: 'Average Rating',
      value: safeToFixed(data.system_metrics?.quality_stats?.avg_task_rating, 1),
      icon: Star,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10'
    },
    {
      title: 'Tickets Resolved',
      value: data.system_metrics?.activity_stats?.tickets_resolved || 0,
      icon: Ticket,
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10'
    },
    {
      title: 'Performance Score',
      value: safeToFixed(data.user_metrics?.performance_score, 0),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-sans">
                {card.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default MetricsCards
