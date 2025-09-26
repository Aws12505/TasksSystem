// pages/TaskEditPage.tsx
import React, { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTask } from '../hooks/useTask'
import { useTasks } from '../hooks/useTasks'
import ComprehensiveTaskForm, { type FormData } from '../components/ComprehensiveTaskForm'
import { ArrowLeft, CheckSquare } from 'lucide-react'
import { subtaskService } from '../../../services/subtaskService'
import { taskAssignmentService } from '../../../services/taskAssignmentService'
import type { Subtask } from '../../../types/Subtask'

const TaskEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const taskId = Number(id)
  const { task, taskWithAssignments, isLoading, error } = useTask(taskId)
  const { updateTask } = useTasks()

  // Prepare initial values for the comprehensive form
  const initialValues: Partial<FormData> | undefined = useMemo(() => {
    if (!task) return undefined
    const assignments = taskWithAssignments?.assigned_users?.map(u => ({
      user_id: u.id,
      percentage: u.pivot?.percentage ?? 0
    })) ?? []

    const subtasks = (task.subtasks || []).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description ?? '',
      due_date: s.due_date,
      priority: s.priority
    }))

    return {
      name: task.name,
      description: task.description ?? '',
      weight: task.weight,
      due_date: task.due_date,
      priority: task.priority,
      project_id: task.project_id, // provided by accessor
      section_id: task.section_id,
      subtasks,
      assignments,
    }
  }, [task, taskWithAssignments])

  const handleUpdateTask = async (data: FormData) => {
    if (!task) return

    // 1) Update the base task
    const updated = await updateTask(task.id, {
      name: data.name,
      description: data.description,
      weight: data.weight,
      due_date: data.due_date,
      priority: data.priority,
      section_id: data.section_id,
    })
    if (!updated) return

    // 2) Sync assignments (overwrites current list on backend)
    await taskAssignmentService.assignUsersToTask(task.id, {
      assignments: data.assignments.map(a => ({ user_id: a.user_id, percentage: a.percentage }))
    })

    // 3) Reconcile subtasks
    const existing: Subtask[] = task.subtasks || []
    const incoming = data.subtasks ?? []

    const incomingById = new Map<number, typeof incoming[number]>()
    incoming.forEach(s => { if (s.id) incomingById.set(s.id, s) })

    const existingIds = new Set(existing.map(s => s.id))
    const incomingIds = new Set(incoming.filter(s => s.id).map(s => s.id!))

    // a) update existing that are still present
    await Promise.all(
      existing
        .filter(s => incomingIds.has(s.id))
        .map(s => {
          const payload = incomingById.get(s.id)!
          return subtaskService.updateSubtask(s.id, {
            name: payload.name,
            description: payload.description,
            due_date: payload.due_date,
            priority: payload.priority,
          })
        })
    )

    // b) create new ones (no id)
    await Promise.all(
      incoming
        .filter(s => !s.id)
        .map(s => subtaskService.createSubtask({
          name: s.name,
          description: s.description,
          due_date: s.due_date,
          priority: s.priority,
          task_id: task.id
        }))
    )

    // c) delete removed ones (were existing but not incoming anymore)
    const removedIds = [...existingIds].filter(id => !incomingIds.has(id))
    await Promise.all(removedIds.map(id => subtaskService.deleteSubtask(id)))

    navigate(`/tasks/${task.id}`)
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
          <Link to={`/tasks/${task.id}`}>
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
      <div className="max-w-4xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ComprehensiveTaskForm
              mode="edit"
              sectionId={task.section_id}
              initialValues={initialValues}
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
