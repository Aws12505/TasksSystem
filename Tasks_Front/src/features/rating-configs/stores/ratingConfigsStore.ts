import { create } from 'zustand'
import { ratingConfigService } from '../../../services/ratingConfigService'
import type { 
  RatingConfig, 
  CreateRatingConfigRequest,
} from '../../../types/RatingConfig'
import { toast } from 'sonner'

interface RatingConfigsState {
  ratingConfigs: RatingConfig[]
  currentRatingConfig: RatingConfig | null
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  } | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchRatingConfigs: (page?: number) => Promise<void>
  fetchRatingConfig: (id: number) => Promise<void>
  createRatingConfig: (data: CreateRatingConfigRequest) => Promise<RatingConfig | null>
  updateRatingConfig: (id: number, data: Partial<CreateRatingConfigRequest>) => Promise<RatingConfig | null>
  deleteRatingConfig: (id: number) => Promise<boolean>
  fetchRatingConfigsByType: (type: string, page?: number) => Promise<void>
  activateRatingConfig: (id: number) => Promise<RatingConfig | null>
  clearCurrentRatingConfig: () => void
  fetchActiveRatingConfigsByType: (type: string) => Promise<void>
}

export const useRatingConfigsStore = create<RatingConfigsState>((set, get) => ({
  ratingConfigs: [],
  currentRatingConfig: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchRatingConfigs: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingConfigService.getRatingConfigs(page)
      if (response.success) {
        set({
          ratingConfigs: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch rating configs'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchRatingConfig: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingConfigService.getRatingConfig(id)
      if (response.success) {
        set({ currentRatingConfig: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch rating config'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  createRatingConfig: async (data: CreateRatingConfigRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingConfigService.createRatingConfig(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Rating config created successfully')
        // Refresh list
        get().fetchRatingConfigs()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create rating config'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateRatingConfig: async (id: number, data: Partial<CreateRatingConfigRequest>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingConfigService.updateRatingConfig(id, data)
      if (response.success) {
        set({ currentRatingConfig: response.data, isLoading: false })
        toast.success('Rating config updated successfully')
        // Refresh list
        get().fetchRatingConfigs()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update rating config'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  deleteRatingConfig: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingConfigService.deleteRatingConfig(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Rating config deleted successfully')
        // Refresh list
        get().fetchRatingConfigs()
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete rating config'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  fetchRatingConfigsByType: async (type: string, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ratingConfigService.getRatingConfigsByType(type, page)
      if (response.success) {
        set({
          ratingConfigs: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch rating configs by type'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  activateRatingConfig: async (id: number) => {
    try {
      const response = await ratingConfigService.activateRatingConfig(id)
      if (response.success) {
        toast.success('Rating config activated successfully')
        // Update current config if it's the one being activated
        if (get().currentRatingConfig?.id === id) {
          set({ currentRatingConfig: response.data })
        }
        // Refresh list
        get().fetchRatingConfigs()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate rating config')
      return null
    }
  },

  fetchActiveRatingConfigsByType: async (type: string) => {
  set({ isLoading: true, error: null })
  try {
    const response = await ratingConfigService.getActiveRatingConfigsByType(type)
    if (response.success) {
      set({
        ratingConfigs: response.data, // array of active configs
        isLoading: false
      })
      // optional: toast.success('Active rating configs loaded')
    } else {
      set({ error: response.message, isLoading: false })
      toast.error(response.message)
    }
  } catch (error: any) {
    // handle 400/404 rejections as well
    const apiMsg = error?.response?.data?.message
    const errorMessage = apiMsg || error.message || 'Failed to fetch active rating configs by type'
    set({ error: errorMessage, isLoading: false })
    toast.error(errorMessage)
  }
},

  clearCurrentRatingConfig: () => set({ currentRatingConfig: null, error: null })
}))
