// services/permissionService.ts
import { apiClient } from './api';
import type { Permission } from '../types/Permission';
import type { ApiResponse } from '../types/ApiResponse';

export class PermissionService {
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return apiClient.get<Permission[]>('/permissions');
  }

  async getPermission(id: number): Promise<ApiResponse<Permission>> {
    return apiClient.get<Permission>(`/permissions/${id}`);
  }
}

export const permissionService = new PermissionService();
