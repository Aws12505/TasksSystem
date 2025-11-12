import type { User } from './User';

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskCommentRequest {
  content: string;
}

export interface UpdateTaskCommentRequest {
  content: string;
}
