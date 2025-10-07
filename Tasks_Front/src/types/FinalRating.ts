// types/FinalRating.ts
export interface FinalRatingConfig {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  config: FinalRatingConfigData;
  created_at: string;
  updated_at: string;
}

export interface FinalRatingConfigData {
  task_ratings: {
    enabled: boolean;
    include_task_weight: boolean;
    include_user_percentage: boolean;
    aggregation: 'sum' | 'average';
  };
  stakeholder_ratings: {
    enabled: boolean;
    include_project_percentage: boolean;
    include_task_weight: boolean;
    aggregation: 'sum' | 'average';
  };
  help_requests_helper: {
    enabled: boolean;
    points_per_help: number;
    max_points: number;
  };
  help_requests_requester: {
    enabled: boolean;
    penalties: {
      basic_skill_gap: number;
      fixing_own_mistakes: number;
      clarification: number;
      other: number;
    };
  };
  tickets_resolved: {
    enabled: boolean;
    points_per_ticket: number;
    max_points: number;
  };
}

export interface CalculateFinalRatingRequest {
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  max_points: number;
  config_id?: number;
}

export interface FinalRatingResult {
  user_id: number;
  user_name: string;
  user_email: string;
  avatar_url: string | null;
  breakdown: {
    task_ratings: TaskRatingBreakdown;
    stakeholder_ratings: StakeholderRatingBreakdown;
    help_requests: HelpRequestBreakdown;
    tickets_resolved: TicketBreakdown;
  };
  total_points: number;
  max_points: number;
  final_percentage: number;
}

export interface TaskRatingBreakdown {
  enabled: boolean;
  value: number;
  tasks_included: number;
  aggregation?: string;
  include_task_weight?: boolean;
  include_user_percentage?: boolean;
  details: TaskRatingDetail[];
}

export interface TaskRatingDetail {
  task_id: number;
  task_name: string;
  task_rating: number;
  task_weight: number | null;
  user_percentage: number | null;
  calculation: string;
  contribution: number;
}

export interface StakeholderRatingBreakdown {
  enabled: boolean;
  value: number;
  projects_included: number;
  aggregation?: string;
  include_project_percentage?: boolean;
  include_task_weight?: boolean;
  details: StakeholderRatingDetail[];
}

export interface StakeholderRatingDetail {
  project_id: number;
  project_name: string;
  stakeholder_rating: number;
  user_project_percentage: number | null;
  calculation: string;
  contribution: number;
}

export interface HelpRequestBreakdown {
  helper: {
    enabled: boolean;
    value: number;
    count: number;
    points_per_help?: number;
    max_points?: number;
    capped?: boolean;
  };
  requester: {
    enabled: boolean;
    value: number;
    total_requests?: number;
    breakdown: Record<string, {
      count: number;
      penalty_per_request: number;
      total: number;
    }>;
  };
}

export interface TicketBreakdown {
  enabled: boolean;
  value: number;
  count: number;
  points_per_ticket?: number;
  max_points?: number;
  capped?: boolean;
}

export interface FinalRatingResponse {
  period: {
    start: string;
    end: string;
  };
  config: {
    id: number;
    name: string;
  };
  max_points_for_100_percent: number;
  calculated_at: string;
  users: FinalRatingResult[];
}

export interface CreateConfigRequest {
  name: string;
  description?: string;
  config: FinalRatingConfigData;
  is_active?: boolean;
}

export interface UpdateConfigRequest {
  name?: string;
  description?: string;
  config?: FinalRatingConfigData;
  is_active?: boolean;
}
