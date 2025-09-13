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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { HelpRequest, CreateHelpRequestRequest, UpdateHelpRequestRequest } from '../../../types/HelpRequest'
import type { Task } from '../../../types/Task'
import type { User } from '../../../types/User'

const createHelpRequestSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  task_id: z.number().min(1, 'Task is required'),
  helper_id: z.number().nullable().optional(),
})

const updateHelpRequestSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  helper_id: z.number().nullable().optional(),
})

interface HelpRequestFormProps {
  helpRequest?: HelpRequest
  availableTasks?: Task[]
  availableUsers?: User[]
  taskId?: number
  onSubmit: (data: CreateHelpRequestRequest | UpdateHelpRequestRequest) => Promise<void>
  isLoading: boolean
}

// Create Form Component
const CreateHelpRequestForm: React.FC<{
  availableTasks: Task[]
  availableUsers: User[]
  taskId?: number
  onSubmit: (data: CreateHelpRequestRequest) => Promise<void>
  isLoading: boolean
}> = ({ availableTasks, availableUsers, taskId, onSubmit, isLoading }) => {
  const form = useForm<z.infer<typeof createHelpRequestSchema>>({
    resolver: zodResolver(createHelpRequestSchema),
    defaultValues: {
      description: '',
      task_id: taskId || 0,
      helper_id: undefined,
    },
  })

  const handleSubmit = async (data: z.infer<typeof createHelpRequestSchema>) => {
    const submitData: CreateHelpRequestRequest = {
      description: data.description,
      task_id: data.task_id,
      helper_id: data.helper_id || undefined,
    }
    await onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what you need help with..."
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
          name="task_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Task</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(Number(value))} 
                value={field.value?.toString() || "0"}
                disabled={isLoading || !!taskId}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{task.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {task.section?.project?.name} &gt; {task.section?.name}
                        </span>
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
          name="helper_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Assign Helper <span className="text-xs text-muted-foreground">(optional)</span>
              </FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))} 
                value={field.value ? field.value.toString() : "none"}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Leave unassigned or select a helper" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Leave unassigned</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Help Request
        </Button>
      </form>
    </Form>
  )
}

// Edit Form Component
const EditHelpRequestForm: React.FC<{
  helpRequest: HelpRequest
  availableUsers: User[]
  onSubmit: (data: UpdateHelpRequestRequest) => Promise<void>
  isLoading: boolean
}> = ({ helpRequest, availableUsers, onSubmit, isLoading }) => {
  const form = useForm<z.infer<typeof updateHelpRequestSchema>>({
    resolver: zodResolver(updateHelpRequestSchema),
    defaultValues: {
      description: helpRequest.description,
      helper_id: helpRequest.helper_id || undefined,
    },
  })

  const handleSubmit = async (data: z.infer<typeof updateHelpRequestSchema>) => {
    const submitData: UpdateHelpRequestRequest = {
      description: data.description,
      helper_id: data.helper_id || undefined,
    }
    await onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what you need help with..."
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
          name="helper_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Assign Helper <span className="text-xs text-muted-foreground">(optional)</span>
              </FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))} 
                value={field.value ? field.value.toString() : "none"}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Leave unassigned or select a helper" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Leave unassigned</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Help Request
        </Button>
      </form>
    </Form>
  )
}

// Main wrapper component
const HelpRequestForm: React.FC<HelpRequestFormProps> = ({
  helpRequest,
  availableTasks = [],
  availableUsers = [],
  taskId,
  onSubmit,
  isLoading
}) => {
  if (helpRequest) {
    // Edit mode
    return (
      <EditHelpRequestForm
        helpRequest={helpRequest}
        availableUsers={availableUsers}
        onSubmit={onSubmit as (data: UpdateHelpRequestRequest) => Promise<void>}
        isLoading={isLoading}
      />
    )
  }

  // Create mode
  return (
    <CreateHelpRequestForm
      availableTasks={availableTasks}
      availableUsers={availableUsers}
      taskId={taskId}
      onSubmit={onSubmit as (data: CreateHelpRequestRequest) => Promise<void>}
      isLoading={isLoading}
    />
  )
}

export default HelpRequestForm
