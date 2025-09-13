// types/Subtask.ts
import type { Task } from './Task';
import type { Priority } from './Task';

export interface Subtask {
  id: number;
  name: string;
  description: string | null;
  due_date: string;
  priority: Priority;
  is_complete: boolean;
  task_id: number;
  task: Task;
  created_at: string;
  updated_at: string;
}

export interface CreateSubtaskRequest {
  name: string;
  description?: string;
  due_date: string;
  priority: Priority;
  task_id: number;
}

export interface UpdateSubtaskRequest {
  name?: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  is_complete?: boolean;
  task_id?: number;
}
