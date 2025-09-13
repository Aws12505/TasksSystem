import { useEffect } from 'react'
import { useProjectsStore } from '../stores/projectsStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useProjects = () => {
  const {
    projects,
    pagination,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  } = useProjectsStore()

  const { searchQuery, statusFilter } = useFiltersStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Filter projects based on search query and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return {
    projects: filteredProjects,
    pagination,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
