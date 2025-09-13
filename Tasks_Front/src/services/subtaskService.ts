// services/subtaskService.ts
import { apiClient } from './api';
import type { Subtask, CreateSubtaskRequest, UpdateSubtaskRequest } from '../types/Subtask';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class SubtaskService {
  async getSubtasks(page = 1, perPage = 15): Promise<PaginatedApiResponse<Subtask>> {
    return apiClient.getPaginated<Subtask>('/subtasks', { page, per_page: perPage });
  }

  async getSubtask(id: number): Promise<ApiResponse<Subtask>> {
    return apiClient.get<Subtask>(`/subtasks/${id}`);
  }

  async createSubtask(data: CreateSubtaskRequest): Promise<ApiResponse<Subtask>> {
    return apiClient.post<Subtask>('/subtasks', data);
  }

  async updateSubtask(id: number, data: UpdateSubtaskRequest): Promise<ApiResponse<Subtask>> {
    return apiClient.put<Subtask>(`/subtasks/${id}`, data);
  }

  async deleteSubtask(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/subtasks/${id}`);
  }

  async getSubtasksByTask(taskId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<Subtask>> {
    return apiClient.getPaginated<Subtask>(`/tasks/${taskId}/subtasks`, { page, per_page: perPage });
  }

  async toggleSubtaskCompletion(id: number): Promise<ApiResponse<Subtask>> {
    return apiClient.post<Subtask>(`/subtasks/${id}/toggle`);
  }
}

export const subtaskService = new SubtaskService();
