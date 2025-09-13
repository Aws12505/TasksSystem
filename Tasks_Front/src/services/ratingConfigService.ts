// services/ratingConfigService.ts
import { apiClient } from './api';
import type { 
  RatingConfig, 
  CreateRatingConfigRequest 
} from '../types/RatingConfig';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class RatingConfigService {
  async getRatingConfigs(page = 1, perPage = 15): Promise<PaginatedApiResponse<RatingConfig>> {
    return apiClient.getPaginated<RatingConfig>('/rating-configs', { page, per_page: perPage });
  }

  async getRatingConfig(id: number): Promise<ApiResponse<RatingConfig>> {
    return apiClient.get<RatingConfig>(`/rating-configs/${id}`);
  }

  async createRatingConfig(data: CreateRatingConfigRequest): Promise<ApiResponse<RatingConfig>> {
    return apiClient.post<RatingConfig>('/rating-configs', data);
  }

  async updateRatingConfig(id: number, data: Partial<CreateRatingConfigRequest>): Promise<ApiResponse<RatingConfig>> {
    return apiClient.put<RatingConfig>(`/rating-configs/${id}`, data);
  }

  async deleteRatingConfig(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/rating-configs/${id}`);
  }

  async getRatingConfigsByType(type: string, page = 1, perPage = 15): Promise<PaginatedApiResponse<RatingConfig>> {
    return apiClient.getPaginated<RatingConfig>(`/rating-configs/type/${type}`, { page, per_page: perPage });
  }

  async activateRatingConfig(id: number): Promise<ApiResponse<RatingConfig>> {
    return apiClient.post<RatingConfig>(`/rating-configs/${id}/activate`, {});
  }
}

export const ratingConfigService = new RatingConfigService();
