import { create } from 'zustand'
import { projectService } from '../../../services/projectService'
import { sectionService } from '../../../services/sectionService'
import { userService } from '../../../services/userService'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../types/Project'
import type { Section } from '../../../types/Section'
import type { User } from '../../../types/User'
import { toast } from 'sonner'

interface ProjectsState {
  projects: Project[]
  currentProject: Project | null
  projectSections: Section[]
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
  fetchProjects: (page?: number) => Promise<void>
  fetchProject: (id: number) => Promise<void>
  fetchProjectSections: (projectId: number) => Promise<void>
  fetchAvailableUsers: () => Promise<void>
  createProject: (data: CreateProjectRequest) => Promise<Project | null>
  updateProject: (id: number, data: UpdateProjectRequest) => Promise<Project | null>
  deleteProject: (id: number) => Promise<boolean>
  clearCurrentProject: () => void
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  projectSections: [],
  availableUsers: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchProjects: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectService.getProjects(page)
      if (response.success) {
        set({
          projects: response.data,
          pagination: response.pagination,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch projects'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchProject: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectService.getProject(id)
      if (response.success) {
        set({ currentProject: response.data, isLoading: false })
        // Also fetch sections for this project
        get().fetchProjectSections(id)
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch project'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchProjectSections: async (projectId: number) => {
    try {
      const response = await sectionService.getSectionsByProject(projectId)
      if (response.success) {
        set({ projectSections: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch project sections:', error)
    }
  },

  fetchAvailableUsers: async () => {
    try {
      const response = await userService.getUsers(1, 100) // Get more users for selection
      if (response.success) {
        set({ availableUsers: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
    }
  },

  createProject: async (data: CreateProjectRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectService.createProject(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Project created successfully')
        // Refresh projects list
        get().fetchProjects()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create project'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateProject: async (id: number, data: UpdateProjectRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectService.updateProject(id, data)
      if (response.success) {
        set({ currentProject: response.data, isLoading: false })
        toast.success('Project updated successfully')
        // Refresh projects list
        get().fetchProjects()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update project'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  deleteProject: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectService.deleteProject(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Project deleted successfully')
        // Refresh projects list
        get().fetchProjects()
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete project'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  clearCurrentProject: () => set({ currentProject: null, projectSections: [], error: null })
}))
