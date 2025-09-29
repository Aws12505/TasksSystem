// hooks/useTaskRating.ts
import { useEffect } from 'react'
import { useRatingsStore } from '../stores/ratingsStore'
import type { CreateTaskRatingRequest, UpdateTaskRatingRequest } from '../../../types/Rating'

export const useTaskRating = (taskId: number | string) => {
  const {
    taskRatings,
    taskRatingConfigs,
    taskRatingsPagination,
    isLoading,
    error,
    fetchTaskRatings,
    fetchTaskRatingConfigs,
    createTaskRating,
    updateTaskRating
  } = useRatingsStore()

  const id = typeof taskId === 'string' ? parseInt(taskId) : taskId

  useEffect(() => {
    if (id && !taskRatings.length) {
      fetchTaskRatings(id, 1)
      fetchTaskRatingConfigs()
    }
  }, [id, fetchTaskRatings, fetchTaskRatingConfigs, taskRatings.length])

  // Pagination functions
  const goToPage = (page: number) => {
    fetchTaskRatings(id, page)
  }

  const nextPage = () => {
    if (taskRatingsPagination && taskRatingsPagination.current_page < taskRatingsPagination.last_page) {
      goToPage(taskRatingsPagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (taskRatingsPagination && taskRatingsPagination.current_page > 1) {
      goToPage(taskRatingsPagination.current_page - 1)
    }
  }

  return {
    taskRatings,
    taskRatingConfigs,
    pagination: taskRatingsPagination,
    isLoading,
    error,
    createRating: (data: CreateTaskRatingRequest) => createTaskRating({ ...data, task_id: id }),
    updateRating: (ratingId: number, data: UpdateTaskRatingRequest) => updateTaskRating(ratingId, data),
    refreshRatings: () => fetchTaskRatings(id),
    // Pagination methods
    goToPage,
    nextPage,
    prevPage
  }
}
