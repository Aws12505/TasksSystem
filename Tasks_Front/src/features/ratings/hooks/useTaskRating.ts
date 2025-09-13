import { useEffect } from 'react'
import { useRatingsStore } from '../stores/ratingsStore'

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
    createRating: (data: any) => createTaskRating({ ...data, task_id: id }),
    updateRating: (ratingId: number, data: any) => updateTaskRating(ratingId, data),
    refreshRatings: () => fetchTaskRatings(id)
  }
}
