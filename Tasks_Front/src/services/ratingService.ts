import { apiClient } from './api';
import type { 
  TaskRating, 
  StakeholderRating,
  CreateTaskRatingRequest, 
  CreateStakeholderRatingRequest,
  UpdateTaskRatingRequest
} from '../types/Rating';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class RatingService {
  async createTaskRating(data: CreateTaskRatingRequest): Promise<ApiResponse<TaskRating>> {
    return apiClient.post<TaskRating>('/task-ratings', data);
  }

  async updateTaskRating(id: number, data: UpdateTaskRatingRequest): Promise<ApiResponse<TaskRating>> {
    return apiClient.put<TaskRating>(`/task-ratings/${id}`, data);
  }

  async getTaskRatingsByTask(taskId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<TaskRating>> {
    return apiClient.getPaginated<TaskRating>(`/tasks/${taskId}/ratings`, { page, per_page: perPage });
  }

  async createStakeholderRating(data: CreateStakeholderRatingRequest): Promise<ApiResponse<StakeholderRating>> {
    return apiClient.post<StakeholderRating>('/stakeholder-ratings', data);
  }

  async updateStakeholderRating(id: number, data: Partial<CreateStakeholderRatingRequest>): Promise<ApiResponse<StakeholderRating>> {
    return apiClient.put<StakeholderRating>(`/stakeholder-ratings/${id}`, data);
  }

  async getStakeholderRatingsByProject(projectId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<StakeholderRating>> {
    return apiClient.getPaginated<StakeholderRating>(`/projects/${projectId}/stakeholder-ratings`, { page, per_page: perPage });
  }

}

export const ratingService = new RatingService();
