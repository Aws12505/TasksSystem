// services/sectionService.ts
import { apiClient } from './api';
import type { Section, CreateSectionRequest, UpdateSectionRequest } from '../types/Section';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class SectionService {
  async getSections(page = 1, perPage = 15): Promise<PaginatedApiResponse<Section>> {
    return apiClient.getPaginated<Section>('/sections', { page, per_page: perPage });
  }

  async getSection(id: number): Promise<ApiResponse<Section>> {
    return apiClient.get<Section>(`/sections/${id}`);
  }

  async createSection(data: CreateSectionRequest): Promise<ApiResponse<Section>> {
    return apiClient.post<Section>('/sections', data);
  }

  async updateSection(id: number, data: UpdateSectionRequest): Promise<ApiResponse<Section>> {
    return apiClient.put<Section>(`/sections/${id}`, data);
  }

  async deleteSection(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/sections/${id}`);
  }

  async getSectionsByProject(projectId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<Section>> {
    return apiClient.getPaginated<Section>(`/projects/${projectId}/sections`, { page, per_page: perPage });
  }
}

export const sectionService = new SectionService();
