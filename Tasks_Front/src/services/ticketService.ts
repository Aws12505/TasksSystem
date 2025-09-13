// services/ticketService.ts
import { apiClient } from './api';
import type { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest,
  UpdateTicketStatusRequest,
  TicketStatusOption,
  TicketTypeOption
} from '../types/Ticket';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class TicketService {
  // Get all tickets
  async getTickets(page = 1, perPage = 15): Promise<PaginatedApiResponse<Ticket>> {
    return apiClient.getPaginated<Ticket>('/tickets', { page, per_page: perPage });
  }

  // Get ticket by ID
  async getTicket(id: number): Promise<ApiResponse<Ticket>> {
    return apiClient.get<Ticket>(`/tickets/${id}`);
  }

  // Create new ticket
  async createTicket(data: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>('/tickets', data);
  }

  // Update ticket
  async updateTicket(id: number, data: UpdateTicketRequest): Promise<ApiResponse<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${id}`, data);
  }

  // Delete ticket
  async deleteTicket(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/tickets/${id}`);
  }

  // Get available tickets (unassigned and open)
  async getAvailableTickets(page = 1, perPage = 15): Promise<PaginatedApiResponse<Ticket>> {
    return apiClient.getPaginated<Ticket>('/tickets/available', { page, per_page: perPage });
  }

  // Get tickets by requester
  async getTicketsByRequester(userId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<Ticket>> {
    return apiClient.getPaginated<Ticket>(`/users/${userId}/tickets/requested`, { page, per_page: perPage });
  }

  // Get tickets assigned to user
  async getTicketsByAssignee(userId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<Ticket>> {
    return apiClient.getPaginated<Ticket>(`/users/${userId}/tickets/assigned`, { page, per_page: perPage });
  }

  // Get tickets by status
  async getTicketsByStatus(status: string, page = 1, perPage = 15): Promise<PaginatedApiResponse<Ticket>> {
    return apiClient.getPaginated<Ticket>(`/tickets/status/${status}`, { page, per_page: perPage });
  }

  // Get tickets by type
  async getTicketsByType(type: string, page = 1, perPage = 15): Promise<PaginatedApiResponse<Ticket>> {
    return apiClient.getPaginated<Ticket>(`/tickets/type/${type}`, { page, per_page: perPage });
  }

  // Claim ticket
  async claimTicket(id: number): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>(`/tickets/${id}/claim`, {});
  }

  // Assign ticket to specific user
  async assignTicket(id: number, userId: number): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>(`/tickets/${id}/assign/${userId}`, {});
  }

  // Complete ticket
  async completeTicket(id: number): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>(`/tickets/${id}/complete`, {});
  }

  // Unassign ticket
  async unassignTicket(id: number): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>(`/tickets/${id}/unassign`, {});
  }

  // Update ticket status
  async updateTicketStatus(id: number, data: UpdateTicketStatusRequest): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>(`/tickets/${id}/status`, data);
  }

  // Helper methods for options
  static getTicketStatusOptions(): TicketStatusOption[] {
    return [
      { value: 'open', label: 'Open', color: 'red' },
      { value: 'in_progress', label: 'In Progress', color: 'yellow' },
      { value: 'resolved', label: 'Resolved', color: 'green' },
    ];
  }

  static getTicketTypeOptions(): TicketTypeOption[] {
    return [
      { value: 'quick_fix', label: 'Quick Fix', estimatedTime: '1-2 hours' },
      { value: 'bug_investigation', label: 'Bug Investigation', estimatedTime: '4-8 hours' },
      { value: 'user_support', label: 'User Support', estimatedTime: '30 minutes - 2 hours' },
    ];
  }
}

export const ticketService = new TicketService();
