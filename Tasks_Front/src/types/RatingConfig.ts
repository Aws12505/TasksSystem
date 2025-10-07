// types/RatingConfig.ts
import type { User } from './User';

export type RatingConfigType = 'task_rating' | 'stakeholder_rating';

export interface RatingField {
  name: string; // e.g., "Code Cleanliness"
  max_value: number; // e.g., 50
  description?: string; // NEW: Optional description field
}

export interface TaskRatingConfigData {
  fields: RatingField[];
}

export interface StakeholderRatingConfigData {
  fields: RatingField[];
}


export interface RatingConfig {
  id: number;
  name: string;
  description: string | null;
  type: RatingConfigType;
  config_data: TaskRatingConfigData | StakeholderRatingConfigData;
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
  config_data: TaskRatingConfigData | StakeholderRatingConfigData;
  is_active?: boolean;
}
