import { useEffect } from 'react'
import { useRatingConfigsStore } from '../stores/ratingConfigsStore'

export const useRatingConfig = (ratingConfigId: number | string) => {
  const {
    currentRatingConfig,
    isLoading,
    error,
    fetchRatingConfig,
    activateRatingConfig,
    clearCurrentRatingConfig
  } = useRatingConfigsStore()

  const id = typeof ratingConfigId === 'string' ? parseInt(ratingConfigId) : ratingConfigId

  useEffect(() => {
    if (id) {
      fetchRatingConfig(id)
    }

    return () => {
      clearCurrentRatingConfig()
    }
  }, [id, fetchRatingConfig, clearCurrentRatingConfig])

  return {
    ratingConfig: currentRatingConfig,
    isLoading,
    error,
    activateConfig: () => activateRatingConfig(id)
  }
}
