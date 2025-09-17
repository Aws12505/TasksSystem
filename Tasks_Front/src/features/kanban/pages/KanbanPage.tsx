import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { ArrowLeft, Calendar, Star, CheckSquare, MoreHorizontal } from 'lucide-react'
import type { TaskStatus } from '../../../types/Task'
import type { Task } from '../../../types/Task'
import type { Section } from '../../../types/Section'

// Types for the Kibo UI Kanban component
type KanbanItem = {
  id: string
  name: string
  column: string
  task: Task
  section: Section
}

type KanbanColumn = {
  id: string
  name: string
}

const ProjectKanbanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id!)
  const { kanbanData, isLoading, error, moveTaskStatus } = useKanban(id!)

  // Transform data for Kibo UI Kanban component
  const transformToKanbanData = () => {
    if (!kanbanData) return { columns: [], items: [] }

    const statusColumns: KanbanColumn[] = [
      { id: 'pending', name: 'Pending' },
      { id: 'in_progress', name: 'In Progress' },
      { id: 'done', name: 'Done' },
      { id: 'rated', name: 'Rated' }
    ]

    const items: KanbanItem[] = []

    // Transform tasks from all sections
    kanbanData.sections.forEach((sectionData) => {
  Object
    .entries(sectionData.tasks_by_status as Record<TaskStatus, Task[]>)
    .forEach(([status, tasks]) => {
      (tasks as Task[]).forEach((task: Task) => {
        items.push({
          id: task.id.toString(),
          name: task.name,
          column: status as TaskStatus,
          task,
          section: sectionData.section,
        })
      })
    })
})

    return { columns: statusColumns, items }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const taskId = parseInt(active.id as string)
    const newStatus = over.id as TaskStatus

    // Check if we're moving to a different column
    const { items } = transformToKanbanData()
    const draggedItem = items.find(item => item.id === active.id)
    
    if (draggedItem && draggedItem.column !== newStatus) {
      await moveTaskStatus(taskId, newStatus)
    }
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

  const { columns, items } = transformToKanbanData()

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
              <p className="text-muted-foreground">
                Manage tasks across {kanbanData.sections.length} sections
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
                  {items.filter(item => item.column === 'in_progress').length}
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
                  {items.filter(item => item.column === 'done').length}
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
                  {items.filter(item => item.column === 'rated').length}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-chart-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="h-[600px]">
        <KanbanProvider
          columns={columns}
          data={items}
          onDragEnd={handleDragEnd}
          className="h-full"
        >
          {(column) => (
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
                {(item: KanbanItem) => (
                  <KanbanCard
                    key={item.id}
                    id={item.id}
                    column={item.column} 
                    name={item.name}
                    className="bg-background"
                  >
                    <TaskCard task={item.task} section={item.section} />
                  </KanbanCard>
                )}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </div>
    </div>
  )
}

// Task Card Component
interface TaskCardProps {
  task: Task
  section: Section
}

const TaskCard: React.FC<TaskCardProps> = ({ task, section }) => {
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

  return (
    <div className="space-y-3">
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-foreground text-sm line-clamp-2">{task.name}</h4>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>

      {/* Section Badge */}
      <Badge variant="outline" className="text-xs">
        {section.name}
      </Badge>

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

        {/* Assigned Users
        {task.assignedUsers && task.assignedUsers.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <div className="flex -space-x-1">
              {task.assignedUsers.slice(0, 3).map((user: any) => (
                <Avatar key={user.id} className="w-5 h-5 border border-background">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignedUsers.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground border border-background">
                  +{task.assignedUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        )} */}

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
