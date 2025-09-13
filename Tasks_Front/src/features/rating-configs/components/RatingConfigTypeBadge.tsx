import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { RatingConfigType } from '../../../types/RatingConfig'

interface RatingConfigTypeBadgeProps {
  type: RatingConfigType
}

const RatingConfigTypeBadge: React.FC<RatingConfigTypeBadgeProps> = ({ type }) => {
  const getTypeInfo = (type: RatingConfigType) => {
    switch (type) {
      case 'task_rating':
        return { 
          text: 'Task Rating', 
          className: 'text-blue-600 bg-blue-100'
        }
      case 'stakeholder_rating':
        return { 
          text: 'Stakeholder Rating', 
          className: 'text-purple-600 bg-purple-100'
        }
      case 'final_rating':
        return { 
          text: 'Final Rating', 
          className: 'text-green-600 bg-green-100'
        }
      default:
        return { 
          text: type, 
          className: 'text-muted-foreground bg-muted'
        }
    }
  }

  const { text, className } = getTypeInfo(type)

  return (
    <Badge variant="outline" className={className}>
      {text}
    </Badge>
  )
}

export default RatingConfigTypeBadge
