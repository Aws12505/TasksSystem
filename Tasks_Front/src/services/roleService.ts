// services/roleService.ts
import { apiClient } from './api';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../types/Role';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class RoleService {
  async getRoles(page = 1, perPage = 15): Promise<PaginatedApiResponse<Role>> {
    return apiClient.getPaginated<Role>('/roles', { page, per_page: perPage });
  }

  async getRole(id: number): Promise<ApiResponse<Role>> {
    return apiClient.get<Role>(`/roles/${id}`);
  }

  async createRole(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.post<Role>('/roles', data);
  }

  async updateRole(id: number, data: UpdateRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.put<Role>(`/roles/${id}`, data);
  }

  async deleteRole(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/roles/${id}`);
  }
}

export const roleService = new RoleService();
