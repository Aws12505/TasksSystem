import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTask } from '../hooks/useTask'
import { useTasks } from '../hooks/useTasks'
import TaskForm from '../components/TaskForm'
import { ArrowLeft, CheckSquare } from 'lucide-react'

const TaskEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { task, isLoading, error } = useTask(id!)
  const { updateTask } = useTasks()

  const handleUpdateTask = async (data: any) => {
    if (!task) return
    const updatedTask = await updateTask(task.id, data)
    if (updatedTask) {
      navigate(`/tasks/${task.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/tasks/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Task
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Edit Task</h1>
            <p className="text-muted-foreground">Update {task.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Task Information</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              task={task}
              onSubmit={handleUpdateTask}
              isLoading={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TaskEditPage
