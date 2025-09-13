// types/Task.ts
import type { Section } from './Section';
import type { Subtask } from './Subtask';

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
  section: Section;
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
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
