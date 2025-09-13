// services/userService.ts
import { apiClient } from './api';
import type { 
  User, 
  CreateUserRequest,
  UpdateUserRequest,
  SyncUserRolesRequest,
  SyncUserPermissionsRequest,
  SyncUserRolesAndPermissionsRequest,
  UserRolesAndPermissions
} from '../types/User';
import type { Project } from '../types/Project';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class UserService {
  // User CRUD Operations
  async getUsers(page = 1, perPage = 15): Promise<PaginatedApiResponse<User>> {
    return apiClient.getPaginated<User>('/users', { page, per_page: perPage });
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${id}`);
  }

  async getUserWithProjects(id: number): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${id}/with-projects`);
  }

  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/users', data);
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/users/${id}`);
  }

  // User Roles and Permissions Management
  async getUserRolesAndPermissions(userId: number): Promise<ApiResponse<UserRolesAndPermissions>> {
    return apiClient.get<UserRolesAndPermissions>(`/users/${userId}/roles-and-permissions`);
  }

  async syncUserRoles(userId: number, data: SyncUserRolesRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/users/${userId}/sync-roles`, data);
  }

  async syncUserPermissions(userId: number, data: SyncUserPermissionsRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/users/${userId}/sync-permissions`, data);
  }

  async syncUserRolesAndPermissions(
    userId: number, 
    data: SyncUserRolesAndPermissionsRequest
  ): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`/users/${userId}/sync-roles-and-permissions`, data);
  }

  // User Projects
  async getUserProjects(userId: number, page = 1, perPage = 15): Promise<PaginatedApiResponse<Project>> {
    return apiClient.getPaginated<Project>(`/users/${userId}/projects`, { page, per_page: perPage });
  }
}

export const userService = new UserService();
