import React from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import TaskStatusBadge from './TaskStatusBadge'
import TaskPriorityBadge from './TaskPriorityBadge'
import type { Task } from '../../../types/Task'

interface TasksListProps {
  tasks: Task[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
  onStatusChange: (id: number, status: string) => Promise<void>
}

const TasksList: React.FC<TasksListProps> = ({ tasks, isLoading, onDelete, onStatusChange }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks found in this section</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">Task</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Priority</TableHead>
            <TableHead className="text-foreground">Weight</TableHead>
            <TableHead className="text-foreground">Due Date</TableHead>
            <TableHead className="text-foreground">Subtasks</TableHead>
            <TableHead className="text-foreground w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="border-border hover:bg-accent/50">
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{task.name}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>
              <TableCell>
                <TaskPriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {task.weight}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {task.subtasks?.length || 0} subtasks
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                      <Link to={`/tasks/${task.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                      <Link to={`/tasks/${task.id}/edit`} className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task.id, 'in_progress')}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      Mark In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(task.id, 'done')}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TasksList
