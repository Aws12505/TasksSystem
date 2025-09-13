import { useEffect } from 'react'
import { useRatingConfigsStore } from '../stores/ratingConfigsStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useRatingConfigs = () => {
  const {
    ratingConfigs,
    pagination,
    isLoading,
    error,
    fetchRatingConfigs,
    createRatingConfig,
    updateRatingConfig,
    deleteRatingConfig,
    fetchRatingConfigsByType,
    activateRatingConfig
  } = useRatingConfigsStore()

  const { searchQuery } = useFiltersStore()

  useEffect(() => {
    fetchRatingConfigs()
  }, [fetchRatingConfigs])

  // Filter rating configs based on search query
  const filteredRatingConfigs = ratingConfigs.filter(config => 
    config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    ratingConfigs: filteredRatingConfigs,
    pagination,
    isLoading,
    error,
    fetchRatingConfigs,
    createRatingConfig,
    updateRatingConfig,
    deleteRatingConfig,
    fetchRatingConfigsByType,
    activateRatingConfig
  }
}
