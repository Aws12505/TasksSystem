// hooks/useStakeholderRating.ts
import { useEffect } from 'react'
import { useRatingsStore } from '../stores/ratingsStore'

export const useStakeholderRating = (projectId: number | string) => {
  const {
    stakeholderRatings,
    stakeholderRatingConfigs,
    stakeholderRatingsPagination,
    isLoading,
    error,
    fetchStakeholderRatings,
    fetchStakeholderRatingConfigs,
    createStakeholderRating,
    updateStakeholderRating
  } = useRatingsStore()

  const id = typeof projectId === 'string' ? parseInt(projectId) : projectId

  useEffect(() => {
    if (id && !stakeholderRatings.length) {
      fetchStakeholderRatings(id, 1)
      fetchStakeholderRatingConfigs()
    }
  }, [id, fetchStakeholderRatings, fetchStakeholderRatingConfigs, stakeholderRatings.length])

  // Pagination functions
  const goToPage = (page: number) => {
    fetchStakeholderRatings(id, page)
  }

  const nextPage = () => {
    if (stakeholderRatingsPagination && stakeholderRatingsPagination.current_page < stakeholderRatingsPagination.last_page) {
      goToPage(stakeholderRatingsPagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (stakeholderRatingsPagination && stakeholderRatingsPagination.current_page > 1) {
      goToPage(stakeholderRatingsPagination.current_page - 1)
    }
  }

  return {
    stakeholderRatings,
    stakeholderRatingConfigs,
    pagination: stakeholderRatingsPagination,
    isLoading,
    error,
    createRating: (data: any) => createStakeholderRating({ ...data, project_id: id }),
    updateRating: (ratingId: number, data: any) => updateStakeholderRating(ratingId, data),
    refreshRatings: () => fetchStakeholderRatings(id),
    // Pagination methods
    goToPage,
    nextPage,
    prevPage
  }
}
