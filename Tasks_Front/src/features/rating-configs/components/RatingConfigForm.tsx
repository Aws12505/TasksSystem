import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Plus, Trash2, Settings } from 'lucide-react'
import type { 
  RatingConfig, 
  CreateRatingConfigRequest, 
  RatingConfigType,
  TaskRatingConfigData,
  StakeholderRatingConfigData,
} from '../../../types/RatingConfig'


// Base field schemas
const ratingFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  max_value: z.number().min(1, 'Max value must be at least 1'),
  description: z.string().optional(),
})



// Task/Stakeholder rating schema
const taskStakeholderSchema = z.object({
  type: z.union([z.literal('task_rating'), z.literal('stakeholder_rating')]),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  is_active: z.boolean(),
  fields: z.array(ratingFieldSchema).min(1, 'At least one field is required'),
})


const ratingConfigSchema = z.discriminatedUnion('type', [
  taskStakeholderSchema,
])

type FormData = z.infer<typeof ratingConfigSchema>

interface RatingConfigFormProps {
  ratingConfig?: RatingConfig
  onSubmit: (data: CreateRatingConfigRequest) => Promise<void>
  isLoading: boolean
}

const RatingConfigForm: React.FC<RatingConfigFormProps> = ({ 
  ratingConfig, 
  onSubmit, 
  isLoading 
}) => {
  const isEditing = !!ratingConfig
  const [selectedType, setSelectedType] = useState<RatingConfigType>(
    ratingConfig?.type || 'task_rating'
  )

  const getDefaultValues = (type: RatingConfigType): FormData => {
    const baseDefaults = {
      name: ratingConfig?.name || '',
      description: ratingConfig?.description || '',
      is_active: ratingConfig?.is_active ?? false,
    }

    
      if (ratingConfig ) {
        const configData = ratingConfig.config_data as TaskRatingConfigData | StakeholderRatingConfigData
        return {
          type,
          ...baseDefaults,
          fields: configData.fields || [{ name: '', max_value: 50, description: '' }]
        }
      }
      return {
        type,
        ...baseDefaults,
        fields: [{ name: '', max_value: 50, description: '' }]
      }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(ratingConfigSchema),
    defaultValues: getDefaultValues(selectedType),
    mode: 'onSubmit',
  })

  const fieldsArray = useFieldArray({
    control: form.control,
    name: 'fields' as any,
  })

  const handleSubmit = async (data: FormData) => {

    let config_data: TaskRatingConfigData | StakeholderRatingConfigData

      config_data = {
        fields: data.fields
      } as TaskRatingConfigData | StakeholderRatingConfigData

    const submitData: CreateRatingConfigRequest = {
      name: data.name,
      description: data.description,
      type: data.type,
      config_data,
      is_active: data.is_active
    }

    await onSubmit(submitData)
  }

  const handleTypeChange = (newType: RatingConfigType) => {
    console.log('🔄 Changing type from', selectedType, 'to', newType)
    setSelectedType(newType)
    const newDefaults = getDefaultValues(newType)
    form.reset(newDefaults)
  }



  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(
          handleSubmit,
          (errors) => {
            console.log('❌ Form validation errors:', errors)
          }
        )} 
        className="space-y-6"
      >
        {/* Basic Information - Same as before */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter configuration name"
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
                      placeholder="Enter configuration description (optional)"
                      {...field}
                      disabled={isLoading}
                      className="bg-background border-input text-foreground"
                      rows={3}
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
                    <Select 
                      onValueChange={handleTypeChange} 
                      value={field.value} 
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border-input text-foreground">
                          <SelectValue placeholder="Select configuration type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="task_rating">Task Rating</SelectItem>
                        <SelectItem value="stakeholder_rating">Stakeholder Rating</SelectItem>
                        <SelectItem value="final_rating">Final Rating</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-foreground">
                        Active Configuration
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Set as the active configuration for this type
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

          // Task/Stakeholder Rating Configuration - Same as before
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Rating Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Define the fields that will be used for {selectedType.replace('_', ' ')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fieldsArray.append({ name: '', max_value: 50, description: '' })}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
              
              {fieldsArray.fields.map((field, index) => (
                <Card key={field.id} className="bg-accent/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-foreground">Field {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fieldsArray.remove(index)}
                        disabled={isLoading || fieldsArray.fields.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`fields.${index}.name` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Field Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Code Cleanliness"
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
    name={`fields.${index}.description` as any}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-foreground">Description</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Describe what this field measures..."
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

                      <FormField
                        control={form.control}
                        name={`fields.${index}.max_value` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Max Value</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                disabled={isLoading}
                                className="bg-background border-input text-foreground"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>


        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Configuration' : 'Create Configuration'}
        </Button>
      </form>
    </Form>
  )
}

export default RatingConfigForm
