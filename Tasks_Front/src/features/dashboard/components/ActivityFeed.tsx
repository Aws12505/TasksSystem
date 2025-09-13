import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, Star } from 'lucide-react'
import type { DashboardSummary } from '../../../types/Analytics'

interface ActivityFeedProps {
  data: DashboardSummary | null
  isLoading: boolean
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.recent_activities) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_rating':
        return { icon: Star, color: 'text-chart-4' }
      case 'stakeholder_rating':
        return { icon: Star, color: 'text-chart-1' }
      case 'ticket_completed':
        return { icon: CheckCircle, color: 'text-chart-2' }
      case 'help_request_completed':
        return { icon: CheckCircle, color: 'text-chart-3' }
      default:
        return { icon: Clock, color: 'text-muted-foreground' }
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.recent_activities.map((activity, index) => {
            const { icon: Icon, color } = getActivityIcon(activity.type)
            
            return (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="p-2 rounded-full bg-muted">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    {activity.value && ` (${activity.value})`}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-muted-foreground">
                      User ID: {activity.user_id}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.activity_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                  {activity.type}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
