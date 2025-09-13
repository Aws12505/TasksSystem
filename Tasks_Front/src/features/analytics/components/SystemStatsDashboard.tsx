import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { analyticsService } from '../../../services/analyticsService'
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Ticket, 
  Target,
  Star
} from 'lucide-react'
import type { SystemStats } from '../../../types/Analytics'

interface SystemStatsDashboardProps {
  systemStats: SystemStats
}

const SystemStatsDashboard: React.FC<SystemStatsDashboardProps> = ({ systemStats }) => {
  const formatPercentageChange = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* General Stats */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
          <Users className="w-4 h-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {systemStats.general_stats.total_users.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={getChangeColor(systemStats.growth_stats.users_growth)}
            >
              {formatPercentageChange(systemStats.growth_stats.users_growth)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {systemStats.general_stats.active_users} active
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Projects
          </CardTitle>
          <FolderOpen className="w-4 h-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {systemStats.general_stats.total_projects.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={getChangeColor(systemStats.growth_stats.projects_growth)}
            >
              {formatPercentageChange(systemStats.growth_stats.projects_growth)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {systemStats.activity_stats.projects_completed} completed
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Tasks
          </CardTitle>
          <CheckSquare className="w-4 h-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {systemStats.general_stats.total_tasks.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={getChangeColor(systemStats.growth_stats.tasks_growth)}
            >
              {formatPercentageChange(systemStats.growth_stats.tasks_growth)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {systemStats.activity_stats.tasks_completed} completed
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Tickets
          </CardTitle>
          <Ticket className="w-4 h-4 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {systemStats.general_stats.total_tickets.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={getChangeColor(systemStats.growth_stats.tickets_growth)}
            >
              {formatPercentageChange(systemStats.growth_stats.tickets_growth)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {systemStats.activity_stats.tickets_resolved} resolved
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="bg-card border-border md:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Task Completion Time</p>
              <p className="text-lg font-semibold text-foreground">
                {analyticsService.formatDuration(systemStats.performance_stats.avg_task_completion_time)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Resolution Time</p>
              <p className="text-lg font-semibold text-foreground">
                {analyticsService.formatDuration(systemStats.performance_stats.avg_ticket_resolution_time)}
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">System Efficiency</span>
              <span className="text-sm font-medium">
                {systemStats.performance_stats.system_efficiency_score}%
              </span>
            </div>
            <Progress value={systemStats.performance_stats.system_efficiency_score} />
          </div>
        </CardContent>
      </Card>

      {/* Quality Stats */}
      <Card className="bg-card border-border md:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Star className="w-5 h-5" />
            Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg Task Rating</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-yellow-600 bg-yellow-100">
                  {systemStats.quality_stats.avg_task_rating}%
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Stakeholder Rating</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600 bg-blue-100">
                  {systemStats.quality_stats.avg_stakeholder_rating}%
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">High Quality Tasks</span>
              <span className="text-sm font-medium">
                {systemStats.quality_stats.high_quality_tasks_percentage}%
              </span>
            </div>
            <Progress value={systemStats.quality_stats.high_quality_tasks_percentage} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemStatsDashboard
