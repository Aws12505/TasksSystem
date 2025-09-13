// types/HelpRequest.ts
import type { User } from './User';
import type { Task } from './Task';

export type HelpRequestRating = 
  | 'legitimate_learning'    // 0.1x penalty
  | 'basic_skill_gap'        // 0.3x penalty  
  | 'careless_mistake'       // 0.6x penalty
  | 'fixing_own_mistakes';   // 0.8x penalty

export interface HelpRequest {
  id: number;
  description: string;
  task_id: number;
  task: Task;
  requester_id: number;
  requester: User;
  helper_id: number | null;
  helper: User | null;
  rating: HelpRequestRating | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  is_claimed: boolean;
  is_available: boolean;
  penalty_multiplier: number | null;
}

export interface CreateHelpRequestRequest {
  description: string;
  task_id: number;
  helper_id?: number; // For direct assignment
}

export interface UpdateHelpRequestRequest {
  description?: string;
  helper_id?: number;
}

export interface CompleteHelpRequestRequest {
  rating: HelpRequestRating;
}

export interface HelpRequestRatingOption {
  value: HelpRequestRating;
  label: string;
  penalty: number;
}
