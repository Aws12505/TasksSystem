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
import { Loader2 } from 'lucide-react'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../types/Role'

const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255),
})

const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255),
})

interface RoleFormProps {
  role?: Role
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>
  isLoading: boolean
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSubmit, isLoading }) => {
  const isEditing = !!role

  const form = useForm({
    resolver: zodResolver(isEditing ? updateRoleSchema : createRoleSchema),
    defaultValues: {
      name: role?.name || '',
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
              <FormLabel className="text-foreground">Role Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter role name"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                />
              </FormControl>
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
          {isEditing ? 'Update Role' : 'Create Role'}
        </Button>
      </form>
    </Form>
  )
}

export default RoleForm
