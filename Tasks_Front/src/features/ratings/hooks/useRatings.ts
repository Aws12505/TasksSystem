// hooks/useRatings.ts
import { useEffect } from 'react'
import { useRatingsStore } from '../stores/ratingsStore'

export const useRatings = () => {
  const {
    taskRatings,
    stakeholderRatings,
    taskRatingConfigs,
    stakeholderRatingConfigs,
    availableTasks,
    availableProjects,
    taskRatingsPagination,
    stakeholderRatingsPagination,
    isLoading,
    error,
    fetchTaskRatings,
    fetchStakeholderRatings,
    fetchTaskRatingConfigs,
    fetchStakeholderRatingConfigs,
    fetchAvailableTasks,
    fetchAvailableProjects,
    createTaskRating,
    updateTaskRating,
    createStakeholderRating,
    updateStakeholderRating,
  } = useRatingsStore()

  useEffect(() => {
    if (!taskRatingConfigs.length) fetchTaskRatingConfigs()
    if (!stakeholderRatingConfigs.length) fetchStakeholderRatingConfigs()
    if (!availableTasks.length) fetchAvailableTasks()
    if (!availableProjects.length) fetchAvailableProjects()
  }, [
    taskRatingConfigs.length,
    stakeholderRatingConfigs.length,
    availableTasks.length,
    availableProjects.length,
    fetchTaskRatingConfigs,
    fetchStakeholderRatingConfigs,
    fetchAvailableTasks,
    fetchAvailableProjects,
  ])



  return {
    taskRatings,
    stakeholderRatings,
    taskRatingConfigs,
    stakeholderRatingConfigs,
    availableTasks,
    availableProjects,
    taskRatingsPagination,
    stakeholderRatingsPagination,
    isLoading,
    error,
    fetchTaskRatings,
    fetchStakeholderRatings,
    createTaskRating,
    updateTaskRating,
    createStakeholderRating,
    updateStakeholderRating,

  }
}
