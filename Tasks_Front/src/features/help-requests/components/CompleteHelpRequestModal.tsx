import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle } from 'lucide-react'
import type { HelpRequestRating, HelpRequestRatingOption } from '../../../types/HelpRequest'

const completeHelpRequestSchema = z.object({
  rating: z.enum(['legitimate_learning', 'basic_skill_gap', 'careless_mistake', 'fixing_own_mistakes']),
})

interface CompleteHelpRequestModalProps {
  ratingOptions: HelpRequestRatingOption[]
  onComplete: (data: { rating: HelpRequestRating }) => Promise<void>
  isLoading?: boolean
  trigger?: React.ReactNode
}

const CompleteHelpRequestModal: React.FC<CompleteHelpRequestModalProps> = ({
  ratingOptions,
  onComplete,
  isLoading = false,
  trigger
}) => {
  const [open, setOpen] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(completeHelpRequestSchema),
  })

  const handleSubmit = async (data: any) => {
    await onComplete(data)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Complete Help Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please rate this help request to help improve our system and provide feedback to users.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Rating Category</FormLabel>
                    <Select onValueChange={field.onChange} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input text-foreground">
                          <SelectValue placeholder="Select rating category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ratingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{option.label}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {option.penalty}x penalty
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Rating Descriptions */}
              <div className="space-y-2 p-4 bg-accent/20 rounded-lg">
                <h4 className="text-sm font-medium text-foreground">Rating Guidelines:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><strong>Legitimate Learning (0.1x):</strong> Valid learning opportunity, minimal penalty</p>
                  <p><strong>Basic Skill Gap (0.3x):</strong> Missing fundamental skills, moderate penalty</p>
                  <p><strong>Careless Mistake (0.6x):</strong> Avoidable error, significant penalty</p>
                  <p><strong>Fixing Own Mistakes (0.8x):</strong> Fixing self-created issues, high penalty</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Request
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CompleteHelpRequestModal
