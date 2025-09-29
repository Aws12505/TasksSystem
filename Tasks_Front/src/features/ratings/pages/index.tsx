// pages/EnhancedRatingsPage.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useRatings } from '../hooks/useRatings'
import { usePermissions } from '@/hooks/usePermissions'
import FinalRatingCalculator from '../components/FinalRatingCalculator'
import FinalRatingDisplay from '../components/FinalRatingDisplay'
import { 
  Star, 
  Users, 
  Calculator, 
  TrendingUp, 
  Search, 
  CheckSquare, 
  FolderOpen,
  ArrowRight,
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

const EnhancedRatingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [recentlyViewed, setRecentlyViewed] = useState<{
    tasks: Array<{ id: number; name: string; viewedAt: string }>
    projects: Array<{ id: number; name: string; viewedAt: string }>
  }>({ tasks: [], projects: [] })
  
  const { 
    finalRatings,
    finalRatingsPagination,
    availableTasks,
    availableProjects,
    availableUsers,
    isLoading, 
    calculateFinalRating,
    fetchFinalRatings,
    goToFinalRatingsPage,
    nextFinalRatingsPage,
    prevFinalRatingsPage
  } = useRatings()

  const { 
    hasPermission, 
    hasAnyPermission 
  } = usePermissions()

  // Permission checks
  const canRateTasks = hasAnyPermission(['create task ratings', 'edit task ratings'])
  const canRateStakeholders = hasAnyPermission(['create stakeholder ratings', 'edit stakeholder ratings'])
  const canViewFinalRatings = hasPermission('view final ratings')
  const canCalculateFinalRatings = hasPermission('calculate final ratings')

  // Load recently viewed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ratings_recently_viewed')
    if (stored) {
      setRecentlyViewed(JSON.parse(stored))
    }
  }, [])

  // Fetch final ratings if user can view them
  useEffect(() => {
    if (canViewFinalRatings && !finalRatings.length) {
      fetchFinalRatings(1)
    }
  }, [canViewFinalRatings, finalRatings.length, fetchFinalRatings])

  const handleCalculateFinalRating = async (userId: number, data: any) => {
    if (!canCalculateFinalRatings) return
    await calculateFinalRating(userId, data)
  }

  const addToRecentlyViewed = (type: 'task' | 'project', id: number, name: string) => {
    const newItem = { id, name, viewedAt: new Date().toISOString() }
    const updated = { ...recentlyViewed }
    
    if (type === 'task') {
      updated.tasks = [newItem, ...updated.tasks.filter(t => t.id !== id)].slice(0, 5)
    } else {
      updated.projects = [newItem, ...updated.projects.filter(p => p.id !== id)].slice(0, 5)
    }
    
    setRecentlyViewed(updated)
    localStorage.setItem('ratings_recently_viewed', JSON.stringify(updated))
  }

  const handleTaskRating = (taskId: number, taskName: string) => {
    if (!canRateTasks) return
    addToRecentlyViewed('task', taskId, taskName)
    window.open(`/ratings/tasks/${taskId}`, '_blank')
  }

  const handleProjectRating = (projectId: number, projectName: string) => {
    if (!canRateStakeholders) return
    addToRecentlyViewed('project', projectId, projectName)
    window.open(`/ratings/projects/${projectId}/stakeholder`, '_blank')
  }

  // Filter tasks and projects based on search
  const filteredTasks = availableTasks.filter(task =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProjects = availableProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate stats (only show if user can view final ratings)
  const totalRatings = canViewFinalRatings ? (finalRatingsPagination?.total || finalRatings.length) : 0
  const averageRating = canViewFinalRatings && finalRatings.length > 0 
    ? finalRatings.reduce((sum, r) => sum + r.final_rating, 0) / finalRatings.length 
    : 0

  const thisMonthRatings = canViewFinalRatings 
    ? finalRatings.filter(r => 
        new Date(r.calculated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    : 0

  // Generate pagination items for final ratings
  const generatePaginationItems = () => {
    if (!finalRatingsPagination) return []

    const items = []
    const { current_page, last_page } = finalRatingsPagination
    
    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) {
        items.push('ellipsis-start')
      }
    }

    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }

    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) {
        items.push('ellipsis-end')
      }
      items.push(last_page)
    }

    return items
  }

  // Permission-based access message
  const NoPermissionMessage: React.FC<{ message: string }> = ({ message }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Ratings Center</h1>
            <p className="text-muted-foreground">Performance evaluation and rating management system</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={isLoading} 
            onClick={() => canViewFinalRatings && fetchFinalRatings(1)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Access Navigation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task Ratings Access */}
        {canRateTasks ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Task Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Task</label>
                <div className="flex gap-2">
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose a task..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{task.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Weight: {task.weight}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    disabled={!selectedTask}
                    onClick={() => {
                      const task = availableTasks.find(t => t.id.toString() === selectedTask)
                      if (task) handleTaskRating(task.id, task.name)
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Rate
                  </Button>
                </div>
              </div>

              {/* Recent Tasks */}
              {recentlyViewed.tasks.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Recently Rated</label>
                  <div className="space-y-2">
                    {recentlyViewed.tasks.map((task) => (
                      <Button
                        key={task.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-left"
                        onClick={() => handleTaskRating(task.id, task.name)}
                      >
                        <span className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4" />
                          {task.name}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <NoPermissionMessage message="You don't have permission to create or edit task ratings" />
        )}

        {/* Project Stakeholder Ratings Access */}
        {canRateStakeholders ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Stakeholder Ratings
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
                      {filteredProjects
                        .filter(project => project.stakeholder_will_rate)
                        .map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{project.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {project.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {project.progress_percentage}% complete
                                </Badge>
                              </div>
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
                      if (project) handleProjectRating(project.id, project.name)
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Rate
                  </Button>
                </div>
              </div>

              {/* Recent Projects */}
              {recentlyViewed.projects.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Recently Rated</label>
                  <div className="space-y-2">
                    {recentlyViewed.projects.map((project) => (
                      <Button
                        key={project.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-left"
                        onClick={() => handleProjectRating(project.id, project.name)}
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
        ) : (
          <NoPermissionMessage message="You don't have permission to create or edit stakeholder ratings" />
        )}

        {/* Quick Search */}
        {hasAnyPermission(['create task ratings', 'edit task ratings', 'create stakeholder ratings', 'edit stakeholder ratings']) ? (
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
                  placeholder="Search tasks or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchQuery && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {/* Task Results */}
                  {canRateTasks && (
                    <div>
                      <h6 className="text-xs font-medium text-muted-foreground mb-2">TASKS</h6>
                      {filteredTasks.slice(0, 3).map((task) => (
                        <Button
                          key={`task-${task.id}`}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-left mb-2"
                          onClick={() => handleTaskRating(task.id, task.name)}
                        >
                          <span className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-xs">{task.name}</p>
                              <Badge variant="secondary" className="text-xs">Task</Badge>
                            </div>
                          </span>
                          <Star className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Project Results */}
                  {canRateStakeholders && (
                    <div>
                      <h6 className="text-xs font-medium text-muted-foreground mb-2">PROJECTS</h6>
                      {filteredProjects
                        .filter(project => project.stakeholder_will_rate)
                        .slice(0, 3)
                        .map((project) => (
                        <Button
                          key={`project-${project.id}`}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-left mb-2"
                          onClick={() => handleProjectRating(project.id, project.name)}
                        >
                          <span className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4 text-orange-500" />
                            <div>
                              <p className="font-medium text-xs">{project.name}</p>
                              <Badge variant="secondary" className="text-xs">Project</Badge>
                            </div>
                          </span>
                          <Users className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <NoPermissionMessage message="You don't have permission to rate tasks or stakeholders" />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Final Ratings
            </CardTitle>
            <Star className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {canViewFinalRatings ? totalRatings : '—'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {canViewFinalRatings ? `${Math.round(averageRating)}%` : '—'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Tasks
            </CardTitle>
            <CheckSquare className="w-4 h-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {canRateTasks ? availableTasks.length : '—'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Projects
            </CardTitle>
            <FolderOpen className="w-4 h-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {canRateStakeholders ? availableProjects.filter(p => p.stakeholder_will_rate).length : '—'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <Calculator className="w-4 h-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {canViewFinalRatings ? thisMonthRatings : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue={canCalculateFinalRatings ? "calculate" : canViewFinalRatings ? "history" : "browse"} className="space-y-4">
        <TabsList className="bg-muted">
          {canCalculateFinalRatings && (
            <TabsTrigger value="calculate">Calculate Final Rating</TabsTrigger>
          )}
          {canViewFinalRatings && (
            <TabsTrigger value="history">Rating History ({totalRatings})</TabsTrigger>
          )}
          {hasAnyPermission(['create task ratings', 'edit task ratings', 'create stakeholder ratings', 'edit stakeholder ratings']) && (
            <TabsTrigger value="browse">Browse Ratings</TabsTrigger>
          )}
        </TabsList>
        
        {canCalculateFinalRatings && (
          <TabsContent value="calculate">
            <div className="max-w-2xl">
              <FinalRatingCalculator
                availableUsers={availableUsers}
                onCalculate={handleCalculateFinalRating}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        )}
        
        {canViewFinalRatings && (
          <TabsContent value="history" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : finalRatings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No final ratings calculated yet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {finalRatings.map((rating) => (
                    <FinalRatingDisplay key={rating.id} finalRating={rating} />
                  ))}
                </div>

                {/* Final Ratings Pagination */}
                {finalRatingsPagination && finalRatingsPagination.last_page > 1 && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {finalRatingsPagination.from || 0} to {finalRatingsPagination.to || 0} of {finalRatingsPagination.total} results
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={prevFinalRatingsPage}
                                className={finalRatingsPagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {generatePaginationItems().map((item, index) => (
                              <PaginationItem key={index}>
                                {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    onClick={() => goToFinalRatingsPage(item as number)}
                                    isActive={finalRatingsPagination.current_page === item}
                                    className="cursor-pointer"
                                  >
                                    {item}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={nextFinalRatingsPage}
                                className={finalRatingsPagination.current_page === finalRatingsPagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        )}

        {hasAnyPermission(['create task ratings', 'edit task ratings', 'create stakeholder ratings', 'edit stakeholder ratings']) && (
          <TabsContent value="browse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Browse Tasks for Rating */}
              {canRateTasks ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <CheckSquare className="w-5 h-5" />
                      Browse Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <CheckSquare className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{task.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleTaskRating(task.id, task.name)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Rate
                          </Button>
                        </div>
                      ))}
                      
                      {availableTasks.length > 5 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View All Tasks ({availableTasks.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <NoPermissionMessage message="You don't have permission to rate tasks" />
              )}

              {/* Browse Projects for Stakeholder Rating */}
              {canRateStakeholders ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Browse Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableProjects
                        .filter(project => project.stakeholder_will_rate)
                        .slice(0, 5)
                        .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{project.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {project.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {project.progress_percentage}% complete
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleProjectRating(project.id, project.name)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Rate
                          </Button>
                        </div>
                      ))}
                      
                      {availableProjects.filter(p => p.stakeholder_will_rate).length > 5 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View All Projects ({availableProjects.filter(p => p.stakeholder_will_rate).length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <NoPermissionMessage message="You don't have permission to rate stakeholders" />
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default EnhancedRatingsPage
