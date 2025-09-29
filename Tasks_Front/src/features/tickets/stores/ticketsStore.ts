// stores/ticketsStore.ts
import { create } from 'zustand'
import { ticketService, TicketService } from '../../../services/ticketService'
import { userService } from '../../../services/userService'
import type { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  UpdateTicketStatusRequest,
  TicketStatusOption,
  TicketTypeOption
} from '../../../types/Ticket'
import type { User } from '../../../types/User'
import { toast } from 'sonner'

interface PaginationInfo {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

interface TicketsState {
  tickets: Ticket[]
  availableTickets: Ticket[]
  currentTicket: Ticket | null
  availableUsers: User[]
  statusOptions: TicketStatusOption[]
  typeOptions: TicketTypeOption[]
  pagination: PaginationInfo | null
  availablePagination: PaginationInfo | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchTickets: (page?: number) => Promise<void>
  fetchAvailableTickets: (page?: number) => Promise<void>
  fetchTicket: (id: number) => Promise<void>
  fetchTicketsByRequester: (userId: number, page?: number) => Promise<void>
  fetchTicketsByAssignee: (userId: number, page?: number) => Promise<void>
  fetchTicketsByStatus: (status: string, page?: number) => Promise<void>
  fetchTicketsByType: (type: string, page?: number) => Promise<void>
  fetchAvailableUsers: () => Promise<void>
  createTicket: (data: CreateTicketRequest) => Promise<Ticket | null>
  updateTicket: (id: number, data: UpdateTicketRequest) => Promise<Ticket | null>
  updateTicketStatus: (id: number, data: UpdateTicketStatusRequest) => Promise<Ticket | null>
  deleteTicket: (id: number) => Promise<boolean>
  claimTicket: (id: number) => Promise<Ticket | null>
  assignTicket: (id: number, userId: number) => Promise<Ticket | null>
  completeTicket: (id: number) => Promise<Ticket | null>
  unassignTicket: (id: number) => Promise<Ticket | null>
  getStatusOptions: () => TicketStatusOption[]
  getTypeOptions: () => TicketTypeOption[]
  clearCurrentTicket: () => void
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: [],
  availableTickets: [],
  currentTicket: null,
  availableUsers: [],
  statusOptions: TicketService.getTicketStatusOptions(),
  typeOptions: TicketService.getTicketTypeOptions(),
  pagination: null,
  availablePagination: null,
  isLoading: false,
  error: null,

  fetchTickets: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.getTickets(page)
      if (response.success) {
        set({
          tickets: response.data,
          pagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tickets'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchAvailableTickets: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.getAvailableTickets(page)
      if (response.success) {
        set({
          availableTickets: response.data,
          availablePagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch available tickets'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTicket: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.getTicket(id)
      if (response.success) {
        set({ currentTicket: response.data, isLoading: false })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch ticket'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTicketsByRequester: async (userId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.getTicketsByRequester(userId, page)
      if (response.success) {
        set({
          tickets: response.data,
          pagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tickets by requester'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTicketsByAssignee: async (userId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.getTicketsByAssignee(userId, page)
      if (response.success) {
        set({
          tickets: response.data,
          pagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tickets by assignee'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTicketsByStatus: async (status: string, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.getTicketsByStatus(status, page)
      if (response.success) {
        set({
          tickets: response.data,
          pagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tickets by status'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTicketsByType: async (type: string, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.getTicketsByType(type, page)
      if (response.success) {
        set({
          tickets: response.data,
          pagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1,
            from: response.data.length > 0 ? 1 : null,
            to: response.data.length
          },
          isLoading: false
        })
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tickets by type'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchAvailableUsers: async () => {
    try {
      const response = await userService.getUsers(1, 100)
      if (response.success) {
        set({ availableUsers: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
    }
  },

  createTicket: async (data: CreateTicketRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.createTicket(data)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Ticket created successfully')
        // Refresh tickets list
        get().fetchTickets()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create ticket'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateTicket: async (id: number, data: UpdateTicketRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.updateTicket(id, data)
      if (response.success) {
        set({ currentTicket: response.data, isLoading: false })
        toast.success('Ticket updated successfully')
        // Refresh tickets list
        get().fetchTickets()
        return response.data
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update ticket'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateTicketStatus: async (id: number, data: UpdateTicketStatusRequest) => {
    try {
      const response = await ticketService.updateTicketStatus(id, data)
      if (response.success) {
        toast.success('Ticket status updated')
        // Update current ticket if it's the one being updated
        if (get().currentTicket?.id === id) {
          set({ currentTicket: response.data })
        }
        // Refresh tickets list
        get().fetchTickets()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update ticket status')
      return null
    }
  },

  deleteTicket: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ticketService.deleteTicket(id)
      if (response.success) {
        set({ isLoading: false })
        toast.success('Ticket deleted successfully')
        // Refresh tickets list
        get().fetchTickets()
        return true
      } else {
        set({ error: response.message, isLoading: false })
        toast.error(response.message)
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete ticket'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  claimTicket: async (id: number) => {
    try {
      const response = await ticketService.claimTicket(id)
      if (response.success) {
        toast.success('Ticket claimed successfully')
        // Update current ticket if it's the one being claimed
        if (get().currentTicket?.id === id) {
          set({ currentTicket: response.data })
        }
        // Refresh lists
        get().fetchTickets()
        get().fetchAvailableTickets()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim ticket')
      return null
    }
  },

  assignTicket: async (id: number, userId: number) => {
    try {
      const response = await ticketService.assignTicket(id, userId)
      if (response.success) {
        toast.success('Ticket assigned successfully')
        // Update current ticket if it's the one being assigned
        if (get().currentTicket?.id === id) {
          set({ currentTicket: response.data })
        }
        // Refresh lists
        get().fetchTickets()
        get().fetchAvailableTickets()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign ticket')
      return null
    }
  },

  completeTicket: async (id: number) => {
    try {
      const response = await ticketService.completeTicket(id)
      if (response.success) {
        toast.success('Ticket completed successfully')
        // Update current ticket if it's the one being completed
        if (get().currentTicket?.id === id) {
          set({ currentTicket: response.data })
        }
        // Refresh lists
        get().fetchTickets()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete ticket')
      return null
    }
  },

  unassignTicket: async (id: number) => {
    try {
      const response = await ticketService.unassignTicket(id)
      if (response.success) {
        toast.success('Ticket unassigned successfully')
        // Update current ticket if it's the one being unassigned
        if (get().currentTicket?.id === id) {
          set({ currentTicket: response.data })
        }
        // Refresh lists
        get().fetchTickets()
        get().fetchAvailableTickets()
        return response.data
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to unassign ticket')
      return null
    }
  },

  getStatusOptions: () => {
    return TicketService.getTicketStatusOptions()
  },

  getTypeOptions: () => {
    return TicketService.getTicketTypeOptions()
  },

  clearCurrentTicket: () => set({ 
    currentTicket: null, 
    error: null 
  })
}))
