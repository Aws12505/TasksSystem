// hooks/useTickets.ts
import { useEffect } from 'react'
import { useTicketsStore } from '../stores/ticketsStore'
import { useFiltersStore } from '../../../stores/filtersStore'

export const useTickets = () => {
  const {
    tickets,
    availableTickets,
    pagination,
    availablePagination,
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
    if (!tickets.length) {
      fetchTickets(1)
    }
    if (!availableTickets.length) {
      fetchAvailableTickets(1)
    }
  }, [fetchTickets, fetchAvailableTickets, tickets.length, availableTickets.length])

  // Filter tickets based on search query - apply to current page only
  const filteredTickets = tickets.filter(ticket => 
  ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  ticket.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  ticket.requester_name?.toLowerCase().includes(searchQuery.toLowerCase()) // ⬅️ added
)

const filteredAvailableTickets = availableTickets.filter(ticket => 
  ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  ticket.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  ticket.requester_name?.toLowerCase().includes(searchQuery.toLowerCase()) // ⬅️ added
)
  // Pagination functions
  const goToPage = (page: number) => {
    fetchTickets(page)
  }

  const goToAvailablePage = (page: number) => {
    fetchAvailableTickets(page)
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
    tickets: filteredTickets,
    availableTickets: filteredAvailableTickets,
    pagination,
    availablePagination,
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
    unassignTicket,
    // Pagination methods
    goToPage,
    goToAvailablePage,
    nextPage,
    prevPage,
    nextAvailablePage,
    prevAvailablePage
  }
}
