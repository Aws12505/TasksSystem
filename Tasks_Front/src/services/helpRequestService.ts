// services/helpRequestService.ts
import { apiClient } from './api';
import type { 
  HelpRequest, 
  CreateHelpRequestRequest, 
  UpdateHelpRequestRequest,
  CompleteHelpRequestRequest,
  HelpRequestRatingOption
} from '../types/HelpRequest';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class HelpRequestService {
  // Get all help requests
  async getHelpRequests(page = 1, perPage = 15): Promise<PaginatedApiResponse<HelpRequest>> {
    return apiClient.getPaginated<HelpRequest>('/help-requests', { page, per_page: perPage });
  }

  // Get help request by ID
  async getHelpRequest(id: number): Promise<ApiResponse<HelpRequest>> {
    return apiClient.get<HelpRequest>(`/help-requests/${id}`);
  }

  // Create new help request
  async createHelpRequest(data: CreateHelpRequestRequest): Promise<ApiResponse<HelpRequest>> {
    return apiClient.post<HelpRequest>('/help-requests', data);
  }

  // Update help request
  async updateHelpRequest(id: number, data: UpdateHelpRequestRequest): Promise<ApiResponse<HelpRequest>> {
    return apiClient.put<HelpRequest>(`/help-requests/${id}`, data);
  }

  // Delete help request
  async deleteHelpRequest(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/help-requests/${id}`);
  }

  // Get available help requests (unclaimed)
  async getAvailableHelpRequests(page = 1, perPage = 15): Promise<PaginatedApiResponse<HelpRequest>> {
    return apiClient.getPaginated<HelpRequest>('/help-requests/available', { page, per_page: perPage });
  }

  // Get help requests for specific task
  async getHelpRequestsByTask(taskId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<HelpRequest>> {
    return apiClient.getPaginated<HelpRequest>(`/tasks/${taskId}/help-requests`, { page, per_page: perPage });
  }

  // Get help requests made by user
  async getHelpRequestsByRequester(userId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<HelpRequest>> {
    return apiClient.getPaginated<HelpRequest>(`/users/${userId}/help-requests/requested`, { page, per_page: perPage });
  }

  // Get help requests user is helping with
  async getHelpRequestsByHelper(userId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<HelpRequest>> {
    return apiClient.getPaginated<HelpRequest>(`/users/${userId}/help-requests/helping`, { page, per_page: perPage });
  }

  // Claim help request
  async claimHelpRequest(id: number): Promise<ApiResponse<HelpRequest>> {
    return apiClient.post<HelpRequest>(`/help-requests/${id}/claim`, {});
  }

  // Assign help request to specific user
  async assignHelpRequest(id: number, userId: number): Promise<ApiResponse<HelpRequest>> {
    return apiClient.post<HelpRequest>(`/help-requests/${id}/assign/${userId}`, {});
  }

  // Complete help request with rating
  async completeHelpRequest(id: number, data: CompleteHelpRequestRequest): Promise<ApiResponse<HelpRequest>> {
    return apiClient.post<HelpRequest>(`/help-requests/${id}/complete`, data);
  }

  // Unclaim help request
  async unclaimHelpRequest(id: number): Promise<ApiResponse<HelpRequest>> {
    return apiClient.post<HelpRequest>(`/help-requests/${id}/unclaim`, {});
  }

  // Helper methods for rating options
  static getHelpRequestRatingOptions(): HelpRequestRatingOption[] {
    return [
      { value: 'legitimate_learning', label: 'Legitimate Learning', penalty: 0.1 },
      { value: 'basic_skill_gap', label: 'Basic Skill Gap', penalty: 0.3 },
      { value: 'careless_mistake', label: 'Careless Mistake', penalty: 0.6 },
      { value: 'fixing_own_mistakes', label: 'Fixing Own Mistakes', penalty: 0.8 },
    ];
  }
}

export const helpRequestService = new HelpRequestService();
