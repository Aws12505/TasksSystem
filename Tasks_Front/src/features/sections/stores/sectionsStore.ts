// stores/sectionsStore.ts
import { create } from 'zustand'
import { sectionService } from '../../../services/sectionService'
import type { Section, CreateSectionRequest, UpdateSectionRequest } from '../../../types/Section'
import { toast } from 'sonner'

interface PaginationInfo {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

interface SectionsState {
  // Data
  sections: Section[]
  pagination: PaginationInfo | null
  projectPagination: Record<number, PaginationInfo>
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // CRUD Actions
  createSection: (data: CreateSectionRequest) => Promise<Section | null>
  updateSection: (id: number, data: UpdateSectionRequest) => Promise<Section | null>
  deleteSection: (id: number) => Promise<boolean>
  
  // Fetch Actions
  fetchSectionsByProject: (projectId: number, page?: number) => Promise<void>
  clearSections: () => void
}

export const useSectionsStore = create<SectionsState>((set, get) => ({
  // Initial state
  sections: [],
  pagination: null,
  projectPagination: {},
  isLoading: false,
  error: null,

  // Fetch sections by project
  fetchSectionsByProject: async (projectId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await sectionService.getSectionsByProject(projectId, page)
      if (response.success) {
        set(state => ({
          sections: response.data,
          projectPagination: {
            ...state.projectPagination,
            [projectId]: response.pagination || {
              current_page: 1,
              total: response.data.length,
              per_page: 15,
              last_page: 1,
              from: response.data.length > 0 ? 1 : null,
              to: response.data.length
            }
          },
          isLoading: false
        }))
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch sections'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // Clear sections
  clearSections: () => {
    set({ sections: [], projectPagination: {}, error: null })
  },

  // Create section
  createSection: async (data: CreateSectionRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await sectionService.createSection(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Section created successfully')
        // Refresh sections for the project
        if (data.project_id) {
          get().fetchSectionsByProject(data.project_id)
        }
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create section'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Update section
  updateSection: async (id: number, data: UpdateSectionRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await sectionService.updateSection(id, data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Section updated successfully')
        // Update the section in the local state
        const updatedSections = get().sections.map(section => 
          section.id === id ? response.data : section
        )
        set({ sections: updatedSections })
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update section'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  // Delete section
  deleteSection: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await sectionService.deleteSection(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Section deleted successfully')
        // Remove the section from local state
        const filteredSections = get().sections.filter(section => section.id !== id)
        set({ sections: filteredSections })
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete section'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  }
}))
