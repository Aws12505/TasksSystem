import React, { createContext, useContext, useState,type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import TaskForm from '@/features/tasks/components/TaskForm'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { CheckSquare } from 'lucide-react'
import type { Section } from '@/types/Section'
import type { Task } from '@/types/Task'

interface TaskDialogContextType {
  openTaskDialog: (section: Section, projectId: number, task?: Task) => void
  closeTaskDialog: () => void
}

const TaskDialogContext = createContext<TaskDialogContextType | undefined>(undefined)

export const useTaskDialog = () => {
  const context = useContext(TaskDialogContext)
  if (!context) {
    throw new Error('useTaskDialog must be used within TaskDialogProvider')
  }
  return context
}

interface TaskDialogState {
  isOpen: boolean
  section: Section | null
  projectId: number | null
  task: Task | null
}

interface TaskDialogProviderProps {
  children: ReactNode
}

export const TaskDialogProvider: React.FC<TaskDialogProviderProps> = ({ children }) => {
  const [dialogState, setDialogState] = useState<TaskDialogState>({
    isOpen: false,
    section: null,
    projectId: null,
    task: null
  })

  const openTaskDialog = (section: Section, projectId: number, task?: Task) => {
    console.log('🚀 Opening task dialog via portal:', section.name)
    setDialogState({
      isOpen: true,
      section,
      projectId,
      task: task || null
    })
  }

  const closeTaskDialog = () => {
    console.log('🚀 Closing task dialog via portal')
    setDialogState({
      isOpen: false,
      section: null,
      projectId: null,
      task: null
    })
  }

  return (
    <TaskDialogContext.Provider value={{ openTaskDialog, closeTaskDialog }}>
      {children}
      {/* Portal Dialog - renders at document.body level */}
      {typeof window !== 'undefined' && 
        createPortal(
          <TaskDialogPortal
            dialogState={dialogState}
            onClose={closeTaskDialog}
          />,
          document.body
        )
      }
    </TaskDialogContext.Provider>
  )
}

// Separate portal dialog component
interface TaskDialogPortalProps {
  dialogState: TaskDialogState
  onClose: () => void
}

const TaskDialogPortal: React.FC<TaskDialogPortalProps> = ({ dialogState, onClose }) => {
  const { section, projectId, task, isOpen } = dialogState
  const { createTask, updateTask } = useTasks(section?.id || 0)

  const handleSubmit = async (data: any) => {
    try {
      if (!section) return
      
      if (task) {
        await updateTask(task.id, data)
      } else {
        await createTask(data)
      }
      onClose()
    } catch (error) {
      console.error('Task operation failed:', error)
    }
  }

  if (!section || !projectId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? `Edit task in ${section.name}` 
              : `Add a new task to ${section.name} section`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <TaskForm
            task={task || undefined}
            preSelectedProjectId={projectId}
            preSelectedSectionId={section.id}
            onSubmit={handleSubmit}
            isLoading={false}
          />
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
