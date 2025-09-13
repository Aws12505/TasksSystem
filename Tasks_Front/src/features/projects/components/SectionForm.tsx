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
import { Loader2 } from 'lucide-react'
import type { Section } from '../../../types/Section'

const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required').max(255),
  description: z.string().optional(),
})

interface SectionFormProps {
  section?: Section
  onSubmit: (data: { name: string; description?: string }) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const SectionForm: React.FC<SectionFormProps> = ({ section, onSubmit, onCancel, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: section?.name || '',
      description: section?.description || '',
    },
  })

  const handleSubmit = async (data: any) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Section Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter section name"
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
                  placeholder="Enter section description (optional)"
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

        <div className="flex items-center gap-2">
          <Button 
            type="submit" 
            size="sm"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {section ? 'Update' : 'Create'}
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

export default SectionForm
