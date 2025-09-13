// types/User.ts
import type { Role } from './Role';
import type { Permission } from './Permission';
import type { Project } from './Project';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: Role[];
  permissions: Permission[];
  projects?: Project[]; // Optional since not always loaded
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  permissions?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roles?: string[];
  permissions?: string[];
}

export interface SyncUserRolesRequest {
  roles: string[];
}

export interface SyncUserPermissionsRequest {
  permissions: string[];
}

export interface SyncUserRolesAndPermissionsRequest {
  roles?: string[];
  permissions?: string[];
}

export interface UserRolesAndPermissions {
  user: User;
  roles: Role[];
  direct_permissions: Permission[];
  all_permissions: Permission[];
}
