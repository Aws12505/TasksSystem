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
import { Loader2 } from 'lucide-react'
import type { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketTypeOption 
} from '../../../types/Ticket'
import type { User } from '../../../types/User'

const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['quick_fix', 'bug_investigation', 'user_support']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigned_to: z.number().optional(),
})

const updateTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['quick_fix', 'bug_investigation', 'user_support']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  assigned_to: z.number().optional(),
})

interface TicketFormProps {
  ticket?: Ticket
  availableUsers?: User[]
  typeOptions: TicketTypeOption[]
  onSubmit: (data: CreateTicketRequest | UpdateTicketRequest) => Promise<void>
  isLoading: boolean
}

// Create Form Component
const CreateTicketForm: React.FC<{
  availableUsers: User[]
  typeOptions: TicketTypeOption[]
  onSubmit: (data: CreateTicketRequest) => Promise<void>
  isLoading: boolean
}> = ({ availableUsers, typeOptions, onSubmit, isLoading }) => {
  const form = useForm<z.infer<typeof createTicketSchema>>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'quick_fix',
      priority: 'medium',
      assigned_to: undefined,
    },
  })

  const handleSubmit = async (data: z.infer<typeof createTicketSchema>) => {
    const submitData: CreateTicketRequest = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      assigned_to: data.assigned_to,
    }
    await onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter ticket title"
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
                  placeholder="Describe the issue or request..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.estimatedTime}</span>
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

        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Assign to <span className="text-xs text-muted-foreground">(optional)</span>
              </FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === 'unassigned' ? undefined : Number(value))} 
                value={field.value === undefined ? 'unassigned' : field.value.toString()}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Leave unassigned or select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">Leave unassigned</SelectItem>
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
          Create Ticket
        </Button>
      </form>
    </Form>
  )
}

// Edit Form Component
const EditTicketForm: React.FC<{
  ticket: Ticket
  availableUsers: User[]
  typeOptions: TicketTypeOption[]
  onSubmit: (data: UpdateTicketRequest) => Promise<void>
  isLoading: boolean
}> = ({ ticket, availableUsers, typeOptions, onSubmit, isLoading }) => {
  const form = useForm<z.infer<typeof updateTicketSchema>>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      assigned_to: ticket.assigned_to || undefined,
    },
  })

  const handleSubmit = async (data: z.infer<typeof updateTicketSchema>) => {
    const submitData: UpdateTicketRequest = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: data.status,
      assigned_to: data.assigned_to,
    }
    await onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter ticket title"
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
                  placeholder="Describe the issue or request..."
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.estimatedTime}</span>
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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Assign to <span className="text-xs text-muted-foreground">(optional)</span>
              </FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === 'unassigned' ? undefined : Number(value))} 
                value={field.value === undefined ? 'unassigned' : field.value.toString()}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Leave unassigned or select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">Leave unassigned</SelectItem>
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
          Update Ticket
        </Button>
      </form>
    </Form>
  )
}

// Main wrapper component
const TicketForm: React.FC<TicketFormProps> = ({
  ticket,
  availableUsers = [],
  typeOptions,
  onSubmit,
  isLoading
}) => {
  if (ticket) {
    // Edit mode
    return (
      <EditTicketForm
        ticket={ticket}
        availableUsers={availableUsers}
        typeOptions={typeOptions}
        onSubmit={onSubmit as (data: UpdateTicketRequest) => Promise<void>}
        isLoading={isLoading}
      />
    )
  }

  // Create mode
  return (
    <CreateTicketForm
      availableUsers={availableUsers}
      typeOptions={typeOptions}
      onSubmit={onSubmit as (data: CreateTicketRequest) => Promise<void>}
      isLoading={isLoading}
    />
  )
}

export default TicketForm
