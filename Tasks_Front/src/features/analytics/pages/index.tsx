import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAnalytics } from '../hooks/useAnalytics'
import { useAnalyticsStore } from '../stores/analyticsStore'
import { useRatingsStore } from '../../ratings/stores/ratingsStore'
import PerformanceChart from '../components/PerformanceChart'
import SystemStatsDashboard from '../components/SystemStatsDashboard'
import { 
  BarChart3, 
  RefreshCw, 
  Download, 
  Bell,
  Activity,
  TrendingUp,
  Search,
  FolderOpen,
  User,
  Eye,
  ArrowRight,
  Clock,
  Target,
  Star,
  Zap,
  Filter
} from 'lucide-react'
import type { AnalyticsFilters } from '../../../types/Analytics'


const EnhancedAnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({})
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [recentlyViewed, setRecentlyViewed] = useState<{
    users: Array<{ id: number; name: string; viewedAt: string }>
    projects: Array<{ id: number; name: string; viewedAt: string }>
  }>({ users: [], projects: [] })

  const {
    dashboardSummary,
    topPerformers,
    systemStats,
    realTimeStats,
    performanceAlerts,
    isLoading,
    lastUpdated,
    refreshAllData,
    markAlertAsRead
  } = useAnalytics(filters)

  const { fetchTrendData, trendData } = useAnalyticsStore()
  const { availableUsers, availableProjects, fetchAvailableUsers, fetchAvailableProjects } = useRatingsStore()

  // Load reference data
  useEffect(() => {
    fetchAvailableUsers()
    fetchAvailableProjects()
  }, [fetchAvailableUsers, fetchAvailableProjects])

  // Load recently viewed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('analytics_recently_viewed')
    if (stored) {
      setRecentlyViewed(JSON.parse(stored))
    }
  }, [])

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const newDateRange = { ...dateRange, [field]: value }
    setDateRange(newDateRange)
    setFilters({ ...filters, ...newDateRange })
  }

  const handleRefresh = async () => {
    await refreshAllData()
  }

  const handleTrendDataFetch = (metric: 'task_ratings' | 'tickets_solved' | 'help_requests') => {
    fetchTrendData(metric, filters.start_date, filters.end_date)
  }

  const addToRecentlyViewed = (type: 'user' | 'project', id: number, name: string) => {
    const newItem = { id, name, viewedAt: new Date().toISOString() }
    const updated = { ...recentlyViewed }
    
    if (type === 'user') {
      updated.users = [newItem, ...updated.users.filter(u => u.id !== id)].slice(0, 5)
    } else {
      updated.projects = [newItem, ...updated.projects.filter(p => p.id !== id)].slice(0, 5)
    }
    
    setRecentlyViewed(updated)
    localStorage.setItem('analytics_recently_viewed', JSON.stringify(updated))
  }

  const handleUserAnalytics = (userId: number, userName: string) => {
    addToRecentlyViewed('user', userId, userName)
    window.open(`/analytics/users/${userId}`, '_blank')
  }

  const handleProjectAnalytics = (projectId: number, projectName: string) => {
    addToRecentlyViewed('project', projectId, projectName)
    window.open(`/analytics/projects/${projectId}`, '_blank')
  }

  // Filter users and projects based on search
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProjects = availableProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate unread alerts count
  const unreadAlerts = performanceAlerts.filter(alert => !alert.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive performance insights and analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadAlerts > 0 && (
            <Badge variant="destructive" className="relative">
              <Bell className="w-4 h-4 mr-1" />
              {unreadAlerts} alerts
            </Badge>
          )}
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Access Navigation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Analytics Access */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              User Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select User</label>
              <div className="flex gap-2">
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  disabled={!selectedUser}
                  onClick={() => {
                    const user = availableUsers.find(u => u.id.toString() === selectedUser)
                    if (user) handleUserAnalytics(user.id, user.name)
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </div>

            {/* Recent Users */}
            {recentlyViewed.users.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recently Viewed</label>
                <div className="space-y-2">
                  {recentlyViewed.users.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-left"
                      onClick={() => handleUserAnalytics(user.id, user.name)}
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {user.name}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Analytics Access */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Project Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Project</label>
              <div className="flex gap-2">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a project..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {project.progress_percentage}% complete
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  disabled={!selectedProject}
                  onClick={() => {
                    const project = availableProjects.find(p => p.id.toString() === selectedProject)
                    if (project) handleProjectAnalytics(project.id, project.name)
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </div>

            {/* Recent Projects */}
            {recentlyViewed.projects.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recently Viewed</label>
                <div className="space-y-2">
                  {recentlyViewed.projects.map((project) => (
                    <Button
                      key={project.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-left"
                      onClick={() => handleProjectAnalytics(project.id, project.name)}
                    >
                      <span className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        {project.name}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Search */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchQuery && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {/* User Results */}
                {filteredUsers.slice(0, 3).map((user) => (
                  <Button
                    key={`user-${user.id}`}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-left"
                    onClick={() => handleUserAnalytics(user.id, user.name)}
                  >
                    <span className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-xs">{user.name}</p>
                        <Badge variant="secondary" className="text-xs">User</Badge>
                      </div>
                    </span>
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                ))}

                {/* Project Results */}
                {filteredProjects.slice(0, 3).map((project) => (
                  <Button
                    key={`project-${project.id}`}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-left"
                    onClick={() => handleProjectAnalytics(project.id, project.name)}
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-xs">{project.name}</p>
                        <Badge variant="secondary" className="text-xs">Project</Badge>
                      </div>
                    </span>
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <Input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">End Date</label>
              <Input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDateRange({ start_date: '', end_date: '' })
                  setFilters({})
                }}
              >
                Clear Filters
              </Button>
            </div>
            <div>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      {realTimeStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-lg font-bold text-foreground">
                    {realTimeStats.active_users_now}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Today</p>
                  <p className="text-lg font-bold text-foreground">
                    {realTimeStats.tasks_completed_today}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Today</p>
                  <p className="text-lg font-bold text-foreground">
                    {realTimeStats.tickets_resolved_today}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Help Today</p>
                  <p className="text-lg font-bold text-foreground">
                    {realTimeStats.help_requests_today}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Perf</p>
                  <p className="text-lg font-bold text-foreground">
                    {realTimeStats.average_performance_today}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Health</p>
                  <p className="text-lg font-bold text-foreground">
                    {realTimeStats.system_health_score}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({unreadAlerts})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* System Stats */}
            <div className="xl:col-span-2">
              {systemStats ? (
                <SystemStatsDashboard systemStats={systemStats} />
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Loading system statistics...</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Top Performers - Enhanced with Click Actions */}
            <div>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topPerformers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No performance data available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topPerformers.map((performer, index) => (
                        <div 
                          key={performer.id} 
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleUserAnalytics(performer.id, performer.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                              <span className="text-xs font-bold text-primary">
                                #{index + 1}
                              </span>
                            </div>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {performer.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{performer.name}</p>
                              <p className="text-xs text-muted-foreground">{performer.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-yellow-600 bg-yellow-100">
                              {performer.avg_final_rating}%
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {performer.periods_rated} periods
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-6">
            {dashboardSummary?.trends && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <PerformanceChart
                  data={dashboardSummary.trends.task_ratings_trend}
                  title="Task Ratings Trend"
                  dataKey="avg_value"
                  type="line"
                  color="#8884d8"
                />
                <PerformanceChart
                  data={dashboardSummary.trends.tickets_solved_trend}
                  title="Tickets Resolved"
                  dataKey="count"
                  type="area"
                  color="#82ca9d"
                />
                <PerformanceChart
                  data={dashboardSummary.trends.help_requests_trend}
                  title="Help Requests"
                  dataKey="count"
                  type="line"
                  color="#ffc658"
                />
              </div>
            )}

            {/* Custom Trend Analysis */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Custom Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTrendDataFetch('task_ratings')}
                  >
                    Task Ratings
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTrendDataFetch('tickets_solved')}
                  >
                    Tickets Solved
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTrendDataFetch('help_requests')}
                  >
                    Help Requests
                  </Button>
                </div>
                {trendData.length > 0 && (
                  <PerformanceChart
                    data={trendData}
                    title="Selected Trend Data"
                    dataKey="count"
                    type="area"
                    color="#8884d8"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparisons">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Comparison */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Compare Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Select multiple users to compare their performance metrics
                </p>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select users to compare..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Compare Selected Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Comparison */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Compare Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Select multiple projects to compare their analytics
                </p>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select projects to compare..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Compare Selected Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Performance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No performance alerts
                </div>
              ) : (
                <div className="space-y-4">
                  {performanceAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.is_read ? 'bg-muted/20' : 'bg-accent/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={
                                alert.severity === 'critical' ? 'text-red-600 bg-red-100' :
                                alert.severity === 'high' ? 'text-orange-600 bg-orange-100' :
                                alert.severity === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                                'text-blue-600 bg-blue-100'
                              }
                            >
                              {alert.severity}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.user_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const user = availableUsers.find(u => u.id === alert.user_id)
                                if (user) handleUserAnalytics(user.id, user.name)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View User
                            </Button>
                          )}
                          {alert.project_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const project = availableProjects.find(p => p.id === alert.project_id)
                                if (project) handleProjectAnalytics(project.id, project.name)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Project
                            </Button>
                          )}
                          {!alert.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAlertAsRead(alert.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedAnalyticsPage
