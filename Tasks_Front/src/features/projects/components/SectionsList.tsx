import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Plus, 
  List, 
  ChevronDown, 
  ChevronRight,
  CheckSquare,
  Calendar,
  Star
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import SectionForm from './SectionForm'
import { useTasks } from '../../tasks/hooks/useTasks'
import { useTaskDialog } from '@/components/TaskDialogProvider' // 🔑 Import the hook
import type { Section } from '../../../types/Section'
import type { Task } from '../../../types/Task'

interface SectionsListProps {
  sections: Section[]
  projectId: number
  onCreateSection: (data: { name: string; description?: string; project_id: number }) => Promise<void>
  onUpdateSection: (id: number, data: { name?: string; description?: string }) => Promise<void>
  onDeleteSection: (id: number) => Promise<void>
  isLoading: boolean
}

const SectionsList: React.FC<SectionsListProps> = ({ 
  sections, 
  projectId, 
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  isLoading 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  
  // 🔑 Use the task dialog hook
  const { openTaskDialog } = useTaskDialog()

  const handleCreateSection = async (data: any) => {
    await onCreateSection({ ...data, project_id: projectId })
    setShowCreateForm(false)
  }

  const handleUpdateSection = async (data: any) => {
    if (editingSection) {
      await onUpdateSection(editingSection.id, data)
      setEditingSection(null)
    }
  }

  const handleDeleteSection = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      await onDeleteSection(id)
    }
  }

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <List className="w-5 h-5" />
            Sections & Tasks ({sections.length})
          </CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Section Form */}
        {showCreateForm && (
          <div className="p-4 border border-border rounded-lg bg-accent/20">
            <h4 className="text-sm font-medium text-foreground mb-3">Create New Section</h4>
            <SectionForm
              onSubmit={handleCreateSection}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Sections List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No sections yet. Create your first section to get started.
          </p>
        ) : (
          sections.map((section) => (
            <SectionWithTasks
              key={section.id}
              section={section}
              projectId={projectId}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              onEdit={() => setEditingSection(section)}
              onDelete={() => handleDeleteSection(section.id)}
              isEditing={editingSection?.id === section.id}
              editingSection={editingSection}
              onUpdateSection={handleUpdateSection}
              onCancelEdit={() => setEditingSection(null)}
              openTaskDialog={openTaskDialog} // 🔑 Pass the portal function
              isLoading={isLoading}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

// 🔑 Simplified section component
interface SectionWithTasksProps {
  section: Section
  projectId: number
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  isEditing: boolean
  editingSection: Section | null
  onUpdateSection: (data: any) => Promise<void>
  onCancelEdit: () => void
  openTaskDialog: (section: Section, projectId: number, task?: Task) => void // 🔑 Portal function
  isLoading: boolean
}

const SectionWithTasks: React.FC<SectionWithTasksProps> = ({
  section,
  projectId,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  isEditing,
  editingSection,
  onUpdateSection,
  onCancelEdit,
  openTaskDialog, // 🔑 Portal function
  isLoading
}) => {
  const { tasks, deleteTask } = useTasks(section.id)

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId)
    }
  }

  if (isEditing) {
    return (
      <div className="p-4 border border-border rounded-lg bg-accent/20">
        <h4 className="text-sm font-medium text-foreground mb-3">Edit Section</h4>
        <SectionForm
          section={editingSection!}
          onSubmit={onUpdateSection}
          onCancel={onCancelEdit}
          isLoading={isLoading}
        />
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <div className="w-3 h-3 bg-chart-2 rounded-full" />
              <div>
                <h4 className="font-medium text-foreground">{section.name}</h4>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {tasks.length} tasks
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Section
                  </DropdownMenuItem>
                  
                  {/* 🔑 This now uses the portal - NO MORE ISSUES! */}
                  <DropdownMenuItem
                    onClick={(e) => { 
                      e.stopPropagation(),
                      e.preventDefault(),
                      openTaskDialog(section, projectId) // 🔑 Portal call
                    }}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border">
            <div className="p-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No tasks in this section yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => (openTaskDialog(section, projectId), e.stopPropagation(), e.preventDefault())} // 🔑 Portal call
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-foreground">Tasks ({tasks.length})</h5>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => (openTaskDialog(section, projectId), e.stopPropagation(), e.preventDefault())} // 🔑 Portal call
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onEdit={(task) => openTaskDialog(section, projectId, task)} // 🔑 Portal call
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// TaskItem component - keep the same but update onEdit call
interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => Promise<void>
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'rated': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'done' && task.status !== 'rated'

  const handleRateTask = () => {
    window.open(`/ratings/tasks/${task.id}`, '_blank')
  }

  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h6 className="font-medium text-foreground truncate">{task.name}</h6>
            <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Weight: {task.weight}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: {new Date(task.due_date).toLocaleDateString()}
              {isOverdue && <span className="text-red-500 font-medium">(Overdue)</span>}
            </span>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem 
              onClick={() => onEdit(task)}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleRateTask}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <Star className="mr-2 h-4 w-4" />
              Rate Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default SectionsList
