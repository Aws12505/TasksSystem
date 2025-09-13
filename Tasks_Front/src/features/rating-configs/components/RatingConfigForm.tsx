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

// Fixed Zod schemas
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

// Fixed main schema - all fields properly optional
const createRatingConfigSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  type: z.enum(['task_rating', 'stakeholder_rating', 'final_rating']),
  is_active: z.boolean().optional(),
  fields: z.array(ratingFieldSchema).optional(),
  expression: z.string().optional(),
  variables: z.array(formulaVariableSchema).optional(),
})

// Infer the form type from schema
type FormData = z.infer<typeof createRatingConfigSchema>

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

  // Fixed getInitialData function with proper typing
  const getInitialData = (): FormData => {
    if (!ratingConfig) {
      return {
        name: '',
        description: '',
        type: 'task_rating',
        is_active: false,
        fields: [{ name: '', max_value: 50 }],
        expression: '',
        variables: [{ 
          name: '', 
          model: '', 
          column: '', 
          operation: 'avg',
          conditions: []
        }]
      }
    }

    const baseData = {
      name: ratingConfig.name,
      description: ratingConfig.description || '',
      type: ratingConfig.type,
      is_active: ratingConfig.is_active,
    }

    if (ratingConfig.type === 'final_rating') {
      const configData = ratingConfig.config_data as FinalRatingConfigData
      return {
        ...baseData,
        expression: configData.expression || '',
        variables: configData.variables || [],
        fields: []
      }
    } else {
      const configData = ratingConfig.config_data as TaskRatingConfigData | StakeholderRatingConfigData
      return {
        ...baseData,
        fields: configData.fields || [],
        expression: '',
        variables: []
      }
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(createRatingConfigSchema),
    defaultValues: getInitialData(),
  })

  const { fields: fieldArrayFields, append: appendField, remove: removeField } = useFieldArray({
    control: form.control,
    name: 'fields',
  })

  const { fields: variableArrayFields, append: appendVariable, remove: removeVariable } = useFieldArray({
    control: form.control,
    name: 'variables',
  })

  const handleSubmit = async (data: FormData) => {
    let config_data: TaskRatingConfigData | StakeholderRatingConfigData | FinalRatingConfigData

    if (data.type === 'final_rating') {
      config_data = {
        expression: data.expression || '',
        variables: data.variables || []
      } as FinalRatingConfigData
    } else {
      config_data = {
        fields: data.fields || []
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
    setSelectedType(newType)
    form.setValue('type', newType)
    
    // Reset type-specific fields
    if (newType === 'final_rating') {
      form.setValue('fields', [])
      if (!form.getValues('expression')) {
        form.setValue('expression', '')
      }
      if (!form.getValues('variables') || form.getValues('variables')?.length === 0) {
        form.setValue('variables', [{ 
          name: '', 
          model: '', 
          column: '', 
          operation: 'avg',
          conditions: []
        }])
      }
    } else {
      form.setValue('expression', '')
      form.setValue('variables', [])
      if (!form.getValues('fields') || form.getValues('fields')?.length === 0) {
        form.setValue('fields', [{ name: '', max_value: 50 }])
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
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
                      defaultValue={field.value} 
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
                    onClick={() => appendVariable({ 
                      name: '', 
                      model: '', 
                      column: '', 
                      operation: 'avg',
                      conditions: []
                    })}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                
                {variableArrayFields.map((variable, index) => (
                  <Card key={variable.id} className="mb-4 bg-accent/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-foreground">Variable {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariable(index)}
                          disabled={isLoading || variableArrayFields.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`variables.${index}.name`}
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
                          name={`variables.${index}.operation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Operation</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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

                        <FormField
                          control={form.control}
                          name={`variables.${index}.model`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Model</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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

                        <FormField
                          control={form.control}
                          name={`variables.${index}.column`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Column</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., final_rating"
                                  {...field}
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
              </div>
            </CardContent>
          </Card>
        ) : (
          // Task/Stakeholder Rating Configuration
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
                  onClick={() => appendField({ name: '', max_value: 50 })}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
              
              {fieldArrayFields.map((field, index) => (
                <Card key={field.id} className="bg-accent/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-foreground">Field {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(index)}
                        disabled={isLoading || fieldArrayFields.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`fields.${index}.name`}
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
                        name={`fields.${index}.max_value`}
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
