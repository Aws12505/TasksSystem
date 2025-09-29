// hooks/useProjects.ts
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
    if (!projects.length) {
      fetchProjects(1)
    }
  }, [fetchProjects, projects.length])

  // Filter projects based on search query and status - apply to current page only
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination functions
  const goToPage = (page: number) => {
    fetchProjects(page)
  }

  const nextPage = () => {
    if (pagination && pagination.current_page < pagination.last_page) {
      goToPage(pagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (pagination && pagination.current_page > 1) {
      goToPage(pagination.current_page - 1)
    }
  }

  return {
    projects: filteredProjects,
    pagination,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    // Pagination methods
    goToPage,
    nextPage,
    prevPage
  }
}
