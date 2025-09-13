import { useEffect } from 'react'
import { useHelpRequestsStore } from '../stores/helpRequestsStore'

export const useHelpRequest = (helpRequestId: number | string) => {
  const {
    currentHelpRequest,
    availableTasks,
    availableUsers,
    isLoading,
    error,
    fetchHelpRequest,
    fetchAvailableTasks,
    fetchAvailableUsers,
    claimHelpRequest,
    assignHelpRequest,
    completeHelpRequest,
    unclaimHelpRequest,
    clearCurrentHelpRequest,
    getRatingOptions
  } = useHelpRequestsStore()

  const id = typeof helpRequestId === 'string' ? parseInt(helpRequestId) : helpRequestId

  useEffect(() => {
    if (id) {
      fetchHelpRequest(id)
      fetchAvailableTasks()
      fetchAvailableUsers()
    }

    return () => {
      clearCurrentHelpRequest()
    }
  }, [id, fetchHelpRequest, fetchAvailableTasks, fetchAvailableUsers, clearCurrentHelpRequest])

  return {
    helpRequest: currentHelpRequest,
    availableTasks,
    availableUsers,
    ratingOptions: getRatingOptions(),
    isLoading,
    error,
    claimRequest: () => claimHelpRequest(id),
    assignRequest: (userId: number) => assignHelpRequest(id, userId),
    completeRequest: (data: { rating: any }) => completeHelpRequest(id, data),
    unclaimRequest: () => unclaimHelpRequest(id)
  }
}
