import React, { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { SubmitHandler, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Loader2, Star } from 'lucide-react'
import type { CreateTaskRatingRequest } from '../../../types/Rating'
import type { RatingConfig, TaskRatingConfigData } from '../../../types/RatingConfig'

// RHF-friendly form values
interface FormData extends FieldValues {
  rating_data: Record<string, number>
}

interface TaskRatingFormProps {
  taskId: number
  config: RatingConfig
  onSubmit: (data: CreateTaskRatingRequest) => Promise<void>
  isLoading: boolean
}

const TaskRatingForm: React.FC<TaskRatingFormProps> = ({
  taskId,
  config,
  onSubmit,
  isLoading
}) => {
  const configData = config.config_data as TaskRatingConfigData

  // Defaults
  const initialRatingData = useMemo(() => {
    return (configData.fields || []).reduce((acc, field) => {
      acc[field.name] = 0
      return acc
    }, {} as Record<string, number>)
  }, [configData.fields])

  // Dynamic schema: enforce 0..max per field
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodNumber> = {}
    for (const f of (configData.fields || [])) {
      shape[f.name] = z
        .number()
        .min(0, { message: 'Value must be at least 0' })
        .max(f.max_value, { message: `Max is ${f.max_value}` })
    }
    return z.object({ rating_data: z.object(shape) })
  }, [configData.fields])

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { rating_data: initialRatingData }
  })

  useEffect(() => {
    form.reset({ rating_data: initialRatingData })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id])

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    const submitData: CreateTaskRatingRequest = {
      task_id: taskId,
      rating_config_id: config.id, // ← send the config used
      rating_data: data.rating_data
    }
    await onSubmit(submitData)
  }

  // Totals
  const watchedData = form.watch('rating_data')
  const totalRating = Object.values(watchedData || {}).reduce((sum: number, value: number) => sum + (value || 0), 0)
  const maxPossibleRating = (configData.fields || []).reduce((sum, field) => sum + field.max_value, 0)
  const percentageRating = maxPossibleRating > 0 ? Math.round((totalRating / maxPossibleRating) * 100) : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Star className="w-5 h-5" />
          Task Rating - {config.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Rating Fields */}
            <div className="space-y-6">
              {(configData.fields || []).map((field) => (
                <div key={field.name}>
                  <Controller
                    name={`rating_data.${field.name}` as const}
                    control={form.control}
                    render={({ field: controllerField, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                                        <div className="flex-1">
                          <FormLabel className="text-foreground">{field.name}</FormLabel>
                          {field.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.description}
                  </p>
                )}
              </div>
                          <span className="text-sm text-muted-foreground">
                            {Number.isFinite(controllerField.value as number) ? controllerField.value : 0} / {field.max_value}
                          </span>
                        </div>
                        <FormControl>
                          <div className="space-y-3">
                            <Slider
                              value={[Number(controllerField.value ?? 0)]}
                              onValueChange={(value) => controllerField.onChange(value[0])}
                              max={field.max_value}
                              step={1}
                              className="flex-1"
                              disabled={isLoading}
                            />
                            <Input
                              type="number"
                              min={0}
                              max={field.max_value}
                              value={controllerField.value ?? 0}
                              onChange={(e) => {
                                const raw = e.target.value
                                const next = raw === '' ? 0 : Number(raw)
                                controllerField.onChange(Number.isNaN(next) ? 0 : next)
                              }}
                              disabled={isLoading}
                              className="w-24 text-center"
                            />
                          </div>
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="text-destructive">
                            {fieldState.error.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Total Rating Display */}
            <div className="p-4 bg-accent/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Total Rating</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {percentageRating}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {totalRating} / {maxPossibleRating}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Rating
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default TaskRatingForm
