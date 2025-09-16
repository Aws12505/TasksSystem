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
  FinalRatingConfigData,
} from '../../../types/RatingConfig'

// ✅ Model-to-columns mapping based on your actual database schema
const MODEL_COLUMNS = {
  TaskRating: [
    'task_id',
    'rater_id', 
    'rating_data',
    'final_rating',
    'config_snapshot',
    'rated_at',
    'created_at',
    'updated_at'
  ],
  StakeholderRating: [
    'project_id',
    'stakeholder_id',
    'rating_data', 
    'final_rating',
    'config_snapshot',
    'rated_at',
    'created_at',
    'updated_at'
  ],
  Ticket: [
    'title',
    'description',
    'status',
    'type', 
    'priority',
    'requester_id',
    'assigned_to',
    'completed_at',
    'created_at',
    'updated_at'
  ],
  HelpRequest: [
    'description',
    'task_id',
    'requester_id',
    'helper_id',
    'rating',
    'is_completed', 
    'completed_at',
    'created_at',
    'updated_at'
  ]
}

// Base field schemas
const ratingFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  max_value: z.number().min(1, 'Max value must be at least 1'),
})

const formulaVariableSchema = z.object({
  name: z.string().min(1, 'Variable name is required'),
  model: z.string().min(1, 'Model is required'),
  column: z.string().min(1, 'Column is required'),
  operation: z.enum(['sum', 'avg', 'count', 'min', 'max']),
  conditions: z.array(z.object({
    column: z.string(),
    operator: z.string(),
    value: z.any(),
  })).optional(),
})

// Task/Stakeholder rating schema
const taskStakeholderSchema = z.object({
  type: z.union([z.literal('task_rating'), z.literal('stakeholder_rating')]),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  is_active: z.boolean(),
  fields: z.array(ratingFieldSchema).min(1, 'At least one field is required'),
})

// Final rating schema
const finalRatingSchema = z.object({
  type: z.literal('final_rating'),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  is_active: z.boolean(),
  expression: z.string().min(1, 'Expression is required'),
  variables: z.array(formulaVariableSchema).min(1, 'At least one variable is required'),
})

const ratingConfigSchema = z.discriminatedUnion('type', [
  taskStakeholderSchema,
  finalRatingSchema,
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

    if (type === 'final_rating') {
      if (ratingConfig && ratingConfig.type === 'final_rating') {
        const configData = ratingConfig.config_data as FinalRatingConfigData
        return {
          type: 'final_rating',
          ...baseDefaults,
          expression: configData.expression || '',
          variables: configData.variables || [{ 
            name: '', 
            model: 'TaskRating', 
            column: 'final_rating', 
            operation: 'avg' as const,
            conditions: []
          }]
        }
      }
      return {
        type: 'final_rating',
        ...baseDefaults,
        expression: '',
        variables: [{ 
          name: '', 
          model: 'TaskRating', 
          column: 'final_rating', 
          operation: 'avg' as const,
          conditions: []
        }]
      }
    } else {
      if (ratingConfig && ratingConfig.type !== 'final_rating') {
        const configData = ratingConfig.config_data as TaskRatingConfigData | StakeholderRatingConfigData
        return {
          type,
          ...baseDefaults,
          fields: configData.fields || [{ name: '', max_value: 50 }]
        }
      }
      return {
        type,
        ...baseDefaults,
        fields: [{ name: '', max_value: 50 }]
      }
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

  const variablesArray = useFieldArray({
    control: form.control,
    name: 'variables' as any,
  })

  // ✅ Watch model changes for each variable to update column options
  const watchedVariables = form.watch('variables' as any) || []

  const handleSubmit = async (data: FormData) => {
    console.log('✅ Form validation passed, submitting:', data)

    let config_data: TaskRatingConfigData | StakeholderRatingConfigData | FinalRatingConfigData

    if (data.type === 'final_rating') {
      config_data = {
        expression: data.expression,
        variables: data.variables
      } as FinalRatingConfigData
    } else {
      config_data = {
        fields: data.fields
      } as TaskRatingConfigData | StakeholderRatingConfigData
    }

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

  // ✅ Handle model change and update column options
  const handleModelChange = (variableIndex: number, newModel: string) => {
    const availableColumns = MODEL_COLUMNS[newModel as keyof typeof MODEL_COLUMNS] || []
    const firstColumn = availableColumns[0] || ''
    
    // Update both model and column values
    form.setValue(`variables.${variableIndex}.model` as any, newModel)
    form.setValue(`variables.${variableIndex}.column` as any, firstColumn)
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

        {/* Type-specific Configuration */}
        {selectedType === 'final_rating' ? (
          // Final Rating Configuration
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Final Rating Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="expression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Formula Expression</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., (task_avg + stakeholder_avg) * tickets_bonus / penalty_factor"
                        {...field}
                        disabled={isLoading}
                        className="bg-background border-input text-foreground font-mono"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Use variable names defined below in your mathematical expression
                    </p>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <FormLabel className="text-foreground">Variables</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => variablesArray.append({ 
                      name: '', 
                      model: 'TaskRating', 
                      column: 'final_rating', 
                      operation: 'avg',
                      conditions: []
                    })}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                
                {variablesArray.fields.map((variable, index) => {
                  const currentModel = watchedVariables[index]?.model || 'TaskRating'
                  const availableColumns = MODEL_COLUMNS[currentModel as keyof typeof MODEL_COLUMNS] || []
                  
                  return (
                    <Card key={variable.id} className="mb-4 bg-accent/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-foreground">Variable {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => variablesArray.remove(index)}
                            disabled={isLoading || variablesArray.fields.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`variables.${index}.name` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground">Variable Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., task_avg"
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
                            name={`variables.${index}.operation` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground">Operation</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background border-input text-foreground">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="sum">Sum</SelectItem>
                                    <SelectItem value="avg">Average</SelectItem>
                                    <SelectItem value="count">Count</SelectItem>
                                    <SelectItem value="min">Minimum</SelectItem>
                                    <SelectItem value="max">Maximum</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />

                          {/* ✅ Model Select with dynamic column update */}
                          <FormField
                            control={form.control}
                            name={`variables.${index}.model` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground">Model</FormLabel>
                                <Select 
                                  onValueChange={(value) => handleModelChange(index, value)} 
                                  value={field.value} 
                                  disabled={isLoading}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-background border-input text-foreground">
                                      <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="TaskRating">TaskRating</SelectItem>
                                    <SelectItem value="StakeholderRating">StakeholderRating</SelectItem>
                                    <SelectItem value="Ticket">Ticket</SelectItem>
                                    <SelectItem value="HelpRequest">HelpRequest</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />

                          {/* ✅ Dynamic Column Select based on selected model */}
                          <FormField
                            control={form.control}
                            name={`variables.${index}.column` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground">Column</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value} 
                                  disabled={isLoading}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-background border-input text-foreground">
                                      <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableColumns.map((column) => (
                                      <SelectItem key={column} value={column}>
                                        {column}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-destructive" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
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
                  onClick={() => fieldsArray.append({ name: '', max_value: 50 })}
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
        )}

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
