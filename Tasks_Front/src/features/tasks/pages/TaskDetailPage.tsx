// pages/TaskDetailPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTask } from '../hooks/useTask'
import { useSubtasks } from '../../subtasks/hooks/useSubtasks'
import { usePermissions } from '@/hooks/usePermissions'
import TaskStatusBadge from '../components/TaskStatusBadge'
import TaskPriorityBadge from '../components/TaskPriorityBadge'
import TaskAssignments from '../components/TaskAssignments'
import SubtasksList from '../../subtasks/components/SubtasksList'
import { 
  Edit, 
  ArrowLeft, 
  CheckSquare, 
  Calendar, 
  Weight, 
  Star, 
  Layers,
  FolderKanban,
  CheckCircle2,
  Clock
} from 'lucide-react'
import type { TaskStatus } from '../../../types/Task'
import TaskComments from '../components/TaskComments'

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const {
    task,
    taskWithAssignments,
    availableUsers,
    isLoading,
    error,
    addUser,
    updateAssignment,
    removeUser,
  } = useTask(id!)
  const { updateTaskStatus } = useSubtasks()
  const { hasPermission, hasAnyPermission } = usePermissions()

  const handleStatusUpdate = async (status: string) => {
    if (!task || !hasPermission('edit tasks')) return
    await updateTaskStatus(task.id, { status: status as TaskStatus })
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 lg:p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl animate-pulse">
                <div className="w-7 h-7 bg-primary/20 rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-muted animate-pulse rounded w-64" />
                <div className="flex gap-2">
                  <div className="h-6 bg-muted animate-pulse rounded w-20" />
                  <div className="h-6 bg-muted animate-pulse rounded w-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-1 space-y-4">
              <div className="h-96 bg-card/50 border border-border animate-pulse rounded-xl" />
              <div className="h-64 bg-card/50 border border-border animate-pulse rounded-xl" />
            </div>
            <div className="xl:col-span-3 space-y-4">
              <div className="h-[500px] bg-card/50 border border-border animate-pulse rounded-xl" />
              <div className="h-96 bg-card/50 border border-border animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (error || !task) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <CheckSquare className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Task Not Found</h2>
              <p className="text-muted-foreground mb-6">{error || 'The task you are looking for does not exist.'}</p>
              <Button asChild variant="outline">
                <Link to="/tasks">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tasks
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <CheckSquare className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {task.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                  {task.latest_final_rating && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {task.latest_final_rating}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {hasPermission('view tasks') && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('in_progress')}
                    disabled={task.status === 'in_progress' || task.status === 'rated'}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('done')}
                    disabled={task.status === 'done' || task.status === 'rated'}
                    className="hover:bg-chart-3/10 hover:text-chart-3"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                </>
              )}
              {hasPermission('edit tasks') && (
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to={`/tasks/${task.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
              {hasAnyPermission(['create task ratings', 'edit task ratings']) && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/ratings/tasks/${task.id}`}>
                    <Star className="mr-2 h-4 w-4" />
                    Rate
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to="/tasks">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar: Task Info + Assignments */}
          <div className="xl:col-span-1 space-y-4">
            {/* Task Information Card */}
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-base">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Task Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {task.description && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Description
                      </p>
                      <p className="text-foreground leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Location
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                      <FolderKanban className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {task.section?.project?.name || 'Unknown Project'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.section?.name || 'Unknown Section'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Weight className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">Weight</p>
                    </div>
                    <Badge variant="outline" className="text-sm font-semibold">
                      {task.weight}
                    </Badge>
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">Subtasks</p>
                    </div>
                    <Badge variant="secondary" className="text-sm font-semibold">
                      {task.subtasks?.length || 0}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 bg-accent/50 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Due Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {task.completed_at && (
                    <div className="flex items-start gap-3 p-2 bg-chart-3/10 border border-chart-3/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Completed</p>
                        <p className="text-sm font-medium text-chart-3">
                          {new Date(task.completed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Assignments */}
            {hasPermission('edit tasks') && (
              <TaskAssignments
                taskWithAssignments={taskWithAssignments}
                availableUsers={availableUsers}
                onAddUser={addUser}
                onUpdateAssignment={updateAssignment}
                onRemoveUser={removeUser}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right Content: Subtasks & Comments */}
          <div className="xl:col-span-3 space-y-4">
            {/* Subtasks Section */}
            {hasPermission('view subtasks') ? (
              <SubtasksList taskId={task.id} />
            ) : (
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Layers className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Subtasks Hidden
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You don't have permission to view subtasks
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <TaskComments taskId={task.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailPage
