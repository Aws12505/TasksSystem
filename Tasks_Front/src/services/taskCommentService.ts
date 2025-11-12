import { apiClient } from './api';
import type { TaskComment, CreateTaskCommentRequest, UpdateTaskCommentRequest } from '../types/TaskComment';
import type { ApiResponse } from '../types/ApiResponse';

export class TaskCommentService {
  // Create a comment
  async createComment(taskId: number, data: CreateTaskCommentRequest): Promise<ApiResponse<TaskComment>> {
    return apiClient.post<TaskComment>(`tasks/${taskId}/comments`, data);
  }

  // Update a comment
  async updateComment(commentId: number, data: UpdateTaskCommentRequest): Promise<ApiResponse<TaskComment>> {
    return apiClient.put<TaskComment>(`comments/${commentId}`, data);
  }

  // Delete a comment
  async deleteComment(commentId: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`comments/${commentId}`);
  }
}

export const taskCommentService = new TaskCommentService();
