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
  avatar_url?: string | null;
}

// Helper type for permission checking
export type PermissionName = 
  | 'view users' | 'create users' | 'edit users' | 'delete users'
  | 'view roles' | 'create roles' | 'edit roles' | 'delete roles'  
  | 'view permissions'
  | 'view projects' | 'create projects' | 'edit projects' | 'delete projects'
  | 'view sections' | 'create sections' | 'edit sections' | 'delete sections'
  | 'view tasks' | 'create tasks' | 'edit tasks' | 'delete tasks'
  | 'view subtasks' | 'create subtasks' | 'edit subtasks' | 'delete subtasks'
  | 'view help requests' | 'create help requests' | 'edit help requests' | 'delete help requests'
  | 'view tickets' | 'edit tickets' | 'delete tickets'
  | 'view rating configs' | 'create rating configs' | 'edit rating configs' | 'delete rating configs'
  | 'create task ratings' | 'edit task ratings'
  | 'create stakeholder ratings' | 'edit stakeholder ratings' | 'calculate final ratings' | 'view analytics';

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
