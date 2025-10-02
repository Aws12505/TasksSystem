import { useEffect, useMemo, useCallback } from 'react'
import { useTasksStore } from '../stores/tasksStore'
import { useAuthStore } from '../../auth/stores/authStore'
import type { TaskFilters } from '../../../services/taskService'

export const useTasks = (sectionId?: number) => {
  const {
    tasksBySection,
    allTasks,
    pagination,
    globalPagination,
    isLoading,
    error,
    fetchAllTasks,
    fetchTasksBySection,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksBySection,
    createTaskComprehensive,
    lastFilters,
  } = useTasksStore()

  const { isAuthenticated, user } = useAuthStore()

  const tasks = useMemo(() => {
    if (sectionId !== undefined) {
      return getTasksBySection(sectionId)
    }
    return allTasks
  }, [sectionId, tasksBySection, allTasks, getTasksBySection])

  const currentPagination = useMemo(() => {
    if (sectionId !== undefined) {
      return pagination[sectionId] || null
    }
    return globalPagination
  }, [sectionId, pagination, globalPagination])

  // Stable wrappers (avoid changing function identity every render)
  const fetchWithFilters = useCallback(
    (page: number, filters: TaskFilters) => {
      return fetchAllTasks(page, filters)
    },
    [fetchAllTasks]
  )

  const goToPage = useCallback(
    (page: number) => {
      if (sectionId !== undefined) {
        fetchTasksBySection(sectionId, page)
      } else {
        fetchAllTasks(page, lastFilters || {})
      }
    },
    [sectionId, fetchTasksBySection, fetchAllTasks, lastFilters]
  )

  const nextPage = useCallback(() => {
    if (currentPagination && currentPagination.current_page < currentPagination.last_page) {
      goToPage(currentPagination.current_page + 1)
    }
  }, [currentPagination, goToPage])

  const prevPage = useCallback(() => {
    if (currentPagination && currentPagination.current_page > 1) {
      goToPage(currentPagination.current_page - 1)
    }
  }, [currentPagination, goToPage])

  // Initial fetch
  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (sectionId !== undefined) {
      if (!tasks.length) fetchTasksBySection(sectionId)
    } else {
      if (!allTasks.length) fetchAllTasks(1, lastFilters || {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, isAuthenticated, user])

  return {
    tasks,
    pagination: currentPagination,
    isLoading,
    error,
    fetchTasks: fetchWithFilters,   // stable (page, filters)
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    createTaskComprehensive,
    goToPage,
    nextPage,
    prevPage,
  }
}
