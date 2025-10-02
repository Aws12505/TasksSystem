// services/taskService.ts
import { apiClient } from './api';
import type { Task, CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest, ComprehensiveCreateTaskRequest } from '../types/Task';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export interface TaskFilters {
  status?: string;                 // 'all' | 'pending' | 'in_progress' | 'done' | 'rated'
  project_id?: number | 'all';
  assignees?: number[];            // ex: [1,2,3] -> sent as assignees[]=1&assignees[]=2
  due_from?: string;               // 'YYYY-MM-DD'
  due_to?: string;                 // 'YYYY-MM-DD'
  search?: string;
  per_page?: number;               // default 15
}


export class TaskService {
  async getTasks(page = 1, filters: TaskFilters = {}): Promise<PaginatedApiResponse<Task>> {
    const params: Record<string, any> = { page, ...filters };

    // Normalize array params for backend (assignees[]=1&assignees[]=2)
    if (Array.isArray(filters.assignees)) {
      params.assignees = filters.assignees;
    }

    return apiClient.getPaginated<Task>('/tasks', params);
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
  
  async createTaskComprehensive(data: ComprehensiveCreateTaskRequest): Promise<ApiResponse<Task>> {
  return apiClient.post<Task>('/tasks/comprehensive', data);
}
}

export const taskService = new TaskService();
