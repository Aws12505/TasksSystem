import { useEffect } from 'react'
import { useKanbanStore } from '../stores/kanbanStore'

export const useKanban = (projectId: number | string) => {
  const {
    kanbanData,
    isLoading,
    error,
    fetchProjectKanban,
    moveTaskToSection,
    moveTaskStatus,
    clearKanban
  } = useKanbanStore()

  const id = typeof projectId === 'string' ? parseInt(projectId) : projectId

  useEffect(() => {
    if (id) {
      fetchProjectKanban(id)
    }

    return () => {
      clearKanban()
    }
  }, [id, fetchProjectKanban, clearKanban])

  return {
    kanbanData,
    isLoading,
    error,
    moveTaskToSection,
    moveTaskStatus,
    refetch: () => fetchProjectKanban(id)
  }
}
