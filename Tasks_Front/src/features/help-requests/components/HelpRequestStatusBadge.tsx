import React from 'react'
import { Badge } from '@/components/ui/badge'

interface HelpRequestStatusBadgeProps {
  helpRequest: {
    is_completed: boolean
    is_claimed: boolean
    is_available: boolean
    helper: any
  }
}

const HelpRequestStatusBadge: React.FC<HelpRequestStatusBadgeProps> = ({ helpRequest }) => {
  const getStatusInfo = () => {
    if (helpRequest.is_completed) {
      return { text: 'Completed', variant: 'default', className: 'text-chart-3' }
    }
    if (helpRequest.is_claimed && helpRequest.helper) {
      return { text: 'In Progress', variant: 'default', className: 'text-chart-2' }
    }
    if (helpRequest.is_available) {
      return { text: 'Available', variant: 'secondary', className: 'text-chart-1' }
    }
    return { text: 'Pending', variant: 'outline', className: 'text-muted-foreground' }
  }

  const { text, variant, className } = getStatusInfo()

  return (
    <Badge variant={variant as any} className={className}>
      {text}
    </Badge>
  )
}

export default HelpRequestStatusBadge
