import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { TicketType } from '../../../types/Ticket'

interface TicketTypeBadgeProps {
  type: TicketType
  showEstimate?: boolean
}

const TicketTypeBadge: React.FC<TicketTypeBadgeProps> = ({ type, showEstimate = false }) => {
  const getTypeInfo = (type: TicketType) => {
    switch (type) {
      case 'quick_fix':
        return { 
          text: 'Quick Fix', 
          className: 'text-blue-600 bg-blue-100',
          estimate: '1-2 hours'
        }
      case 'bug_investigation':
        return { 
          text: 'Bug Investigation', 
          className: 'text-purple-600 bg-purple-100',
          estimate: '4-8 hours'
        }
      case 'user_support':
        return { 
          text: 'User Support', 
          className: 'text-green-600 bg-green-100',
          estimate: '30 minutes - 2 hours'
        }
      default:
        return { 
          text: type, 
          className: 'text-muted-foreground bg-muted',
          estimate: 'Unknown'
        }
    }
  }

  const { text, className, estimate } = getTypeInfo(type)

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={className}>
        {text}
      </Badge>
      {showEstimate && (
        <Badge variant="secondary" className="text-xs">
          {estimate}
        </Badge>
      )}
    </div>
  )
}

export default TicketTypeBadge
