import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calculator, Calendar, TrendingUp, Code } from 'lucide-react'
import type { FinalRating } from '../../../types/Rating'

interface FinalRatingDisplayProps {
  finalRating: FinalRating
}

const FinalRatingDisplay: React.FC<FinalRatingDisplayProps> = ({ finalRating }) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-500" />
            Final Rating #{finalRating.id}
          </CardTitle>
          <Badge 
            variant="outline" 
            className="text-xl px-4 py-2 bg-purple-50 text-purple-700"
          >
            {finalRating.final_rating}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            {typeof finalRating.user.avatar_url === 'string' && finalRating.user.avatar_url.trim() !== '' && (
              <AvatarImage
              src={finalRating.user.avatar_url}
              alt={finalRating.user.name || 'User avatar'}
              className="object-cover"
              />
              )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {finalRating.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {finalRating.user?.name || 'Unknown User'}
            </p>
            <p className="text-sm text-muted-foreground">
              {finalRating.user?.email}
            </p>
          </div>
        </div>

        {/* Period */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>From: {new Date(finalRating.period_start).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>To: {new Date(finalRating.period_end).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Final Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Overall Performance</span>
            <span className="text-xl font-bold text-foreground">{finalRating.final_rating}%</span>
          </div>
          <Progress value={finalRating.final_rating} className="h-4" />
        </div>

        {/* Variables Used */}
        {Object.keys(finalRating.variables_used).length > 0 && (
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Variables Used
            </h4>
            <div className="space-y-2">
              {Object.entries(finalRating.variables_used).map(([variable, value]) => (
                <div key={variable} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{variable}</span>
                  <Badge variant="outline">{value}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculation Steps */}
        {finalRating.calculation_steps.length > 0 && (
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Calculation Steps
            </h4>
            <div className="space-y-2">
              {finalRating.calculation_steps.map((step, index) => (
                <div key={index} className="p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Step {index + 1}:</span>
                      <span className="ml-2 font-mono text-foreground">
                        {step.expression || step.function || step.variable || `${step.model}.${step.column}`}
                      </span>
                    </div>
                    <Badge variant="outline">{step.result}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Type: {step.type}
                    {step.operation && ` | Operation: ${step.operation}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>Calculated on {new Date(finalRating.calculated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FinalRatingDisplay
