// services/projectService.ts
import { apiClient } from './api';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../types/Project';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class ProjectService {
  async getProjects(page = 1, perPage = 15): Promise<PaginatedApiResponse<Project>> {
    return apiClient.getPaginated<Project>('/projects', { page, per_page: perPage });
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`/projects/${id}`);
  }

  async createProject(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>('/projects', data);
  }

  async updateProject(id: number, data: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`/projects/${id}`, data);
  }

  async deleteProject(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/projects/${id}`);
  }
}

export const projectService = new ProjectService();
