// components/TaskDialogProvider.tsx
"use client"

import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CheckSquare } from 'lucide-react'

import ComprehensiveTaskForm from '@/features/tasks/components/ComprehensiveTaskForm'
import { useTasks } from '@/features/tasks/hooks/useTasks'

import type { Section } from '@/types/Section'
import type { Task } from '@/types/Task'
import type { ComprehensiveCreateTaskRequest } from '@/types/Task'

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
    setDialogState({
      isOpen: true,
      section,
      projectId,
      task: task || null
    })
  }

  const closeTaskDialog = () => {
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
      {typeof window !== 'undefined' &&
        createPortal(
          <TaskDialogPortal dialogState={dialogState} onClose={closeTaskDialog} />,
          document.body
        )}
    </TaskDialogContext.Provider>
  )
}

interface TaskDialogPortalProps {
  dialogState: TaskDialogState
  onClose: () => void
}

const TaskDialogPortal: React.FC<TaskDialogPortalProps> = ({ dialogState, onClose }) => {
  const { section, projectId, task, isOpen } = dialogState
  if (!isOpen || !section || !projectId) return null
  return (
    <TaskDialogContent section={section} projectId={projectId} task={task} onClose={onClose} />
  )
}

interface TaskDialogContentProps {
  section: Section
  projectId: number
  task: Task | null
  onClose: () => void
}

const TaskDialogContent: React.FC<TaskDialogContentProps> = ({ section, projectId, task, onClose }) => {
  const { updateTask, createTaskComprehensive, isLoading } = useTasks(section.id)

  const initialValues = task ? {
    name: task.name,
    description: task.description ?? '',
    weight: task.weight,
    due_date: task.due_date,
    priority: task.priority,
    project_id: task.project_id,
    section_id: task.section_id,
    subtasks: (task.subtasks || []).map(st => ({
      id: st.id,
      name: st.name,
      description: st.description ?? '',
      due_date: st.due_date,
      priority: st.priority,
    })),
    assignments: (task.assigned_users || []).map(au => ({
      user_id: au.id,
      percentage: Number(au.pivot?.percentage ?? 0),
    })),
  } : undefined

  const handleSubmit = async (data: ComprehensiveCreateTaskRequest) => {
    try {
      if (task) {
        await updateTask(task.id, {
          name: data.name,
          description: data.description,
          weight: data.weight,
          due_date: data.due_date,
          priority: data.priority,
          section_id: data.section_id,
        })
      } else {
        const payload: ComprehensiveCreateTaskRequest = {
          name: data.name.trim(),
          description: (data.description ?? '').trim(),
          weight: Number(data.weight),
          due_date: data.due_date,
          priority: data.priority,
          section_id: Number(data.section_id),
          subtasks: (data.subtasks || []).map(s => ({
            name: s.name.trim(),
            description: (s.description ?? '').trim(),
            due_date: s.due_date,
            priority: s.priority,
          })),
          assignments: (data.assignments || []).map(a => ({
            user_id: Number(a.user_id),
            percentage: Number(a.percentage),
          })),
        }
        await createTaskComprehensive(payload)
      }
      onClose()
    } catch (error) {
      console.error('Task operation failed:', error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* 
        The key bits for width:
        - max-w-none removes any max-width cap
        - w-[95vw] uses viewport width
        - sm:!max-w-[1100px] overrides shadcn's internal `sm:max-w-[425px]`
        - md:!max-w-[1280px] gives it more room on bigger screens
      */}
      <DialogContent className="w-[95vw] max-w-none sm:!max-w-[1100px] md:!max-w-[1280px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task ? `Edit task in ${section.name}` : `Add a new task to ${section.name} section`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ComprehensiveTaskForm
            mode={task ? 'edit' : 'create'}
            sectionId={section.id}
            initialValues={
              task
                ? initialValues
                : {
                    project_id: projectId,
                    section_id: section.id,
                    priority: 'medium',
                    weight: 10,
                  }
            }
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={!!isLoading}
          />

        </div>
      </DialogContent>
    </Dialog>
  )
}
