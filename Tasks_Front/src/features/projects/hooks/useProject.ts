import { useEffect } from 'react'
import { useProjectsStore } from '../stores/projectsStore'

export const useProject = (projectId: number | string) => {
  const {
    currentProject,
    projectSections,
    availableUsers,
    isLoading,
    error,
    fetchProject,
    fetchAvailableUsers,
    clearCurrentProject
  } = useProjectsStore()

  const id = typeof projectId === 'string' ? parseInt(projectId) : projectId

  useEffect(() => {
    if (id) {
      fetchProject(id)
      fetchAvailableUsers()
    }

    return () => {
      clearCurrentProject()
    }
  }, [id, fetchProject, fetchAvailableUsers, clearCurrentProject])

  return {
    project: currentProject,
    sections: projectSections,
    availableUsers,
    isLoading,
    error
  }
}
