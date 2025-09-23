import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  KanbanProvider, 
  KanbanBoard, 
  KanbanHeader, 
  KanbanCards, 
  KanbanCard,
  type DragEndEvent 
} from '@/components/ui/kibo-ui/kanban'
import { useKanban } from '../hooks/useKanban'
import { useProject } from '../../projects/hooks/useProject'
import { usePermissions } from '@/hooks/usePermissions'
import { ArrowLeft, Calendar, Star, CheckSquare, MoreHorizontal, Edit, Trash2, AlertCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TaskStatus } from '../../../types/Task'
import type { Task } from '../../../types/Task'
import type { Section } from '../../../types/Section'
import { useTasks } from '@/features/tasks/hooks/useTasks'

// Enhanced types for section-based Kanban
type SectionKanbanItem = {
  id: string
  name: string
  column: string // Format: "sectionId-status"
  task: Task
  section: Section
  sectionId: number
  status: TaskStatus
}

type SectionKanbanColumn = {
  id: string // Format: "sectionId-status"
  name: string
  sectionId: number
  status: TaskStatus
  section: Section
}

const ProjectKanbanPage: React.FC = () => {
  const { deleteTask } = useTasks()
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id!)
  const { kanbanData, isLoading, error, moveTaskStatus, moveTaskToSection } = useKanban(id!)
  const { hasPermission, hasAnyPermission } = usePermissions()

  // Check permissions
  const canEditTasks = hasPermission('edit tasks')
  const canDeleteTasks = hasPermission('delete tasks')
  const canRateTasks = hasAnyPermission(['create task ratings', 'edit task ratings'])

  // Transform data for section-based Kanban
  const transformToSectionKanbanData = () => {
    if (!kanbanData) return { columns: [], items: [] }

    const columns: SectionKanbanColumn[] = []
    const items: SectionKanbanItem[] = []

    // Create columns for each section-status combination
    kanbanData.sections.forEach((sectionData) => {
      const statuses: TaskStatus[] = ['pending', 'in_progress', 'done', 'rated']
      
      statuses.forEach((status) => {
        columns.push({
          id: `${sectionData.section.id}-${status}`,
          name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          sectionId: sectionData.section.id,
          status: status,
          section: sectionData.section
        })
      })

      // Add tasks
      Object.entries(sectionData.tasks_by_status as Record<TaskStatus, Task[]>)
        .forEach(([status, tasks]) => {
          (tasks as Task[]).forEach((task: Task) => {
            items.push({
              id: task.id.toString(),
              name: task.name,
              column: `${sectionData.section.id}-${status}`,
              task,
              section: sectionData.section,
              sectionId: sectionData.section.id,
              status: status as TaskStatus
            })
          })
        })
    })

    return { columns, items }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canEditTasks) return // Don't allow drag and drop if user can't edit tasks

    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const taskId = parseInt(active.id as string)
    const [targetSectionId, targetStatus] = (over.id as string).split('-')
    
    const { items } = transformToSectionKanbanData()
    const draggedItem = items.find(item => item.id === active.id)
    
    if (!draggedItem) return

    const currentSectionId = draggedItem.sectionId
    const currentStatus = draggedItem.status
    const newSectionId = parseInt(targetSectionId)
    const newStatus = targetStatus as TaskStatus

    // Check if we need to move to a different section
    if (currentSectionId !== newSectionId) {
      await moveTaskToSection(taskId, newSectionId)
    }
    
    // Check if we need to change status
    if (currentStatus !== newStatus) {
      await moveTaskStatus(taskId, newStatus)
    }
  }

  const handleEditTask = (task: Task) => {
    if (!canEditTasks) return
    // You might want to open a task edit dialog here
    window.open(`/tasks/${task.id}/edit`, '_blank')
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!canDeleteTasks) return
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId)
    }
  }

  const handleRateTask = (taskId: number) => {
    if (!canRateTasks) return
    window.open(`/ratings/tasks/${taskId}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !kanbanData) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Failed to load kanban data'}</p>
      </div>
    )
  }

  // Check if user has no permissions to interact with kanban
  if (!hasPermission('view tasks')) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-sans">
                  {project?.name} - Kanban Board
                </h1>
                <p className="text-muted-foreground">Access restricted</p>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              You don't have permission to view tasks in the Kanban board.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { columns, items } = transformToSectionKanbanData()

  // Group columns by section for organized display
  const groupedColumns = kanbanData.sections.map(sectionData => ({
    section: sectionData.section,
    columns: columns.filter(col => col.sectionId === sectionData.section.id)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/projects/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">
                {project?.name} - Section-Based Kanban
              </h1>
              <p className="text-muted-foreground">
                Manage tasks across {kanbanData.sections.length} sections and 4 statuses
                {!canEditTasks && ' (Read-only)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {items.filter(item => item.status === 'in_progress').length}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {items.filter(item => item.status === 'done').length}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rated</p>
                <p className="text-2xl font-bold text-foreground">
                  {items.filter(item => item.status === 'rated').length}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-chart-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Notice */}
      {!canEditTasks && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">
                You have read-only access. You cannot move tasks or modify their status.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section-Based Kanban Board */}
      <div className="space-y-8">
        {groupedColumns.map((group) => (
          <Card key={group.section.id} className="bg-background">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span>{group.section.name}</span>
                <Badge variant="outline">
                  {items.filter(item => item.sectionId === group.section.id).length} tasks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <KanbanProvider
                  columns={group.columns}
                  data={items}
                  onDragEnd={handleDragEnd}
                  className="h-full"
                >
                  {(column: SectionKanbanColumn) => (
                    <KanbanBoard key={column.id} id={column.id} className="h-full">
                      <KanbanHeader className="bg-background border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{column.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {items.filter(item => item.column === column.id).length}
                          </Badge>
                        </div>
                      </KanbanHeader>
                      <KanbanCards id={column.id}>
                        {(item: SectionKanbanItem) => (
                          <KanbanCard
                            key={item.id}
                            id={item.id}
                            column={item.column}
                            name={item.name}
                            className="bg-background"
                          >
                            <TaskCard 
                              task={item.task} 
                              section={item.section}
                              canEdit={canEditTasks}
                              canDelete={canDeleteTasks}
                              canRate={canRateTasks}
                              onEdit={() => handleEditTask(item.task)}
                              onDelete={() => handleDeleteTask(item.task.id)}
                              onRate={() => handleRateTask(item.task.id)}
                            />
                          </KanbanCard>
                        )}
                      </KanbanCards>
                    </KanbanBoard>
                  )}
                </KanbanProvider>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Updated TaskCard component with permissions
interface TaskCardProps {
  task: Task
  section: Section
  canEdit: boolean
  canDelete: boolean
  canRate: boolean
  onEdit: () => void
  onDelete: () => void
  onRate: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  canEdit, 
  canDelete, 
  canRate,
  onEdit,
  onDelete,
  onRate
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const isOverdue = new Date(task.due_date) < new Date() && 
    task.status !== 'done' && task.status !== 'rated'

  const hasAnyAction = canEdit || canDelete || canRate

  return (
    <div className="space-y-3">
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-foreground text-sm line-clamp-2">{task.name}</h4>
        {hasAnyAction ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              {canEdit && (
                <DropdownMenuItem onClick={onEdit} className="hover:bg-accent hover:text-accent-foreground">
                  <Edit className="mr-2 h-3 w-3" />
                  Edit Task
                </DropdownMenuItem>
              )}
              {canRate && (
                <DropdownMenuItem onClick={onRate} className="hover:bg-accent hover:text-accent-foreground">
                  <Star className="mr-2 h-3 w-3" />
                  Rate Task
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-6 w-6" /> // Placeholder to maintain layout
        )}
      </div>

      {/* Task Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
            <span className="text-muted-foreground capitalize">{task.priority}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{task.weight}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{new Date(task.due_date).toLocaleDateString()}</span>
          {isOverdue && <span className="text-red-500 font-medium">(Overdue)</span>}
        </div>

        {/* Subtasks Progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <CheckSquare className="w-3 h-3 inline mr-1" />
            {task.subtasks.filter((s: any) => s.is_complete).length}/{task.subtasks.length} subtasks
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}
    </div>
  )
}

export default ProjectKanbanPage
