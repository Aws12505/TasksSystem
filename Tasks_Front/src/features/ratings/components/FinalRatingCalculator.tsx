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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Calculator } from 'lucide-react'
import type { CalculateFinalRatingRequest } from '../../../types/Rating'
import type { User } from '../../../types/User'

const finalRatingSchema = z.object({
  user_id: z.number().min(1, 'User is required'),
  period_start: z.string().min(1, 'Start date is required'),
  period_end: z.string().min(1, 'End date is required'),
})

type FormData = z.infer<typeof finalRatingSchema>

interface FinalRatingCalculatorProps {
  availableUsers: User[]
  onCalculate: (userId: number, data: CalculateFinalRatingRequest) => Promise<void>
  isLoading: boolean
}

const FinalRatingCalculator: React.FC<FinalRatingCalculatorProps> = ({
  availableUsers,
  onCalculate,
  isLoading
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(finalRatingSchema),
    defaultValues: {
      user_id: 0,
      period_start: '',
      period_end: '',
    }
  })

  const handleSubmit = async (data: FormData) => {
    const requestData: CalculateFinalRatingRequest = {
      period_start: data.period_start,
      period_end: data.period_end
    }
    await onCalculate(data.user_id, requestData)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculate Final Rating
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">User</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    value={field.value?.toString() || ''}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border-input text-foreground">
                        <SelectValue placeholder="Select user to calculate rating for" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Period Start</FormLabel>
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
                name="period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Period End</FormLabel>
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
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Calculate Final Rating
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FinalRatingCalculator
