// components/SubtasksList.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { MoreHorizontal, Edit, Trash2, Plus, List, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSubtasks } from '../hooks/useSubtasks'
import SubtaskForm from './SubtaskForm'
import TaskPriorityBadge from '../../tasks/components/TaskPriorityBadge'
import type { Subtask } from '../../../types/Subtask'
import { usePermissions } from '@/hooks/usePermissions'


interface SubtasksListProps {
  taskId: number
}

const SubtasksList: React.FC<SubtasksListProps> = ({ taskId }) => {
  const { 
    subtasks, 
    pagination,
    isLoading, 
    createSubtask, 
    updateSubtask, 
    deleteSubtask, 
    toggleCompletion,
    goToPage,
    nextPage,
    prevPage
  } = useSubtasks(taskId)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null)

  const handleCreateSubtask = async (data: any) => {
    await createSubtask({ ...data, task_id: taskId })
    setShowCreateForm(false)
  }

  const handleUpdateSubtask = async (data: any) => {
    if (editingSubtask) {
      await updateSubtask(editingSubtask.id, data)
      setEditingSubtask(null)
    }
  }

  const handleDeleteSubtask = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      await deleteSubtask(id)
    }
  }

  const handleToggleCompletion = async (id: number) => {
    await toggleCompletion(id)
  }

  const { hasPermission, hasAnyPermission } = usePermissions()


  const completedCount = subtasks.filter(s => s.is_complete).length
  const completionPercentage = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return []

    const items = []
    const { current_page, last_page } = pagination
    
    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) {
        items.push('ellipsis-start')
      }
    }

    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }

    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) {
        items.push('ellipsis-end')
      }
      items.push(last_page)
    }

    return items
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <List className="w-5 h-5" />
              Subtasks ({pagination?.total || subtasks.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {completedCount}/{pagination?.total || subtasks.length} completed
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {completionPercentage}%
              </Badge>
              {hasPermission('create subtasks') && (
              <Button
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subtask
              </Button>)}
            </div>
          </div>

          {/* Progress Bar */}
          {subtasks.length > 0 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-chart-3 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 border border-border rounded-lg bg-accent/20">
              <h4 className="text-sm font-medium text-foreground mb-3">Create New Subtask</h4>
              <SubtaskForm
                taskId={taskId}
                onSubmit={handleCreateSubtask}
                onCancel={() => setShowCreateForm(false)}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Subtasks List */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : subtasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No subtasks yet. Create your first subtask to break down this task.
            </p>
          ) : (
            subtasks.map((subtask) => (
              <div key={subtask.id}>
                {editingSubtask?.id === subtask.id ? (
                  <div className="p-4 border border-border rounded-lg bg-accent/20">
                    <h4 className="text-sm font-medium text-foreground mb-3">Edit Subtask</h4>
                    <SubtaskForm
                      subtask={editingSubtask}
                      taskId={taskId}
                      onSubmit={handleUpdateSubtask}
                      onCancel={() => setEditingSubtask(null)}
                      isLoading={isLoading}
                    />
                  </div>
                ) : (
                  <div className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={subtask.is_complete}
                        onCheckedChange={() => handleToggleCompletion(subtask.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium text-foreground ${
                            subtask.is_complete ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {subtask.name}
                          </h4>
                          <TaskPriorityBadge priority={subtask.priority} />
                        </div>
                        {subtask.description && (
                          <p className={`text-sm mt-1 ${
                            subtask.is_complete ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {subtask.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(subtask.due_date).toLocaleDateString()}
                          </div>
                          {subtask.is_complete && (
                            <Badge variant="outline" className="text-xs text-chart-3">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                   { hasAnyPermission(['edit subtasks', 'delete subtasks']) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        { hasPermission('edit subtasks') && (<DropdownMenuItem 
                          onClick={() => setEditingSubtask(subtask)}
                          className="hover:bg-accent hover:text-accent-foreground"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>)}
                        { hasPermission('delete subtasks') && (<DropdownMenuItem
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                   )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={prevPage}
                      className={pagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {generatePaginationItems().map((item, index) => (
                    <PaginationItem key={index}>
                      {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => goToPage(item as number)}
                          isActive={pagination.current_page === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={nextPage}
                      className={pagination.current_page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SubtasksList
