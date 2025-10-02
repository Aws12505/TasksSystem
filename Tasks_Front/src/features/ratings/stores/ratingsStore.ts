// stores/ratingsStore.ts
import { create } from 'zustand'
import { ratingService } from '../../../services/ratingService'
import { ratingConfigService } from '../../../services/ratingConfigService'
import { taskService } from '../../../services/taskService'
import { projectService } from '../../../services/projectService'
import { userService } from '../../../services/userService'
import type { 
  TaskRating, 
  StakeholderRating, 
  FinalRating,
  CreateTaskRatingRequest,
  CreateStakeholderRatingRequest,
  CalculateFinalRatingRequest
} from '../../../types/Rating'
import type { 
  RatingConfig,
} from '../../../types/RatingConfig'
import type { Task } from '../../../types/Task'
import type { Project } from '../../../types/Project'
import type { User } from '../../../types/User'
import { toast } from 'sonner'

interface PaginationInfo {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

interface RatingsState {
  // Data
  taskRatings: TaskRating[]
  stakeholderRatings: StakeholderRating[]
  finalRatings: FinalRating[]
  
  // Configs (for form building)
  taskRatingConfigs: RatingConfig[]
  stakeholderRatingConfigs: RatingConfig[]
  finalRatingConfigs: RatingConfig[]
  
  // Reference data
  availableTasks: Task[]
  availableProjects: Project[]
  availableUsers: User[]
  
  // Pagination with proper interface
  taskRatingsPagination: PaginationInfo | null
  stakeholderRatingsPagination: PaginationInfo | null
  finalRatingsPagination: PaginationInfo | null
  
  // State
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchTaskRatings: (taskId: number, page?: number) => Promise<void>
  fetchStakeholderRatings: (projectId: number, page?: number) => Promise<void>
  fetchFinalRatings: (page?: number) => Promise<void>
  fetchUserFinalRating: (userId: number, periodStart: string, periodEnd: string) => Promise<FinalRating | null>
  
  fetchTaskRatingConfigs: () => Promise<void>
  fetchStakeholderRatingConfigs: () => Promise<void>
  fetchFinalRatingConfigs: () => Promise<void>
  
  fetchAvailableTasks: () => Promise<void>
  fetchAvailableProjects: () => Promise<void>
  fetchAvailableUsers: () => Promise<void>
  
  createTaskRating: (data: CreateTaskRatingRequest) => Promise<TaskRating | null>
  updateTaskRating: (id: number, data: Partial<CreateTaskRatingRequest>) => Promise<TaskRating | null>
  
  createStakeholderRating: (data: CreateStakeholderRatingRequest) => Promise<StakeholderRating | null>
  updateStakeholderRating: (id: number, data: Partial<CreateStakeholderRatingRequest>) => Promise<StakeholderRating | null>
  
  calculateFinalRating: (userId: number, data: CalculateFinalRatingRequest) => Promise<FinalRating | null>
  
  clearAllRatings: () => void
}

export const useRatingsStore = create<RatingsState>((set, get) => ({
  // Initial state
  taskRatings: [],
  stakeholderRatings: [],
  finalRatings: [],
  taskRatingConfigs: [],
  stakeholderRatingConfigs: [],
  finalRatingConfigs: [],
  availableTasks: [],
  availableProjects: [],
  availableUsers: [],
  taskRatingsPagination: null,
  stakeholderRatingsPagination: null,
  finalRatingsPagination: null,
  isLoading: false,
  error: null,

  // Fetch task ratings
  fetchTaskRatings: async (taskId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.getTaskRatingsByTask(taskId, page)
      if (response.success) {
        set({
          taskRatings: response.data,
          taskRatingsPagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch task ratings'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch stakeholder ratings
  fetchStakeholderRatings: async (projectId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.getStakeholderRatingsByProject(projectId, page)
      if (response.success) {
        set({
          stakeholderRatings: response.data,
          stakeholderRatingsPagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch stakeholder ratings'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch final ratings
  fetchFinalRatings: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.getAllFinalRatings(page)
      if (response.success) {
        set({
          finalRatings: response.data,
          finalRatingsPagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch final ratings'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Fetch user's specific final rating
  fetchUserFinalRating: async (userId: number, periodStart: string, periodEnd: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.getUserFinalRating(userId, periodStart, periodEnd)
      if (response.success) {
        set({ isLoading: false })
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch user final rating'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Fetch rating configs
  fetchTaskRatingConfigs: async () => {
    try {
      const response = await ratingConfigService.getRatingConfigsByType('task_rating')
      if (response.success) {
        set({ taskRatingConfigs: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch task rating configs:', error)
    }
  },

  fetchStakeholderRatingConfigs: async () => {
    try {
      const response = await ratingConfigService.getRatingConfigsByType('stakeholder_rating')
      if (response.success) {
        set({ stakeholderRatingConfigs: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch stakeholder rating configs:', error)
    }
  },

  fetchFinalRatingConfigs: async () => {
    try {
      const response = await ratingConfigService.getRatingConfigsByType('final_rating')
      if (response.success) {
        set({ finalRatingConfigs: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch final rating configs:', error)
    }
  },

  // Fetch reference data
  fetchAvailableTasks: async () => {
    try {
      const response = await taskService.getTasks(1)
      if (response.success) {
        set({ availableTasks: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error)
    }
  },

  fetchAvailableProjects: async () => {
    try {
      const response = await projectService.getProjects(1, 100)
      if (response.success) {
        set({ availableProjects: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch projects:', error)
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

  // Create task rating
  createTaskRating: async (data: CreateTaskRatingRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.createTaskRating(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Task rating created successfully')
        // Refresh task ratings if we're viewing the same task
        const currentTaskRatings = get().taskRatings
        if (currentTaskRatings.length > 0 && currentTaskRatings[0].task_id === data.task_id) {
          get().fetchTaskRatings(data.task_id)
        }
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create task rating'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Update task rating
  updateTaskRating: async (id: number, data: Partial<CreateTaskRatingRequest>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.updateTaskRating(id, data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Task rating updated successfully')
        // Refresh task ratings
        if (data.task_id) {
          get().fetchTaskRatings(data.task_id)
        }
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update task rating'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Create stakeholder rating
  createStakeholderRating: async (data: CreateStakeholderRatingRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.createStakeholderRating(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Stakeholder rating created successfully')
        // Refresh stakeholder ratings if we're viewing the same project
        const currentStakeholderRatings = get().stakeholderRatings
        if (currentStakeholderRatings.length > 0 && currentStakeholderRatings[0].project_id === data.project_id) {
          get().fetchStakeholderRatings(data.project_id)
        }
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create stakeholder rating'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Update stakeholder rating
  updateStakeholderRating: async (id: number, data: Partial<CreateStakeholderRatingRequest>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.updateStakeholderRating(id, data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Stakeholder rating updated successfully')
        // Refresh stakeholder ratings
        if (data.project_id) {
          get().fetchStakeholderRatings(data.project_id)
        }
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update stakeholder rating'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Calculate final rating
  calculateFinalRating: async (userId: number, data: CalculateFinalRatingRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingService.calculateFinalRating(userId, data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Final rating calculated successfully')
        // Refresh final ratings list
        get().fetchFinalRatings()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to calculate final rating'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Clear all ratings
  clearAllRatings: () => {
    set({
      taskRatings: [],
      stakeholderRatings: [],
      finalRatings: [],
      taskRatingsPagination: null,
      stakeholderRatingsPagination: null,
      finalRatingsPagination: null,
      error: null
    })
  }
}))
