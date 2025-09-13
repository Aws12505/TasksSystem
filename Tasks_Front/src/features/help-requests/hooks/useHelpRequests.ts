import { useEffect } from 'react'
import { useHelpRequestsStore } from '../stores/helpRequestsStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useHelpRequests = () => {
  const {
    helpRequests,
    availableHelpRequests,
    pagination,
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
    fetchHelpRequests()
    fetchAvailableHelpRequests()
  }, [fetchHelpRequests, fetchAvailableHelpRequests])

  // Filter help requests based on search query
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

  return {
    helpRequests: filteredHelpRequests,
    availableHelpRequests: filteredAvailableHelpRequests,
    pagination,
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
  }
}
