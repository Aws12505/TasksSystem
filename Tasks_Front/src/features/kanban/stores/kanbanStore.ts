import { create } from 'zustand'
import { kanbanService } from '@/services/kanbanService'
import type { KanbanBoard } from '@/types/Kanban'
import { toast } from 'sonner'

interface KanbanState {
  kanbanData: KanbanBoard | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProjectKanban: (projectId: number) => Promise<void>
  moveTaskToSection: (taskId: number, sectionId: number) => Promise<void>
  moveTaskStatus: (taskId: number, status: string) => Promise<void>
  clearKanban: () => void
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  kanbanData: null,
  isLoading: false,
  error: null,

  fetchProjectKanban: async (projectId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await kanbanService.getProjectKanban(projectId)
      if (response.success) {
        set({
          kanbanData: response.data,
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch kanban data'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  moveTaskToSection: async (taskId: number, sectionId: number) => {
    try {
      const response = await kanbanService.moveTaskToSection(taskId, { section_id: sectionId })
      if (response.success) {
        // Refresh kanban data after successful move
        const { kanbanData } = get()
        if (kanbanData?.project.id) {
          get().fetchProjectKanban(kanbanData.project.id)
        }
        toast.success('Task moved successfully')
      } else {
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to move task'
      toast.error(errorMessage)
    }
  },

  moveTaskStatus: async (taskId: number, status: string) => {
    try {
      const response = await kanbanService.moveTaskStatus(taskId, { status: status as any })
      if (response.success) {
        // Refresh kanban data after successful move
        const { kanbanData } = get()
        if (kanbanData?.project.id) {
          get().fetchProjectKanban(kanbanData.project.id)
        }
        toast.success('Task status updated successfully')
      } else {
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update task status'
      toast.error(errorMessage)
    }
  },

  clearKanban: () => set({ kanbanData: null, error: null })
}))
