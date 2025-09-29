// hooks/useSubtasks.ts
import { useEffect } from 'react'
import { useSubtasksStore } from '../stores/subtasksStore'

export const useSubtasks = (taskId?: number) => {
  const {
    subtasks,
    pagination,
    taskPagination,
    currentTaskId,
    isLoading,
    error,
    fetchSubtasksByTask,
    createSubtask,
    updateSubtask,
    updateTaskStatus,
    deleteSubtask,
    toggleSubtaskCompletion
  } = useSubtasksStore()

  useEffect(() => {
    if (taskId && currentTaskId !== taskId) {
      fetchSubtasksByTask(taskId, 1)
    }
  }, [taskId, currentTaskId, fetchSubtasksByTask])

  // Get current pagination for this task
  const currentPagination = taskId ? (taskPagination[taskId] || null) : pagination

  // Pagination functions
  const goToPage = (page: number) => {
    if (taskId) {
      fetchSubtasksByTask(taskId, page)
    }
  }

  const nextPage = () => {
    if (currentPagination && currentPagination.current_page < currentPagination.last_page) {
      goToPage(currentPagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (currentPagination && currentPagination.current_page > 1) {
      goToPage(currentPagination.current_page - 1)
    }
  }

  return {
    subtasks,
    pagination: currentPagination,
    isLoading,
    error,
    fetchSubtasks: (taskId: number) => fetchSubtasksByTask(taskId),
    createSubtask,
    updateSubtask,
    updateTaskStatus,
    deleteSubtask,
    toggleCompletion: toggleSubtaskCompletion,
    // Pagination methods
    goToPage,
    nextPage,
    prevPage
  }
}
