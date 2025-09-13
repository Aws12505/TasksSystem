import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { Priority } from '../../../types/Task'

interface TaskPriorityBadgeProps {
  priority: Priority
}

const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  const getPriorityText = (priority: Priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  return (
    <Badge variant="outline" className={getPriorityColor(priority)}>
      {getPriorityText(priority)}
    </Badge>
  )
}

export default TaskPriorityBadge
