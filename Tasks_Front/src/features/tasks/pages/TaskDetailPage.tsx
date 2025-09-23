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
    removeUser
  } = useTask(id!)
  
  const { updateTaskStatus } = useSubtasks()
  const { hasPermission, hasAnyPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Task not found'}</p>
      </div>
    )
  }

  const handleStatusUpdate = async (status: string) => {
    if (!hasPermission('edit tasks')) return
    await updateTaskStatus(task.id, { status: status as TaskStatus })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">{task.name}</h1>
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('edit tasks') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={task.status === 'in_progress'}
              >
                Mark In Progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('done')}
                disabled={task.status === 'done'}
              >
                Mark Complete
              </Button>
            </>
          )}
          {hasPermission('edit tasks') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={`/tasks/${task.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </Link>
            </Button>
          )}
          {hasAnyPermission(['create task ratings', 'edit task ratings']) && (
            <Button asChild variant="outline">
              <Link to={`/ratings/tasks/${task.id}`}>
                <Star className="mr-2 h-4 w-4" />
                Rate Task
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Info */}
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

        {/* Subtasks */}
        <div className="lg:col-span-2">
          {hasPermission('view subtasks') ? (
            <SubtasksList taskId={task.id} />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You don't have permission to view subtasks</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskDetailPage
