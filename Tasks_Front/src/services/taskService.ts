// services/taskService.ts
import { apiClient } from './api';
import type { Task, CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest } from '../types/Task';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class TaskService {
  async getTasks(page = 1, perPage = 15): Promise<PaginatedApiResponse<Task>> {
    return apiClient.getPaginated<Task>('/tasks', { page, per_page: perPage });
  }

  async getTask(id: number): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/tasks/${id}`);
  }

  async createTask(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/tasks', data);
  }

  async updateTask(id: number, data: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  }

  async deleteTask(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/tasks/${id}`);
  }

  async getTasksBySection(sectionId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<Task>> {
    return apiClient.getPaginated<Task>(`/sections/${sectionId}/tasks`, { page, per_page: perPage });
  }

  async updateTaskStatus(id: number, data: UpdateTaskStatusRequest): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/tasks/${id}/status`, data);
  }
}

export const taskService = new TaskService();
