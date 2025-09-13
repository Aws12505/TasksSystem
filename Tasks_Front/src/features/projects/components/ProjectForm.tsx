import React from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../types/Project'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
  stakeholder_will_rate: z.boolean().default(false),
})

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
  stakeholder_will_rate: z.boolean().default(false),
})

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>
  isLoading: boolean
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, isLoading }) => {
  const isEditing = !!project

  const form = useForm({
    resolver: zodResolver(isEditing ? updateProjectSchema : createProjectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      stakeholder_will_rate: project?.stakeholder_will_rate || false,
    },
  })

  const handleSubmit = async (data: any) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter project name"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter project description (optional)"
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

        <FormField
          control={form.control}
          name="stakeholder_will_rate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-foreground">
                  Stakeholder will rate this project
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  Enable if the stakeholder will provide ratings for this project
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </form>
    </Form>
  )
}

export default ProjectForm
