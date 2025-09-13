import { useEffect } from 'react'
import { useRatingsStore } from '../stores/ratingsStore'

export const useRatings = () => {
  const {
    taskRatings,
    stakeholderRatings,
    finalRatings,
    taskRatingConfigs,
    stakeholderRatingConfigs,
    finalRatingConfigs,
    availableTasks,
    availableProjects,
    availableUsers,
    taskRatingsPagination,
    stakeholderRatingsPagination,
    finalRatingsPagination,
    isLoading,
    error,
    fetchTaskRatings,
    fetchStakeholderRatings,
    fetchFinalRatings,
    fetchUserFinalRating,
    fetchTaskRatingConfigs,
    fetchStakeholderRatingConfigs,
    fetchFinalRatingConfigs,
    fetchAvailableTasks,
    fetchAvailableProjects,
    fetchAvailableUsers,
    createTaskRating,
    updateTaskRating,
    createStakeholderRating,
    updateStakeholderRating,
    calculateFinalRating
  } = useRatingsStore()

  useEffect(() => {
    fetchTaskRatingConfigs()
    fetchStakeholderRatingConfigs()
    fetchFinalRatingConfigs()
    fetchAvailableTasks()
    fetchAvailableProjects()
    fetchAvailableUsers()
  }, [
    fetchTaskRatingConfigs,
    fetchStakeholderRatingConfigs,
    fetchFinalRatingConfigs,
    fetchAvailableTasks,
    fetchAvailableProjects,
    fetchAvailableUsers
  ])

  return {
    taskRatings,
    stakeholderRatings,
    finalRatings,
    taskRatingConfigs,
    stakeholderRatingConfigs,
    finalRatingConfigs,
    availableTasks,
    availableProjects,
    availableUsers,
    taskRatingsPagination,
    stakeholderRatingsPagination,
    finalRatingsPagination,
    isLoading,
    error,
    fetchTaskRatings,
    fetchStakeholderRatings,
    fetchFinalRatings,
    fetchUserFinalRating,
    createTaskRating,
    updateTaskRating,
    createStakeholderRating,
    updateStakeholderRating,
    calculateFinalRating
  }
}
