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
    if (id) {
      fetchStakeholderRatings(id)
      fetchStakeholderRatingConfigs()
    }
  }, [id, fetchStakeholderRatings, fetchStakeholderRatingConfigs])

  return {
    stakeholderRatings,
    stakeholderRatingConfigs,
    pagination: stakeholderRatingsPagination,
    isLoading,
    error,
    createRating: (data: any) => createStakeholderRating({ ...data, project_id: id }),
    updateRating: (ratingId: number, data: any) => updateStakeholderRating(ratingId, data),
    refreshRatings: () => fetchStakeholderRatings(id)
  }
}
