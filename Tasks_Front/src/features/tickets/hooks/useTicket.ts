import { useEffect } from 'react'
import { useTicketsStore } from '../stores/ticketsStore'

export const useTicket = (ticketId: number | string) => {
  const {
    currentTicket,
    availableUsers,
    isLoading,
    error,
    fetchTicket,
    fetchAvailableUsers,
    claimTicket,
    assignTicket,
    completeTicket,
    unassignTicket,
    updateTicketStatus,
    clearCurrentTicket,
    getStatusOptions,
    getTypeOptions
  } = useTicketsStore()

  const id = typeof ticketId === 'string' ? parseInt(ticketId) : ticketId

  useEffect(() => {
    if (id) {
      fetchTicket(id)
      fetchAvailableUsers()
    }

    return () => {
      clearCurrentTicket()
    }
  }, [id, fetchTicket, fetchAvailableUsers, clearCurrentTicket])

  return {
    ticket: currentTicket,
    availableUsers,
    statusOptions: getStatusOptions(),
    typeOptions: getTypeOptions(),
    isLoading,
    error,
    claimTicket: () => claimTicket(id),
    assignTicket: (userId: number) => assignTicket(id, userId),
    completeTicket: () => completeTicket(id),
    unassignTicket: () => unassignTicket(id),
    updateStatus: (status: any) => updateTicketStatus(id, { status })
  }
}
