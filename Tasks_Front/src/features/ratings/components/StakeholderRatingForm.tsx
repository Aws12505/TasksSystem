import React from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import { Loader2, Users } from 'lucide-react'
import type { CreateStakeholderRatingRequest } from '../../../types/Rating'
import type { RatingConfig, StakeholderRatingConfigData } from '../../../types/RatingConfig'

// Fixed Zod schema with explicit key and value types
const stakeholderRatingSchema = z.object({
  rating_data: z.record(z.string(), z.number().min(0).max(100))
})

type FormData = z.infer<typeof stakeholderRatingSchema>

interface StakeholderRatingFormProps {
  projectId: number
  config: RatingConfig
  onSubmit: (data: CreateStakeholderRatingRequest) => Promise<void>
  isLoading: boolean
}

const StakeholderRatingForm: React.FC<StakeholderRatingFormProps> = ({
  projectId,
  config,
  onSubmit,
  isLoading
}) => {
  const configData = config.config_data as StakeholderRatingConfigData
  
  // Build initial rating data from config fields with proper typing
  const initialRatingData: Record<string, number> = configData.fields.reduce((acc, field) => {
    acc[field.name] = 0
    return acc
  }, {} as Record<string, number>)

  const form = useForm<FormData>({
    resolver: zodResolver(stakeholderRatingSchema),
    defaultValues: {
      rating_data: initialRatingData
    }
  })

  const handleSubmit = async (data: FormData) => {
    const submitData: CreateStakeholderRatingRequest = {
      project_id: projectId,
      rating_data: data.rating_data
    }
    await onSubmit(submitData)
  }

  // Calculate total rating as we go with proper typing
  const watchedData = form.watch('rating_data')
  const totalRating = Object.values(watchedData || {}).reduce((sum: number, value: number) => sum + (value || 0), 0)
  const maxPossibleRating = configData.fields.reduce((sum, field) => sum + field.max_value, 0)
  const percentageRating = maxPossibleRating > 0 ? Math.round((totalRating / maxPossibleRating) * 100) : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users className="w-5 h-5" />
          Stakeholder Rating - {config.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Rating Fields */}
            <div className="space-y-6">
              {configData.fields.map((field) => (
                <div key={field.name}>
                  <Controller
                    name={`rating_data.${field.name}` as any}
                    control={form.control}
                    render={({ field: controllerField, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel className="text-foreground">{field.name}</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {controllerField.value || 0} / {field.max_value}
                          </span>
                        </div>
                        <FormControl>
                          <div className="space-y-3">
                            <Slider
                              value={[controllerField.value || 0]}
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
                              value={controllerField.value || 0}
                              onChange={(e) => controllerField.onChange(Number(e.target.value))}
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

export default StakeholderRatingForm
