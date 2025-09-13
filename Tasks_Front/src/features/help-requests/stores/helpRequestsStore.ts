import { create } from 'zustand'
import { helpRequestService, HelpRequestService } from '../../../services/helpRequestService'
import { taskService } from '../../../services/taskService'
import { userService } from '../../../services/userService'
import type { 
  HelpRequest, 
  CreateHelpRequestRequest, 
  UpdateHelpRequestRequest,
  CompleteHelpRequestRequest,
  HelpRequestRatingOption
} from '../../../types/HelpRequest'
import type { Task } from '../../../types/Task'
import type { User } from '../../../types/User'
import { toast } from 'sonner'

interface HelpRequestsState {
  helpRequests: HelpRequest[]
  availableHelpRequests: HelpRequest[]
  currentHelpRequest: HelpRequest | null
  availableTasks: Task[]
  availableUsers: User[]
  ratingOptions: HelpRequestRatingOption[]
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  } | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchHelpRequests: (page?: number) => Promise<void>
  fetchAvailableHelpRequests: (page?: number) => Promise<void>
  fetchHelpRequest: (id: number) => Promise<void>
  fetchHelpRequestsByTask: (taskId: number, page?: number) => Promise<void>
  fetchHelpRequestsByRequester: (userId: number, page?: number) => Promise<void>
  fetchHelpRequestsByHelper: (userId: number, page?: number) => Promise<void>
  fetchAvailableTasks: () => Promise<void>
  fetchAvailableUsers: () => Promise<void>
  createHelpRequest: (data: CreateHelpRequestRequest) => Promise<HelpRequest | null>
  updateHelpRequest: (id: number, data: UpdateHelpRequestRequest) => Promise<HelpRequest | null>
  deleteHelpRequest: (id: number) => Promise<boolean>
  claimHelpRequest: (id: number) => Promise<HelpRequest | null>
  assignHelpRequest: (id: number, userId: number) => Promise<HelpRequest | null>
  completeHelpRequest: (id: number, data: CompleteHelpRequestRequest) => Promise<HelpRequest | null>
  unclaimHelpRequest: (id: number) => Promise<HelpRequest | null>
  getRatingOptions: () => HelpRequestRatingOption[]
  clearCurrentHelpRequest: () => void
}

export const useHelpRequestsStore = create<HelpRequestsState>((set, get) => ({
  helpRequests: [],
  availableHelpRequests: [],
  currentHelpRequest: null,
  availableTasks: [],
  availableUsers: [],
  ratingOptions: HelpRequestService.getHelpRequestRatingOptions(),
  pagination: null,
  isLoading: false,
  error: null,

  fetchHelpRequests: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.getHelpRequests(page)
      if (response.success) {
        set({
          helpRequests: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch help requests'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchAvailableHelpRequests: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.getAvailableHelpRequests(page)
      if (response.success) {
        set({
          availableHelpRequests: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch available help requests'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchHelpRequest: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.getHelpRequest(id)
      if (response.success) {
        set({ currentHelpRequest: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch help request'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchHelpRequestsByTask: async (taskId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.getHelpRequestsByTask(taskId, page)
      if (response.success) {
        set({
          helpRequests: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch help requests for task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchHelpRequestsByRequester: async (userId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.getHelpRequestsByRequester(userId, page)
      if (response.success) {
        set({
          helpRequests: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch help requests by requester'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchHelpRequestsByHelper: async (userId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.getHelpRequestsByHelper(userId, page)
      if (response.success) {
        set({
          helpRequests: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch help requests by helper'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchAvailableTasks: async () => {
    try {
      const response = await taskService.getTasks(1, 100)
      if (response.success) {
        set({ availableTasks: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error)
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

  createHelpRequest: async (data: CreateHelpRequestRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.createHelpRequest(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Help request created successfully')
        // Refresh help requests list
        get().fetchHelpRequests()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create help request'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateHelpRequest: async (id: number, data: UpdateHelpRequestRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.updateHelpRequest(id, data)
      if (response.success) {
        set({ currentHelpRequest: response.data, isLoading: false })
        toast.success('Help request updated successfully')
        // Refresh help requests list
        get().fetchHelpRequests()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update help request'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  deleteHelpRequest: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await helpRequestService.deleteHelpRequest(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Help request deleted successfully')
        // Refresh help requests list
        get().fetchHelpRequests()
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete help request'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  claimHelpRequest: async (id: number) => {
    try {
      const response = await helpRequestService.claimHelpRequest(id)
      if (response.success) {
        toast.success('Help request claimed successfully')
        // Update current help request if it's the one being claimed
        if (get().currentHelpRequest?.id === id) {
          set({ currentHelpRequest: response.data })
        }
        // Refresh lists
        get().fetchHelpRequests()
        get().fetchAvailableHelpRequests()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim help request')
      return null
    }
  },

  assignHelpRequest: async (id: number, userId: number) => {
    try {
      const response = await helpRequestService.assignHelpRequest(id, userId)
      if (response.success) {
        toast.success('Help request assigned successfully')
        // Update current help request if it's the one being assigned
        if (get().currentHelpRequest?.id === id) {
          set({ currentHelpRequest: response.data })
        }
        // Refresh lists
        get().fetchHelpRequests()
        get().fetchAvailableHelpRequests()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign help request')
      return null
    }
  },

  completeHelpRequest: async (id: number, data: CompleteHelpRequestRequest) => {
    try {
      const response = await helpRequestService.completeHelpRequest(id, data)
      if (response.success) {
        toast.success('Help request completed successfully')
        // Update current help request if it's the one being completed
        if (get().currentHelpRequest?.id === id) {
          set({ currentHelpRequest: response.data })
        }
        // Refresh lists
        get().fetchHelpRequests()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete help request')
      return null
    }
  },

  unclaimHelpRequest: async (id: number) => {
    try {
      const response = await helpRequestService.unclaimHelpRequest(id)
      if (response.success) {
        toast.success('Help request unclaimed successfully')
        // Update current help request if it's the one being unclaimed
        if (get().currentHelpRequest?.id === id) {
          set({ currentHelpRequest: response.data })
        }
        // Refresh lists
        get().fetchHelpRequests()
        get().fetchAvailableHelpRequests()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to unclaim help request')
      return null
    }
  },

  getRatingOptions: () => {
    return HelpRequestService.getHelpRequestRatingOptions()
  },

  clearCurrentHelpRequest: () => set({ currentHelpRequest: null, error: null })
}))
