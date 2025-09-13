import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '../../../types/Task'

interface TaskStatusBadgeProps {
  status: TaskStatus
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'in_progress':
        return 'default'
      case 'done':
        return 'default'
      case 'rated':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'text-chart-1'
      case 'in_progress':
        return 'text-chart-2'
      case 'done':
        return 'text-chart-3'
      case 'rated':
        return 'text-chart-4'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'in_progress':
        return 'In Progress'
      case 'done':
        return 'Done'
      case 'rated':
        return 'Rated'
      default:
        return status
    }
  }

  return (
    <Badge variant={getStatusVariant(status)} className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  )
}

export default TaskStatusBadge
