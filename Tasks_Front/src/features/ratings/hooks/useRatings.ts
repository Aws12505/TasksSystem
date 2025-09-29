// hooks/useRatings.ts
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
    if (!taskRatingConfigs.length) fetchTaskRatingConfigs()
    if (!stakeholderRatingConfigs.length) fetchStakeholderRatingConfigs()
    if (!finalRatingConfigs.length) fetchFinalRatingConfigs()
    if (!availableTasks.length) fetchAvailableTasks()
    if (!availableProjects.length) fetchAvailableProjects()
    if (!availableUsers.length) fetchAvailableUsers()
  }, [
    taskRatingConfigs.length,
    stakeholderRatingConfigs.length,
    finalRatingConfigs.length,
    availableTasks.length,
    availableProjects.length,
    availableUsers.length,
    fetchTaskRatingConfigs,
    fetchStakeholderRatingConfigs,
    fetchFinalRatingConfigs,
    fetchAvailableTasks,
    fetchAvailableProjects,
    fetchAvailableUsers
  ])

  // Pagination functions for final ratings
  const goToFinalRatingsPage = (page: number) => {
    fetchFinalRatings(page)
  }

  const nextFinalRatingsPage = () => {
    if (finalRatingsPagination && finalRatingsPagination.current_page < finalRatingsPagination.last_page) {
      goToFinalRatingsPage(finalRatingsPagination.current_page + 1)
    }
  }

  const prevFinalRatingsPage = () => {
    if (finalRatingsPagination && finalRatingsPagination.current_page > 1) {
      goToFinalRatingsPage(finalRatingsPagination.current_page - 1)
    }
  }

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
    calculateFinalRating,
    // Final ratings pagination methods
    goToFinalRatingsPage,
    nextFinalRatingsPage,
    prevFinalRatingsPage
  }
}
