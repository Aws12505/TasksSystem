import { create } from 'zustand'
import { subtaskService } from '../../../services/subtaskService'
import { taskService } from '../../../services/taskService'
import type { Subtask, CreateSubtaskRequest, UpdateSubtaskRequest } from '../../../types/Subtask'
import type { UpdateTaskStatusRequest } from '../../../types/Task'
import { toast } from 'sonner'

interface SubtasksState {
  subtasks: Subtask[]
  currentSubtask: Subtask | null
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  } | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchSubtasksByTask: (taskId: number, page?: number) => Promise<void>
  fetchSubtask: (id: number) => Promise<void>
  createSubtask: (data: CreateSubtaskRequest) => Promise<Subtask | null>
  updateSubtask: (id: number, data: UpdateSubtaskRequest) => Promise<Subtask | null>
  updateTaskStatus: (id: number, data: UpdateTaskStatusRequest) => Promise<any>
  deleteSubtask: (id: number) => Promise<boolean>
  toggleSubtaskCompletion: (id: number) => Promise<Subtask | null>
  clearCurrentSubtask: () => void
}

export const useSubtasksStore = create<SubtasksState>((set, get) => ({
  subtasks: [],
  currentSubtask: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchSubtasksByTask: async (taskId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await subtaskService.getSubtasksByTask(taskId, page)
      if (response.success) {
        set({
          subtasks: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch subtasks'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchSubtask: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await subtaskService.getSubtask(id)
      if (response.success) {
        set({ currentSubtask: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch subtask'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  createSubtask: async (data: CreateSubtaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await subtaskService.createSubtask(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Subtask created successfully')
        // Refresh subtasks list
        get().fetchSubtasksByTask(data.task_id)
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create subtask'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateSubtask: async (id: number, data: UpdateSubtaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await subtaskService.updateSubtask(id, data)
      if (response.success) {
        set({ currentSubtask: response.data, isLoading: false })
        toast.success('Subtask updated successfully')
        // Refresh subtasks list if task_id is available
        if (data.task_id) {
          get().fetchSubtasksByTask(data.task_id)
        }
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update subtask'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateTaskStatus: async (id: number, data: UpdateTaskStatusRequest) => {
    try {
      const response = await taskService.updateTaskStatus(id, data)
      if (response.success) {
        toast.success('Task status updated')
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status')
      return null
    }
  },

  deleteSubtask: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await subtaskService.deleteSubtask(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Subtask deleted successfully')
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete subtask'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  toggleSubtaskCompletion: async (id: number) => {
    try {
      const response = await subtaskService.toggleSubtaskCompletion(id)
      if (response.success) {
        toast.success('Subtask completion toggled')
        // Update the subtask in the list
        set((state) => ({
          subtasks: state.subtasks.map(subtask =>
            subtask.id === id ? response.data : subtask
          )
        }))
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle subtask completion')
      return null
    }
  },

  clearCurrentSubtask: () => set({ currentSubtask: null, error: null })
}))
