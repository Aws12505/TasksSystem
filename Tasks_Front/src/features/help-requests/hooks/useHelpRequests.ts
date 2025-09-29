// hooks/useHelpRequests.ts
import { useEffect } from 'react'
import { useHelpRequestsStore } from '../stores/helpRequestsStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useHelpRequests = () => {
  const {
    helpRequests,
    availableHelpRequests,
    pagination,
    availablePagination,
    isLoading,
    error,
    fetchHelpRequests,
    fetchAvailableHelpRequests,
    createHelpRequest,
    updateHelpRequest,
    deleteHelpRequest,
    claimHelpRequest,
    assignHelpRequest,
    completeHelpRequest,
    unclaimHelpRequest
  } = useHelpRequestsStore()

  const { searchQuery } = useFiltersStore()

  useEffect(() => {
    if (!helpRequests.length) {
      fetchHelpRequests(1)
    }
    if (!availableHelpRequests.length) {
      fetchAvailableHelpRequests(1)
    }
  }, [fetchHelpRequests, fetchAvailableHelpRequests, helpRequests.length, availableHelpRequests.length])

  // Filter help requests based on search query - apply to current page only
  const filteredHelpRequests = helpRequests.filter(request => 
    request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.task?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAvailableHelpRequests = availableHelpRequests.filter(request => 
    request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.task?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination functions
  const goToPage = (page: number) => {
    fetchHelpRequests(page)
  }

  const goToAvailablePage = (page: number) => {
    fetchAvailableHelpRequests(page)
  }

  const nextPage = () => {
    if (pagination && pagination.current_page < pagination.last_page) {
      goToPage(pagination.current_page + 1)
    }
  }

  const prevPage = () => {
    if (pagination && pagination.current_page > 1) {
      goToPage(pagination.current_page - 1)
    }
  }

  const nextAvailablePage = () => {
    if (availablePagination && availablePagination.current_page < availablePagination.last_page) {
      goToAvailablePage(availablePagination.current_page + 1)
    }
  }

  const prevAvailablePage = () => {
    if (availablePagination && availablePagination.current_page > 1) {
      goToAvailablePage(availablePagination.current_page - 1)
    }
  }

  return {
    helpRequests: filteredHelpRequests,
    availableHelpRequests: filteredAvailableHelpRequests,
    pagination,
    availablePagination,
    isLoading,
    error,
    fetchHelpRequests,
    fetchAvailableHelpRequests,
    createHelpRequest,
    updateHelpRequest,
    deleteHelpRequest,
    claimHelpRequest,
    assignHelpRequest,
    completeHelpRequest,
    unclaimHelpRequest,
    // Pagination methods
    goToPage,
    goToAvailablePage,
    nextPage,
    prevPage,
    nextAvailablePage,
    prevAvailablePage
  }
}
