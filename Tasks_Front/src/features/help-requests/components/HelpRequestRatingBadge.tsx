import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { HelpRequestRating } from '../../../types/HelpRequest'

interface HelpRequestRatingBadgeProps {
  rating: HelpRequestRating
  penaltyMultiplier?: number | null
}

const HelpRequestRatingBadge: React.FC<HelpRequestRatingBadgeProps> = ({ 
  rating, 
  penaltyMultiplier 
}) => {
  const getRatingInfo = (rating: HelpRequestRating) => {
    switch (rating) {
      case 'legitimate_learning':
        return { text: 'Legitimate Learning', className: 'text-green-600 bg-green-100' }
      case 'basic_skill_gap':
        return { text: 'Basic Skill Gap', className: 'text-blue-600 bg-blue-100' }
      case 'careless_mistake':
        return { text: 'Careless Mistake', className: 'text-orange-600 bg-orange-100' }
      case 'fixing_own_mistakes':
        return { text: 'Fixing Own Mistakes', className: 'text-red-600 bg-red-100' }
      default:
        return { text: rating, className: 'text-muted-foreground bg-muted' }
    }
  }

  const { text, className } = getRatingInfo(rating)

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={className}>
        {text}
      </Badge>
      {penaltyMultiplier && (
        <Badge variant="secondary" className="text-xs">
          {penaltyMultiplier}x penalty
        </Badge>
      )}
    </div>
  )
}

export default HelpRequestRatingBadge
