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
    if (id) {
      fetchTaskRatings(id)
      fetchTaskRatingConfigs()
    }
  }, [id, fetchTaskRatings, fetchTaskRatingConfigs])

  return {
    taskRatings,
    taskRatingConfigs,
    pagination: taskRatingsPagination,
    isLoading,
    error,
    createRating: (data: CreateTaskRatingRequest) => createTaskRating({ ...data, task_id: id }),
    updateRating: (ratingId: number, data: UpdateTaskRatingRequest) => updateTaskRating(ratingId, data),
    refreshRatings: () => fetchTaskRatings(id)
  }
}
