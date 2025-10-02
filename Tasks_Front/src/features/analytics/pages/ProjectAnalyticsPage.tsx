// pages/ProjectAnalyticsPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useProjectAnalytics } from '../hooks/useProjectAnalytics'
import {
  ArrowLeft,
  FolderOpen,
  CheckSquare,
  Users,
  Clock,
  Star,
  Target,
  BarChart3,
} from 'lucide-react'

const ProjectAnalyticsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { projectAnalytics, isLoading, error } = useProjectAnalytics(projectId!)

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  // Loading (match Enhanced page shell + spacing)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-72 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Analytics
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border"><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error (carded, centered content inside the same shell)
  if (error || !projectAnalytics) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'Project analytics not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { basic_info, health_score, team_analytics, task_analytics, rating_analytics } = projectAnalytics

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with EnhancedAnalyticsPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">
                {basic_info.name}
              </h1>
              <p className="text-muted-foreground">Project Analytics &amp; Health Score</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm capitalize">
              Status: {basic_info.status}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Progress: {basic_info.progress_percentage}%
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link to="/analytics" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Analytics
              </Link>
            </Button>
          </div>
        </div>

        {/* Project Overview (3-up grid, same cadence) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="outline" className="capitalize">
                  {basic_info.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={basic_info.progress_percentage} className="flex-1" />
                  <span className="text-sm font-medium">
                    {basic_info.progress_percentage}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stakeholder</p>
                <p className="text-foreground">{basic_info.stakeholder_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Target className="w-5 h-5" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {health_score.overall_score}
                </div>
                <Badge variant="outline" className={getHealthColor(health_score.health_status)}>
                  {health_score.health_status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span>{health_score.completion_score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quality</span>
                  <span>{health_score.quality_score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timeline</span>
                  <span>{health_score.timeline_score}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Analytics */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-2xl font-bold text-foreground">
                  {team_analytics.team_size}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Assignment</p>
                <p className="text-lg font-medium text-foreground">
                  {team_analytics.avg_assignment_percentage.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Analytics (4-up stats cards like real-time stats cadence) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              <CheckSquare className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {task_analytics.total_tasks}
              </div>
              <p className="text-xs text-muted-foreground">
                Weight: {task_analytics.total_weight}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
              <CheckSquare className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {task_analytics.completed_tasks}
              </div>
              <p className="text-xs text-muted-foreground">
                Weight: {task_analytics.completed_weight}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {task_analytics.in_progress_tasks}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <Clock className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {task_analytics.overdue_tasks}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Analytics (2-up, same spacing as other two-column sections) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Star className="w-5 h-5" />
                Task Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Count</span>
                <span className="font-medium">{rating_analytics.task_ratings.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average</span>
                <Badge variant="outline" className="text-yellow-600 bg-yellow-100">
                  {rating_analytics.task_ratings.average}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Highest</span>
                <span className="font-medium">{rating_analytics.task_ratings.highest}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lowest</span>
                <span className="font-medium">{rating_analytics.task_ratings.lowest}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Stakeholder Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Count</span>
                <span className="font-medium">{rating_analytics.stakeholder_ratings.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average</span>
                <Badge variant="outline" className="text-blue-600 bg-blue-100">
                  {rating_analytics.stakeholder_ratings.average}%
                </Badge>
              </div>
              {rating_analytics.stakeholder_ratings.latest > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latest</span>
                  <span className="font-medium">{rating_analytics.stakeholder_ratings.latest}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Members (full-width card, same spacing) */}
        {team_analytics.team_members.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team_analytics.team_members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.task_count} tasks
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {member.total_assignment_percentage.toFixed(1)}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">workload</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ProjectAnalyticsPage
