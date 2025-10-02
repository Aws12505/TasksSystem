// types/TaskAssignment.ts
import type { User } from './User';
import type { Task } from './Task';
import type { Project } from './Project';

export interface TaskAssignment {
  user_id: number;
  percentage: number;
}
export interface AssignedUserPivot {
  percentage: number;
}

export interface AssignedUser {
  id: number;
  name?: string | null;
  email?: string | null;
  pivot?: AssignedUserPivot; // Laravel -> JSON includes pivot if withPivot()
}

export interface TaskUserPivot {
  id: number;
  task_id: number;
  user_id: number;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface TaskWithAssignments extends Task {
  assigned_users: (User & { pivot: TaskUserPivot })[];
  total_assigned_percentage: number;
  is_fully_assigned: boolean;
}

export interface UserTaskAssignment extends Task {
  pivot: TaskUserPivot;
}

export interface ProjectAssignments {
  project: Project;
  assigned_users: (User & { assigned_tasks: UserTaskAssignment[] })[];
  total_assigned_users: number;
}

// Request types
export interface AssignUsersToTaskRequest {
  assignments: TaskAssignment[];
}

export interface AddUserToTaskRequest {
  user_id: number;
  percentage: number;
}

export interface UpdateUserAssignmentRequest {
  percentage: number;
}
