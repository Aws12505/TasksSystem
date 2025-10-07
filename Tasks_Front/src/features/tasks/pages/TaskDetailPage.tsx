// pages/TaskDetailPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTask } from '../hooks/useTask'
import { useSubtasks } from '../../subtasks/hooks/useSubtasks'
import { usePermissions } from '@/hooks/usePermissions'
import TaskStatusBadge from '../components/TaskStatusBadge'
import TaskPriorityBadge from '../components/TaskPriorityBadge'
import TaskAssignments from '../components/TaskAssignments'
import SubtasksList from '../../subtasks/components/SubtasksList'
import { Edit, ArrowLeft, CheckSquare, Calendar, Weight, Star } from 'lucide-react'
import type { TaskStatus } from '../../../types/Task'

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

  // Loading (keep page shell + header cadence)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="h-8 bg-muted animate-pulse rounded w-48" />
                <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tasks
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded w-28" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-40" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border lg:col-span-2">
              <CardContent className="p-6">
                <div className="h-64 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error (carded inside same shell)
  if (error || !task) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || 'Task not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">{task.name}</h1>
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPermission('view tasks') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={
                    task.status === 'in_progress' || task.status === 'rated'
                  }
                >
                  Mark In Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate('done')}
                  disabled={task.status === 'done' || task.status === 'rated'}
                >
                  Mark Complete
                </Button>
              </>
            )}
            {hasPermission('edit tasks') && (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to={`/tasks/${task.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </Link>
              </Button>
            )}
            {hasAnyPermission(['create task ratings', 'edit task ratings']) && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/ratings/tasks/${task.id}`}>
                  <Star className="mr-2 h-4 w-4" />
                  Rate Task
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/tasks" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tasks
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Grid (2-up cadence) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Task Info + Assignments */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Task Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-foreground">{task.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="text-sm font-medium text-foreground">
                    {task.section?.name || 'Unknown Section'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Project: {task.section?.project?.name || 'Unknown Project'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-sm">
                      {task.weight}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Completed At</p>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Not completed'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Subtasks</p>
                  <Badge variant="secondary" className="text-sm">
                    {task.subtasks?.length || 0} subtasks
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Task Assignments - Only show if user can edit tasks */}
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

          {/* Right column: Subtasks */}
          <div className="lg:col-span-2">
            {hasPermission('view subtasks') ? (
              <SubtasksList taskId={task.id} />
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    You don't have permission to view subtasks
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailPage
