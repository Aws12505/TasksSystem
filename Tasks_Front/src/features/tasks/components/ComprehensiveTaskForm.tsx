// components/ComprehensiveTaskForm.tsx
import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Users, List } from 'lucide-react'
import { useProjectsStore } from '../../projects/stores/projectsStore'
import { useSectionsStore } from '../../sections/stores/sectionsStore'
import { userService } from '../../../services/userService'
import type { User } from '../../../types/User'

// 👇 allow optional id on subtasks for edit mode
const subtaskItemSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Subtask name is required'),
  description: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
})

const assignmentItemSchema = z.object({
  user_id: z.number().min(1, 'User is required'),
  percentage: z.number().min(0.01).max(100),
})

const comprehensiveTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255),
  description: z.string().optional(),
  weight: z.number().min(1).max(100),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  project_id: z.number().min(1, 'Project is required'),
  section_id: z.number().min(1, 'Section is required'),
  subtasks: z.array(subtaskItemSchema).optional(),
  assignments: z.array(assignmentItemSchema).min(1, 'At least one assignment is required'),
})

export type FormData = z.infer<typeof comprehensiveTaskSchema>

interface ComprehensiveTaskFormProps {
  mode?: 'create' | 'edit'
  sectionId?: number
  // 👇 initial values used in edit mode
  initialValues?: Partial<FormData>
  onSubmit: (data: FormData) => Promise<void>
  onCancel?: () => void
  isLoading: boolean
}

