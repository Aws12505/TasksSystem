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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import type { Subtask, CreateSubtaskRequest, UpdateSubtaskRequest } from '../../../types/Subtask'
import type { Priority } from '../../../types/Task'

const createSubtaskSchema = z.object({
  name: z.string().min(1, 'Subtask name is required').max(255),
  description: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  task_id: z.number()
})

const updateSubtaskSchema = z.object({
  name: z.string().min(1, 'Subtask name is required').max(255),
  description: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  is_complete: z.boolean().optional(),
})

interface SubtaskFormProps {
  subtask?: Subtask
  taskId: number
  onSubmit: (data: CreateSubtaskRequest | UpdateSubtaskRequest) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({ subtask, taskId, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!subtask

  const form = useForm({
    resolver: zodResolver(isEditing ? updateSubtaskSchema : createSubtaskSchema),
    defaultValues: {
      name: subtask?.name || '',
      description: subtask?.description || '',
      due_date: subtask?.due_date ? new Date(subtask.due_date).toISOString().split('T')[0] : '',
      priority: subtask?.priority || 'medium' as Priority,
      is_complete: subtask?.is_complete || false,
      task_id: taskId,
    },
  })

  const handleSubmit = async (data: any) => {
    // Add task_id for create requests
    const submitData = {
      ...data,
      ...(taskId && { task_id: taskId })
    }
    await onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Subtask Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter subtask name"
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
                  placeholder="Enter subtask description (optional)"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                  rows={2}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <FormField
            control={form.control}
            name="is_complete"
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
                    Mark as completed
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Check this box if the subtask is completed
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center gap-2">
          <Button 
            type="submit" 
            size="sm"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {isEditing ? 'Update' : 'Create'}
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default SubtaskForm
