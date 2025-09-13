import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { analyticsService } from '../../../services/analyticsService'
import { TrendingUp, TrendingDown, Award, Calendar } from 'lucide-react'
import type { UserPerformanceOverview } from '../../../types/Analytics'

interface PerformanceMetricsProps {
  userPerformance: UserPerformanceOverview
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ userPerformance }) => {
  const getGrade = (score: number) => analyticsService.getPerformanceGrade(score)
  const getColor = (score: number) => analyticsService.getPerformanceColor(score)
  
  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4" /> // Stable - no icon
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Award className="w-5 h-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Score</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                style={{ 
                  backgroundColor: getColor(userPerformance.performance_score) + '20',
                  color: getColor(userPerformance.performance_score)
                }}
              >
                Grade {getGrade(userPerformance.performance_score)}
              </Badge>
              <span className="text-lg font-bold">{userPerformance.performance_score}%</span>
            </div>
          </div>
          <Progress 
            value={userPerformance.performance_score} 
            className="h-3"
          />
          
          {userPerformance.period.start && userPerformance.period.end && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(userPerformance.period.start).toLocaleDateString()} - {' '}
                {new Date(userPerformance.period.end).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Ratings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Final Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Rating</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(userPerformance.final_ratings.rating_trend)}
              <span className="text-lg font-bold">
                {userPerformance.final_ratings.current_rating}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Average Rating</span>
            <span className="font-medium">
              {userPerformance.final_ratings.average_rating}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Periods</span>
            <Badge variant="outline">
              {userPerformance.final_ratings.total_periods}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground capitalize">
            Trend: {userPerformance.final_ratings.rating_trend}
          </div>
        </CardContent>
      </Card>

      {/* Task Metrics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Task Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <span className="font-medium">
              {Math.round(userPerformance.task_metrics.task_completion_rate * 100)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tasks Completed</span>
            <span className="font-medium">
              {userPerformance.task_metrics.completed_tasks_count} / {userPerformance.task_metrics.assigned_tasks_count}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Weight</span>
            <span className="font-medium">
              {userPerformance.task_metrics.total_task_weight}
            </span>
          </div>
          
          {userPerformance.task_metrics.avg_task_rating_given > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Rating Given</span>
              <Badge variant="outline">
                {userPerformance.task_metrics.avg_task_rating_given}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Metrics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Ticket Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Resolution Rate</span>
            <span className="font-medium">
              {Math.round(userPerformance.ticket_metrics.resolution_rate * 100)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tickets Resolved</span>
            <span className="font-medium">
              {userPerformance.ticket_metrics.tickets_resolved} / {userPerformance.ticket_metrics.tickets_assigned}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tickets Requested</span>
            <span className="font-medium">
              {userPerformance.ticket_metrics.tickets_requested}
            </span>
          </div>
          
          {userPerformance.ticket_metrics.avg_resolution_time > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Resolution Time</span>
              <span className="font-medium">
                {analyticsService.formatDuration(userPerformance.ticket_metrics.avg_resolution_time)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceMetrics
