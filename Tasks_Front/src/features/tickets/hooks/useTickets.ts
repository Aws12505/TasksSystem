import { useEffect } from 'react'
import { useTicketsStore } from '../stores/ticketsStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useTickets = () => {
  const {
    tickets,
    availableTickets,
    pagination,
    isLoading,
    error,
    fetchTickets,
    fetchAvailableTickets,
    createTicket,
    updateTicket,
    updateTicketStatus,
    deleteTicket,
    claimTicket,
    assignTicket,
    completeTicket,
    unassignTicket
  } = useTicketsStore()

  const { searchQuery } = useFiltersStore()

  useEffect(() => {
    fetchTickets()
    fetchAvailableTickets()
  }, [fetchTickets, fetchAvailableTickets])

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAvailableTickets = availableTickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    tickets: filteredTickets,
    availableTickets: filteredAvailableTickets,
    pagination,
    isLoading,
    error,
    fetchTickets,
    fetchAvailableTickets,
    createTicket,
    updateTicket,
    updateTicketStatus,
    deleteTicket,
    claimTicket,
    assignTicket,
    completeTicket,
    unassignTicket
  }
}
