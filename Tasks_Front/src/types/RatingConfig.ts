// types/RatingConfig.ts
import type { User } from './User';

export type RatingConfigType = 'task_rating' | 'stakeholder_rating' | 'final_rating';

export interface RatingField {
  name: string; // e.g., "Code Cleanliness"
  max_value: number; // e.g., 50
  description?: string; // NEW: Optional description field
}

export interface FormulaVariable {
  name: string; // Variable name in formula (e.g., "task_avg")
  model: string; // Model name (e.g., "TaskRating")
  column: string; // Column to aggregate (e.g., "final_rating")
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  conditions?: Array<{
    column: string;
    operator: string;
    value: any;
  }>;
}

export interface TaskRatingConfigData {
  fields: RatingField[];
}

export interface StakeholderRatingConfigData {
  fields: RatingField[];
}

export interface FinalRatingConfigData {
  expression: string; // e.g., "(task_avg + stakeholder_avg) * tickets_bonus / penalty_factor"
  variables: FormulaVariable[];
}

export interface RatingConfig {
  id: number;
  name: string;
  description: string | null;
  type: RatingConfigType;
  config_data: TaskRatingConfigData | StakeholderRatingConfigData | FinalRatingConfigData;
  is_active: boolean;
  created_by: number;
  creator: User;
  created_at: string;
  updated_at: string;
}

export interface CreateRatingConfigRequest {
  name: string;
  description?: string;
  type: RatingConfigType;
  config_data: TaskRatingConfigData | StakeholderRatingConfigData | FinalRatingConfigData;
  is_active?: boolean;
}
