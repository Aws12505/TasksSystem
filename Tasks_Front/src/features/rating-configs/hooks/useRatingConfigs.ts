// hooks/useRatingConfigs.ts
import { useEffect } from 'react'
import { useRatingConfigsStore } from '../stores/ratingConfigsStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useRatingConfigs = () => {
  const {
    ratingConfigs,
    pagination,
    typePagination,
    currentType,
    isLoading,
    error,
    fetchRatingConfigs,
    createRatingConfig,
    updateRatingConfig,
    deleteRatingConfig,
    fetchRatingConfigsByType,
    activateRatingConfig,
    fetchActiveRatingConfigsByType
  } = useRatingConfigsStore()

  const { searchQuery } = useFiltersStore()

  useEffect(() => {
    if (!ratingConfigs.length && !currentType) {
      fetchRatingConfigs(1)
    }
  }, [fetchRatingConfigs, ratingConfigs.length, currentType])

  // Filter rating configs based on search query - apply to current page only
  const filteredRatingConfigs = ratingConfigs.filter(config => 
    config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get current pagination based on active tab
  const currentPagination = currentType ? typePagination[currentType] : pagination

  // Pagination functions
  const goToPage = (page: number) => {
    if (currentType) {
      fetchRatingConfigsByType(currentType, page)
    } else {
      fetchRatingConfigs(page)
    }
  }

  const nextPage = () => {
    if (currentPagination && currentPagination.current_page < currentPagination.last_page) {
      goToPage(currentPagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (currentPagination && currentPagination.current_page > 1) {
      goToPage(currentPagination.current_page - 1)
    }
  }

  return {
    ratingConfigs: filteredRatingConfigs,
    pagination: currentPagination,
    isLoading,
    error,
    fetchRatingConfigs,
    createRatingConfig,
    updateRatingConfig,
    deleteRatingConfig,
    fetchRatingConfigsByType,
    activateRatingConfig,
    fetchActiveRatingConfigsByType,
    // Pagination methods
    goToPage,
    nextPage,
    prevPage
  }
}
