// types/Task.ts
import type { Section } from './Section';
import type { Subtask } from './Subtask';
import type { Project } from './Project';
import type { AssignedUser } from './TaskAssignment';
import type { TaskComment } from './TaskComment';


export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'rated';
export type Priority = 'low' | 'medium' | 'high' | 'critical';


export interface Task {
  id: number;
  name: string;
  description: string | null;
  weight: number;
  due_date: string;
  priority: Priority;
  status: TaskStatus;
  section_id: number;
  project_id: number;
  project?: Project;
  section: Section;
  latest_final_rating?: number | string; // string if returned as decimal
  subtasks: Subtask[];
  assigned_users?: AssignedUser[];
  comments?: TaskComment[]; // ADD THIS LINE
  created_at: string;
  updated_at: string;
  completed_at?: string | null; // New field to track completion time
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  weight: number;
  due_date: string;
  priority: Priority;
  section_id: number;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  weight?: number;
  due_date?: string;
  priority?: Priority;
  status?: TaskStatus;
  section_id?: number;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

// Add this interface
export interface ComprehensiveCreateTaskRequest {
  name: string;
  description?: string;
  weight: number;
  due_date: string;
  priority: Priority;
  section_id: number;
  subtasks?: {
    name: string;
    description?: string;
    due_date: string;
    priority: Priority;
  }[];
  assignments?: {
    user_id: number;
    percentage: number;
  }[];
}

