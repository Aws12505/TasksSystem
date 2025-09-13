import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { TicketStatus } from '../../../types/Ticket'

interface TicketStatusBadgeProps {
  status: TicketStatus
}

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return { text: 'Open', className: 'text-red-600 bg-red-100' }
      case 'in_progress':
        return { text: 'In Progress', className: 'text-yellow-600 bg-yellow-100' }
      case 'resolved':
        return { text: 'Resolved', className: 'text-green-600 bg-green-100' }
      default:
        return { text: status, className: 'text-muted-foreground bg-muted' }
    }
  }

  const { text, className } = getStatusInfo(status)

  return (
    <Badge variant="outline" className={className}>
      {text}
    </Badge>
  )
}

export default TicketStatusBadge
