import { create } from 'zustand'
import { sectionService } from '../../../services/sectionService'
import type { Section, CreateSectionRequest, UpdateSectionRequest } from '../../../types/Section'
import { toast } from 'sonner'

interface SectionsState {
  // Data
  sections: Section[]
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // CRUD Actions
  createSection: (data: CreateSectionRequest) => Promise<Section | null>
  updateSection: (id: number, data: UpdateSectionRequest) => Promise<Section | null>
  deleteSection: (id: number) => Promise<boolean>
  
  // Fetch Actions
  fetchSectionsByProject: (projectId: number) => Promise<void>
  clearSections: () => void
}

export const useSectionsStore = create<SectionsState>((set, get) => ({
  // Initial state
  sections: [],
  isLoading: false,
  error: null,

  // Fetch sections by project
  fetchSectionsByProject: async (projectId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await sectionService.getSectionsByProject(projectId)
      if (response.success) {
        set({ sections: response.data, isLoading: false })
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
    set({ sections: [], error: null })
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
