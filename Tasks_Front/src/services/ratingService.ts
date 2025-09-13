// services/ratingService.ts
import { apiClient } from './api';
import type { 
  TaskRating, 
  StakeholderRating,
  FinalRating,
  CreateTaskRatingRequest, 
  CreateStakeholderRatingRequest,
  CalculateFinalRatingRequest
} from '../types/Rating';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class RatingService {
  // Task Ratings
  async createTaskRating(data: CreateTaskRatingRequest): Promise<ApiResponse<TaskRating>> {
    return apiClient.post<TaskRating>('/task-ratings', data);
  }

  async updateTaskRating(id: number, data: Partial<CreateTaskRatingRequest>): Promise<ApiResponse<TaskRating>> {
    return apiClient.put<TaskRating>(`/task-ratings/${id}`, data);
  }

  async getTaskRatingsByTask(taskId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<TaskRating>> {
    return apiClient.getPaginated<TaskRating>(`/tasks/${taskId}/ratings`, { page, per_page: perPage });
  }

  // Stakeholder Ratings
  async createStakeholderRating(data: CreateStakeholderRatingRequest): Promise<ApiResponse<StakeholderRating>> {
    return apiClient.post<StakeholderRating>('/stakeholder-ratings', data);
  }

  async updateStakeholderRating(id: number, data: Partial<CreateStakeholderRatingRequest>): Promise<ApiResponse<StakeholderRating>> {
    return apiClient.put<StakeholderRating>(`/stakeholder-ratings/${id}`, data);
  }

  async getStakeholderRatingsByProject(projectId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<StakeholderRating>> {
    return apiClient.getPaginated<StakeholderRating>(`/projects/${projectId}/stakeholder-ratings`, { page, per_page: perPage });
  }

  // Final Ratings
  async getAllFinalRatings(page = 1, perPage = 15): Promise<PaginatedApiResponse<FinalRating>> {
    return apiClient.getPaginated<FinalRating>('/final-ratings', { page, per_page: perPage });
  }

  async calculateFinalRating(userId: number, data: CalculateFinalRatingRequest): Promise<ApiResponse<FinalRating>> {
    return apiClient.post<FinalRating>(`/users/${userId}/calculate-final-rating`, data);
  }

  async getUserFinalRating(userId: number, periodStart: string, periodEnd: string): Promise<ApiResponse<FinalRating>> {
    return apiClient.get<FinalRating>(`/users/${userId}/final-rating/${periodStart}/${periodEnd}`);
  }
}

export const ratingService = new RatingService();
