import { create } from 'zustand'
import { taskService } from '../../../services/taskService'
import { taskAssignmentService } from '../../../services/taskAssignmentService'
import { userService } from '../../../services/userService'
import type { Task, CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest } from '../../../types/Task'
import type { TaskWithAssignments } from '../../../types/TaskAssignment'
import type { User } from '../../../types/User'
import { toast } from 'sonner'

interface TasksState {
  tasks: Task[]
  currentTask: Task | null
  currentTaskWithAssignments: TaskWithAssignments | null
  availableUsers: User[]
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  } | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchTasksBySection: (sectionId: number, page?: number) => Promise<void>
  fetchTask: (id: number) => Promise<void>
  fetchTaskWithAssignments: (id: number) => Promise<void>
  fetchAvailableUsers: () => Promise<void>
  createTask: (data: CreateTaskRequest) => Promise<Task | null>
  updateTask: (id: number, data: UpdateTaskRequest) => Promise<Task | null>
  updateTaskStatus: (id: number, data: UpdateTaskStatusRequest) => Promise<Task | null>
  deleteTask: (id: number) => Promise<boolean>
  assignUsersToTask: (taskId: number, assignments: { user_id: number; percentage: number }[]) => Promise<boolean>
  addUserToTask: (taskId: number, userId: number, percentage: number) => Promise<boolean>
  updateUserAssignment: (taskId: number, userId: number, percentage: number) => Promise<boolean>
  removeUserFromTask: (taskId: number, userId: number) => Promise<boolean>
  clearCurrentTask: () => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  currentTask: null,
  currentTaskWithAssignments: null,
  availableUsers: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchTasksBySection: async (sectionId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.getTasksBySection(sectionId, page)
      if (response.success) {
        set({
          tasks: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tasks'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTask: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.getTask(id)
      if (response.success) {
        set({ currentTask: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTaskWithAssignments: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskAssignmentService.getTaskWithAssignments(id)
      if (response.success) {
        set({ currentTaskWithAssignments: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch task with assignments'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchAvailableUsers: async () => {
    try {
      const response = await userService.getUsers(1, 100)
      if (response.success) {
        set({ availableUsers: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
    }
  },

  createTask: async (data: CreateTaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.createTask(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Task created successfully')
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateTask: async (id: number, data: UpdateTaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.updateTask(id, data)
      if (response.success) {
        set({ currentTask: response.data, isLoading: false })
        toast.success('Task updated successfully')
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update task'
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
        // Refresh current task if it's the one being updated
        if (get().currentTask?.id === id) {
          set({ currentTask: response.data })
        }
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

  deleteTask: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.deleteTask(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Task deleted successfully')
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  assignUsersToTask: async (taskId: number, assignments: { user_id: number; percentage: number }[]) => {
    try {
      const response = await taskAssignmentService.assignUsersToTask(taskId, { assignments })
      if (response.success) {
        toast.success('Users assigned to task successfully')
        // Refresh task with assignments
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign users to task')
      return false
    }
  },

  addUserToTask: async (taskId: number, userId: number, percentage: number) => {
    try {
      const response = await taskAssignmentService.addUserToTask(taskId, { user_id: userId, percentage })
      if (response.success) {
        toast.success('User added to task successfully')
        // Refresh task with assignments
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add user to task')
      return false
    }
  },

  updateUserAssignment: async (taskId: number, userId: number, percentage: number) => {
    try {
      const response = await taskAssignmentService.updateUserAssignment(taskId, userId, { percentage })
      if (response.success) {
        toast.success('User assignment updated')
        // Refresh task with assignments
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user assignment')
      return false
    }
  },

  removeUserFromTask: async (taskId: number, userId: number) => {
    try {
      const response = await taskAssignmentService.removeUserFromTask(taskId, userId)
      if (response.success) {
        toast.success('User removed from task')
        // Refresh task with assignments
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove user from task')
      return false
    }
  },

  clearCurrentTask: () => set({ 
    currentTask: null, 
    currentTaskWithAssignments: null, 
    error: null 
  })
}))
