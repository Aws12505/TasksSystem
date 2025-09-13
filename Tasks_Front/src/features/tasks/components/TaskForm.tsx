import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, FolderOpen, Layers } from 'lucide-react'
import { useProjectsStore } from '../../projects/stores/projectsStore'
import { useSectionsStore } from '../../sections/stores/sectionsStore'
import type { Task, CreateTaskRequest, UpdateTaskRequest, Priority, TaskStatus } from '../../../types/Task'
import type { Section } from '../../../types/Section'

const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255),
  description: z.string().optional(),
  weight: z.number().min(1, 'Weight must be at least 1').max(100, 'Weight cannot exceed 100'),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  project_id: z.number().min(1, 'Project is required'),
  section_id: z.number().min(1, 'Section is required')
})

const updateTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(255),
  description: z.string().optional(),
  weight: z.number().min(1, 'Weight must be at least 1').max(100, 'Weight cannot exceed 100'),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'in_progress', 'done', 'rated']).optional(),
  project_id: z.number().min(1, 'Project is required'),
  section_id: z.number().min(1, 'Section is required')
})

// Define the form data type based on whether we're editing or creating
type CreateFormData = z.infer<typeof createTaskSchema>
type UpdateFormData = z.infer<typeof updateTaskSchema>

interface TaskFormProps {
  task?: Task
  preSelectedProjectId?: number
  preSelectedSectionId?: number
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>
  isLoading: boolean
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  task, 
  preSelectedProjectId,
  preSelectedSectionId,
  onSubmit, 
  isLoading 
}) => {
  const isEditing = !!task
  
  // Get projects and sections data
  const { 
    projects, 
    fetchProjects, 
    isLoading: projectsLoading 
  } = useProjectsStore()
  
  const { 
    sections, 
    fetchSectionsByProject, 
    isLoading: sectionsLoading 
  } = useSectionsStore()

  const form = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(isEditing ? updateTaskSchema : createTaskSchema),
    defaultValues: {
      name: task?.name || '',
      description: task?.description || '',
      weight: task?.weight || 10,
      due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      priority: (task?.priority || 'medium') as Priority,
      ...(isEditing && { status: task?.status || 'pending' as TaskStatus }),
      project_id: preSelectedProjectId || task?.section?.project?.id || 0,
      section_id: preSelectedSectionId || task?.section_id || 0,
    },
  })

  // Watch project selection to load sections
  const selectedProjectId = form.watch('project_id')

  // Load projects on mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Load sections when project changes
  useEffect(() => {
    if (selectedProjectId && selectedProjectId > 0) {
      fetchSectionsByProject(selectedProjectId)
      // Reset section selection if project changes (except on initial load)
      if (!isEditing && !preSelectedSectionId) {
        form.setValue('section_id', 0)
      }
    }
  }, [selectedProjectId, fetchSectionsByProject, form, isEditing, preSelectedSectionId])

  const handleSubmit = async (data: CreateFormData | UpdateFormData) => {
    // Remove project_id from submission data as it's not needed by the API
    const { project_id, ...submitData } = data
    
    const finalData = {
      ...submitData,
      weight: Number(submitData.weight),
      section_id: Number(submitData.section_id)
    }
    
    await onSubmit(finalData)
  }

  // Get available sections for selected project
  const availableSections = sections.filter((section: Section) => 
    section.project_id === selectedProjectId
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Task Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Task Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter task name"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description (optional)"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                  rows={4}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Project and Section Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Project
                </FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  value={field.value?.toString() || ''}
                  disabled={isLoading || projectsLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          <div>
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
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="section_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Section
                </FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  value={field.value?.toString() || ''}
                  disabled={isLoading || sectionsLoading || !selectedProjectId || selectedProjectId === 0}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder={
                        !selectedProjectId || selectedProjectId === 0 
                          ? "Select project first" 
                          : availableSections.length === 0 
                            ? "No sections available"
                            : "Select a section"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableSections.map((section: Section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{section.name}</p>
                            {section.description && (
                              <p className="text-xs text-muted-foreground">
                                {section.description.slice(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </div>

        {/* Weight, Priority, and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Weight</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                    className="bg-background border-input text-foreground"
                    min="1"
                    max="100"
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Critical
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          {isEditing && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''} 
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border-input text-foreground">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="done">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Done
                        </div>
                      </SelectItem>
                      <SelectItem value="rated">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          Rated
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Due Date */}
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Due Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isLoading || projectsLoading || sectionsLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {(isLoading || projectsLoading || sectionsLoading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </form>
    </Form>
  )
}

export default TaskForm
