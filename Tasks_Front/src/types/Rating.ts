import type { User } from './User';
import type { Task } from './Task';
import type { Project } from './Project';

export interface TaskRating {
  id: number;
  task_id: number;
  task: Task;
  rater_id: number;
  rater: User;
  rating_data: Record<string, number>;
  final_rating: number; // Out of 100%
  config_snapshot: any;
  rated_at: string;
  created_at: string;
  updated_at: string;
}

export interface StakeholderRating {
  id: number;
  project_id: number;
  project: Project;
  stakeholder_id: number;
  stakeholder: User;
  rating_data: Record<string, number>;
  final_rating: number; // Out of 100%
  config_snapshot: any;
  rated_at: string;
  created_at: string;
  updated_at: string;
}

export interface FinalRating {
  id: number;
  user_id: number;
  user: User;
  period_start: string;
  period_end: string;
  final_rating: number;
  calculation_steps: Array<{
    expression?: string;
    function?: string;
    variable?: string;
    model?: string;
    column?: string;
    operation?: string;
    result: number;
    type: string;
  }>;
  variables_used: Record<string, number>;
  config_snapshot: any;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRatingRequest {
  task_id: number;
  rating_config_id: number; // ← we send which config to use
  rating_data: Record<string, number>;
}

export interface UpdateTaskRatingRequest {
  rating_config_id?: number; // ← optionally switch config on update
  rating_data?: Record<string, number>;
}

export interface CreateStakeholderRatingRequest {
  project_id: number;
  rating_data: Record<string, number>;
}

export interface CalculateFinalRatingRequest {
  period_start: string;
  period_end: string;
}
