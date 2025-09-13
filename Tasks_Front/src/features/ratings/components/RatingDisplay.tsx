import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star, Calendar, User } from 'lucide-react'

interface RatingDisplayProps {
  rating: {
    id: number
    rating_data: Record<string, number>
    final_rating: number
    rater?: { name: string; email: string }
    stakeholder?: { name: string; email: string }
    rated_at: string
  }
  maxRating?: number
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ rating, maxRating = 100 }) => {
  const ratingEntries = Object.entries(rating.rating_data)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rating #{rating.id}
          </CardTitle>
          <Badge 
            variant="outline" 
            className="text-lg px-3 py-1"
          >
            {rating.final_rating}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Individual Rating Fields */}
        <div className="space-y-3">
          {ratingEntries.map(([fieldName, value]) => (
            <div key={fieldName} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{fieldName}</span>
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
              <Progress 
                value={(value / maxRating) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">Overall Rating</span>
            <span className="text-lg font-bold text-foreground">{rating.final_rating}%</span>
          </div>
          <Progress value={rating.final_rating} className="h-3" />
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {rating.rater && (
                <>
                  <User className="w-4 h-4" />
                  <span>Rated by {rating.rater.name}</span>
                </>
              )}
              {rating.stakeholder && (
                <>
                  <User className="w-4 h-4" />
                  <span>Rated by {rating.stakeholder.name}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(rating.rated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RatingDisplay
