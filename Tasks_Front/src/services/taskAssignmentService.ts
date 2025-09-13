// services/taskAssignmentService.ts
import { apiClient } from './api';
import type { 
  TaskWithAssignments, 
  UserTaskAssignment, 
  ProjectAssignments,
  AssignUsersToTaskRequest,
  AddUserToTaskRequest,
  UpdateUserAssignmentRequest
} from '../types/TaskAssignment';
import type { ApiResponse } from '../types/ApiResponse';

export class TaskAssignmentService {
  // Get task with assignments
  async getTaskWithAssignments(taskId: number): Promise<ApiResponse<TaskWithAssignments>> {
    return apiClient.get<TaskWithAssignments>(`/tasks/${taskId}/with-assignments`);
  }

  // Assign multiple users to task
  async assignUsersToTask(taskId: number, data: AssignUsersToTaskRequest): Promise<ApiResponse<TaskWithAssignments>> {
    return apiClient.post<TaskWithAssignments>(`/tasks/${taskId}/assign-users`, data);
  }

  // Add single user to task
  async addUserToTask(taskId: number, data: AddUserToTaskRequest): Promise<ApiResponse<TaskWithAssignments>> {
    return apiClient.post<TaskWithAssignments>(`/tasks/${taskId}/add-user`, data);
  }

  // Update user assignment percentage
  async updateUserAssignment(taskId: number, userId: number, data: UpdateUserAssignmentRequest): Promise<ApiResponse<TaskWithAssignments>> {
    return apiClient.put<TaskWithAssignments>(`/tasks/${taskId}/users/${userId}/assignment`, data);
  }

  // Remove user from task
  async removeUserFromTask(taskId: number, userId: number): Promise<ApiResponse<TaskWithAssignments>> {
    return apiClient.delete<TaskWithAssignments>(`/tasks/${taskId}/users/${userId}`);
  }

  // Get user's task assignments
  async getUserTaskAssignments(userId: number): Promise<ApiResponse<UserTaskAssignment[]>> {
    return apiClient.get<UserTaskAssignment[]>(`/users/${userId}/task-assignments`);
  }

  // Get project assignments
  async getProjectAssignments(projectId: number): Promise<ApiResponse<ProjectAssignments>> {
    return apiClient.get<ProjectAssignments>(`/projects/${projectId}/assignments`);
  }

  // Get section tasks with assignments
  async getSectionTasksWithAssignments(sectionId: number): Promise<ApiResponse<TaskWithAssignments[]>> {
    return apiClient.get<TaskWithAssignments[]>(`/sections/${sectionId}/tasks-with-assignments`);
  }
}

export const taskAssignmentService = new TaskAssignmentService();
