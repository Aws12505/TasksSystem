import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useProjectAnalytics } from '../hooks/useProjectAnalytics'
import { ArrowLeft, FolderOpen, CheckSquare, Users, Clock, Star, Target } from 'lucide-react'

const ProjectAnalyticsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { projectAnalytics, isLoading, error } = useProjectAnalytics(projectId!)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !projectAnalytics) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Project analytics not found'}</p>
      </div>
    )
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/analytics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">
              {projectAnalytics.basic_info.name}
            </h1>
            <p className="text-muted-foreground">Project Analytics & Health Score</p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className="capitalize">
                {projectAnalytics.basic_info.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={projectAnalytics.basic_info.progress_percentage} className="flex-1" />
                <span className="text-sm font-medium">
                  {projectAnalytics.basic_info.progress_percentage}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stakeholder</p>
              <p className="text-foreground">{projectAnalytics.basic_info.stakeholder_name}</p>
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
                {projectAnalytics.health_score.overall_score}
              </div>
              <Badge 
                variant="outline" 
                className={getHealthColor(projectAnalytics.health_score.health_status)}
              >
                {projectAnalytics.health_score.health_status}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span>{projectAnalytics.health_score.completion_score}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quality</span>
                <span>{projectAnalytics.health_score.quality_score}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Timeline</span>
                <span>{projectAnalytics.health_score.timeline_score}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Size */}
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
                {projectAnalytics.team_analytics.team_size}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Assignment</p>
              <p className="text-lg font-medium text-foreground">
                {projectAnalytics.team_analytics.avg_assignment_percentage.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <CheckSquare className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {projectAnalytics.task_analytics.total_tasks}
            </div>
            <p className="text-xs text-muted-foreground">
              Weight: {projectAnalytics.task_analytics.total_weight}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Tasks
            </CardTitle>
            <CheckSquare className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {projectAnalytics.task_analytics.completed_tasks}
            </div>
            <p className="text-xs text-muted-foreground">
              Weight: {projectAnalytics.task_analytics.completed_weight}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {projectAnalytics.task_analytics.in_progress_tasks}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <Clock className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {projectAnalytics.task_analytics.overdue_tasks}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Analytics */}
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
              <span className="font-medium">{projectAnalytics.rating_analytics.task_ratings.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average</span>
              <Badge variant="outline" className="text-yellow-600 bg-yellow-100">
                {projectAnalytics.rating_analytics.task_ratings.average}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Highest</span>
              <span className="font-medium">{projectAnalytics.rating_analytics.task_ratings.highest}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lowest</span>
              <span className="font-medium">{projectAnalytics.rating_analytics.task_ratings.lowest}%</span>
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
              <span className="font-medium">{projectAnalytics.rating_analytics.stakeholder_ratings.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average</span>
              <Badge variant="outline" className="text-blue-600 bg-blue-100">
                {projectAnalytics.rating_analytics.stakeholder_ratings.average}%
              </Badge>
            </div>
            {projectAnalytics.rating_analytics.stakeholder_ratings.latest > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latest</span>
                <span className="font-medium">{projectAnalytics.rating_analytics.stakeholder_ratings.latest}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      {projectAnalytics.team_analytics.team_members.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectAnalytics.team_analytics.team_members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-3 border border-border rounded-lg">
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
  )
}

export default ProjectAnalyticsPage
