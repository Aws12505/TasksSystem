// services/kanbanService.ts
import { apiClient } from './api';
import type { KanbanBoard, MoveTaskToSectionRequest, MoveTaskStatusRequest } from '@/types/Kanban';
import type { Task } from '../types/Task';
import type { ApiResponse } from '../types/ApiResponse';

export class KanbanService {
  async getProjectKanban(projectId: number): Promise<ApiResponse<KanbanBoard>> {
    return apiClient.get<KanbanBoard>(`/projects/${projectId}/kanban`);
  }

  async moveTaskToSection(taskId: number, data: MoveTaskToSectionRequest): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/tasks/${taskId}/move-section`, data);
  }

  async moveTaskStatus(taskId: number, data: MoveTaskStatusRequest): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/tasks/${taskId}/move-status`, data);
  }
}

export const kanbanService = new KanbanService();
