// services/finalRatingService.ts
import { apiClient } from './api';
import type { ApiResponse } from '../types/ApiResponse';
import type {
  FinalRatingConfig,
  FinalRatingConfigData,
  CalculateFinalRatingRequest,
  FinalRatingResponse,
  CreateConfigRequest,
  UpdateConfigRequest,
} from '../types/FinalRating';

export class FinalRatingService {
  /**
   * Calculate final ratings for a period
   */
  async calculateRatings(data: CalculateFinalRatingRequest): Promise<ApiResponse<FinalRatingResponse>> {
    return apiClient.post<FinalRatingResponse>('/final-ratings/calculate', data);
  }

  /**
   * Export final ratings as ZIP with PDFs
   */
  async exportPdf(data: CalculateFinalRatingRequest): Promise<{ blob: Blob; filename: string }> {
    return apiClient.downloadFile('/final-ratings/export-pdf', data);
  }

  /**
   * Get all configs
   */
  async getConfigs(): Promise<ApiResponse<FinalRatingConfig[]>> {
    return apiClient.get<FinalRatingConfig[]>('/final-ratings/configs');
  }

  /**
   * Get single config
   */
  async getConfig(id: number): Promise<ApiResponse<FinalRatingConfig>> {
    return apiClient.get<FinalRatingConfig>(`/final-ratings/configs/${id}`);
  }

  /**
   * Get active config
   */
  async getActiveConfig(): Promise<ApiResponse<FinalRatingConfig>> {
    return apiClient.get<FinalRatingConfig>('/final-ratings/configs/active');
  }

  /**
   * Get default config structure
   */
  async getDefaultStructure(): Promise<ApiResponse<FinalRatingConfigData>> {
    return apiClient.get<FinalRatingConfigData>('/final-ratings/configs/default-structure');
  }

  /**
   * Create new config
   */
  async createConfig(data: CreateConfigRequest): Promise<ApiResponse<FinalRatingConfig>> {
    return apiClient.post<FinalRatingConfig>('/final-ratings/configs', data);
  }

  /**
   * Update config
   */
  async updateConfig(id: number, data: UpdateConfigRequest): Promise<ApiResponse<FinalRatingConfig>> {
    return apiClient.put<FinalRatingConfig>(`/final-ratings/configs/${id}`, data);
  }

  /**
   * Delete config
   */
  async deleteConfig(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/final-ratings/configs/${id}`);
  }

  /**
   * Activate config
   */
  async activateConfig(id: number): Promise<ApiResponse<FinalRatingConfig>> {
    return apiClient.post<FinalRatingConfig>(`/final-ratings/configs/${id}/activate`);
  }

  
}

export const finalRatingService = new FinalRatingService();
