import React from 'react'
import { Link } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Star, Play, Check } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/hooks/usePermissions'
import TaskStatusBadge from './TaskStatusBadge'
import TaskPriorityBadge from './TaskPriorityBadge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Task } from '../../../types/Task'

type AssigneeLite = { id: number; name?: string | null; email?: string | null; percentage?: number }
type AssigneesMap = Record<number, AssigneeLite[]>

interface TasksListProps {
  tasks: Task[]
  isLoading: boolean
  onDelete: (id: number) => Promise<void>
  onStatusChange: (id: number, status: string) => Promise<void>
  assigneesMap?: AssigneesMap // optional legacy prop, will fall back to server data
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  isLoading,
  onDelete,
  onStatusChange,
  assigneesMap = {},
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions()

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
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      
        <Table>
          <ScrollArea >
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-foreground">Task</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Priority</TableHead>
              <TableHead className="text-foreground">Assignees</TableHead>
              <TableHead className="text-foreground">Project</TableHead>
              <TableHead className="text-foreground">Latest Rating</TableHead>
              <TableHead className="text-foreground">Due Date</TableHead>
              <TableHead className="text-foreground">Subtasks</TableHead>
              <TableHead className="text-foreground w-[260px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const canView = hasPermission('view tasks')
              const canEdit = hasPermission('edit tasks')
              const canDelete = hasPermission('delete tasks')
              const canRate = hasAnyPermission(['create task ratings', 'edit task ratings'])
              const hasAnyAction = canView || canEdit || canDelete || canRate

              // Prefer server-hydrated assignees; fallback to map (legacy)
              const serverAssignees = (task.assigned_users || []).map(u => ({
                id: u.id,
                name: u.name ?? undefined,
                email: u.email ?? undefined,
                percentage: u.pivot?.percentage,
              }))
              const mappedAssignees = assigneesMap[task.id] || []
              const taskAssignees = serverAssignees.length ? serverAssignees : mappedAssignees

              return (
                <TableRow key={task.id} className="border-border hover:bg-accent/50">
                  <TableCell>
  <div className="space-y-1">
    <Link
      to={`/tasks/${task.id}`}
      className="text-sm font-medium text-foreground hover:text-primary hover:underline"
    >
      {task.name}
    </Link>
  </div>
</TableCell>

                  <TableCell>
                    <TaskStatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <TaskPriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    {taskAssignees.length ? (
                      <div className="flex flex-wrap gap-1">
                        {taskAssignees.map(a => (
                          <Badge key={a.id} variant="outline" className="text-xs">
                            {(a.name || a.email || `User #${a.id}`)}
                            {typeof a.percentage === 'number' ? ` · ${a.percentage}%` : ''}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {(task.project?.name) || (task.section?.project?.name) || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {task.latest_final_rating != null ? (
                      <Badge variant="secondary" className="text-xs">
                        {Number(task.latest_final_rating).toFixed(1)}%
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
                    <div className="flex items-center gap-2">
                      {canView && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8"
                            onClick={() => onStatusChange(task.id, 'in_progress')}
                            disabled={task.status === 'in_progress' || task.status === 'rated'}
                            title="Mark In Progress"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            In Progress
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => onStatusChange(task.id, 'done')}
                            disabled={task.status === 'done' || task.status === 'rated'}
                            title="Mark Complete"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        </>
                      )}
                      {hasAnyAction && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent" title="More actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            {canView && (
                              <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                                <Link to={`/tasks/${task.id}`} className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canEdit && (
                              <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                                <Link to={`/tasks/${task.id}/edit`} className="flex items-center">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canRate && (
                              <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground">
                                <Link to={`/ratings/tasks/${task.id}`} className="flex items-center">
                                  <Star className="mr-2 h-4 w-4" />
                                  Rate Task
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(task.id)}
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          </ScrollArea>
        </Table>
    </div>
  )
}

export default TasksList