const ComprehensiveTaskForm: React.FC<ComprehensiveTaskFormProps> = ({
  mode = 'create',
  sectionId,
  initialValues,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectsStore()
  const { sections, fetchSectionsByProject, isLoading: sectionsLoading } = useSectionsStore()

  const form = useForm<FormData>({
    resolver: zodResolver(comprehensiveTaskSchema),
    defaultValues: {
      name: '',
      description: '',
      weight: 10,
      due_date: '',
      priority: 'medium',
      project_id: initialValues?.project_id, // may be undefined at first
      section_id: sectionId ?? initialValues?.section_id,
      subtasks: initialValues?.subtasks ?? [],
      assignments: initialValues?.assignments ?? [],
    }
  })

  // Reset when initialValues change (edit mode)
  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name ?? '',
        description: initialValues.description ?? '',
        weight: initialValues.weight ?? 10,
        due_date: initialValues.due_date ?? '',
        priority: initialValues.priority ?? 'medium',
        project_id: initialValues.project_id,
        section_id: sectionId ?? initialValues.section_id,
        subtasks: initialValues.subtasks ?? [],
        assignments: initialValues.assignments ?? [],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, sectionId])

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask } = useFieldArray({
    control: form.control,
    name: 'subtasks'
  })

  const { fields: assignmentFields, append: appendAssignment, remove: removeAssignment } = useFieldArray({
    control: form.control,
    name: 'assignments'
  })

  const selectedProjectId = form.watch('project_id')
  const assignments = form.watch('assignments') || []

  useEffect(() => {
    fetchProjects()
    fetchUsers()
    // if in edit mode and we already have a project_id, load sections
    if (initialValues?.project_id) {
      fetchSectionsByProject(initialValues.project_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedProjectId && selectedProjectId > 0) {
      fetchSectionsByProject(selectedProjectId)
      if (!sectionId && mode === 'create') {
        form.setValue('section_id', 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId])

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers(1, 100)
      if (response.success && response.data) {
        setAvailableUsers(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleSubmit = async (data: FormData) => {
    // strip project_id before sending to backend (create uses section_id only)
    const { project_id, ...submitData } = data
    await onSubmit({
      ...submitData,
      weight: Number(submitData.weight),
      section_id: Number(submitData.section_id),
      subtasks: submitData.subtasks?.map(s => ({
        ...s,
        due_date: s.due_date,
      })) ?? [],
      assignments: submitData.assignments.map(a => ({
        user_id: Number(a.user_id),
        percentage: Number(a.percentage),
      })),
      // still keep project_id in the form state, not sent to /tasks/comprehensive
      project_id: project_id!,
    } as FormData)
  }

  const availableSections = sections.filter(s => s.project_id === selectedProjectId)
  const assignedUserIds = assignments.map(a => a.user_id)
  const unassignedUsers = availableUsers.filter(u => !assignedUserIds.includes(u.id))
  const totalAssignedPercentage = assignments.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0)

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Task Information */}
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'edit' ? 'Edit Task' : 'Task Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Task Name *</label>
                <Input {...form.register('name')} placeholder="Enter task name" disabled={isLoading} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Weight *</label>
                <Input type="number" {...form.register('weight', { valueAsNumber: true })} min="1" max="100" disabled={isLoading} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea {...form.register('description')} placeholder="Enter task description" disabled={isLoading} rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Due Date *</label>
                <Input type="date" {...form.register('due_date')} disabled={isLoading} />
              </div>

              <div>
                <label className="text-sm font-medium">Priority *</label>
                <Select value={form.watch('priority')} onValueChange={(v) => form.setValue('priority', v as any)} disabled={isLoading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Project *</label>
                <Select
                  value={form.watch('project_id')?.toString() || ''}
                  onValueChange={(v) => form.setValue('project_id', Number(v))}
                  disabled={isLoading || projectsLoading}
                >
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Section *</label>
              <Select
                value={form.watch('section_id')?.toString() || ''}
                onValueChange={(v) => form.setValue('section_id', Number(v))}
                disabled={isLoading || sectionsLoading || !selectedProjectId}
              >
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {availableSections.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subtasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Subtasks ({subtaskFields.length})
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSubtask({ name: '', description: '', due_date: '', priority: 'medium' })}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Subtask
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {subtaskFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3">
                {/* keep hidden id when editing */}
                {('id' in field) && (
                  <input type="hidden" {...form.register(`subtasks.${index}.id` as const)} />
                )}
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Subtask {index + 1}</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSubtask(index)} disabled={isLoading}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input {...form.register(`subtasks.${index}.name` as const)} placeholder="Subtask name" disabled={isLoading} />
                  <Input type="date" {...form.register(`subtasks.${index}.due_date` as const)} disabled={isLoading} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Textarea {...form.register(`subtasks.${index}.description` as const)} placeholder="Subtask description" disabled={isLoading} rows={2} />
                  <Select
                    value={form.watch(`subtasks.${index}.priority` as const)}
                    onValueChange={(v) => form.setValue(`subtasks.${index}.priority` as const, v as any)}
                    disabled={isLoading}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            {subtaskFields.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No subtasks added yet. Click "Add Subtask" to create one.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Assignments ({assignmentFields.length})
              <span className="text-sm font-normal">{totalAssignedPercentage}% assigned</span>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAssignment({ user_id: 0, percentage: 10 })}
              disabled={isLoading || unassignedUsers.length === 0 || totalAssignedPercentage >= 100}
            >
              <Plus className="w-4 h-4 mr-2" /> Assign User
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.formState.errors.assignments && (
              <p className="text-sm text-red-500">{form.formState.errors.assignments.message as string}</p>
            )}
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(totalAssignedPercentage, 100)}%` }} />
            </div>

            {assignmentFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Select
                    value={form.watch(`assignments.${index}.user_id`)?.toString() || ''}
                    onValueChange={(v) => form.setValue(`assignments.${index}.user_id`, Number(v))}
                    disabled={isLoading}
                  >
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>
                      {availableUsers.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Input
                    type="number"
                    {...form.register(`assignments.${index}.percentage`, { valueAsNumber: true })}
                    placeholder="%"
                    min="0.01"
                    max="100"
                    step="0.01"
                    disabled={isLoading}
                  />
                </div>

                <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignment(index)} disabled={isLoading}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {assignmentFields.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No users assigned yet. Click "Assign User" to add assignments.
              </p>
            )}

            {totalAssignedPercentage > 100 && (
              <p className="text-sm text-red-500">Total assignment percentage cannot exceed 100%</p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isLoading || totalAssignedPercentage > 100 || (assignments?.length ?? 0) < 1}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mode === 'edit' ? 'Save Changes' : 'Create Task with Everything'}
          </Button>

          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ComprehensiveTaskForm
