// types/Analytics.ts

export interface TrendDataPoint {
  date: string;
  count?: number;
  avg_value?: number;
}

export interface RatingDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface PerformanceMetrics {
  productivity: number;
  quality: number;
  efficiency: number;
  collaboration: number;
}

export interface ActivityLog {
  type: string;
  reference_id: number;
  user_id: number;
  activity_date: string;
  value?: number;
}

export interface UserMetrics {
  assigned_tasks_count: number;
  completed_tasks_count: number;
  total_task_weight: number;
  avg_task_rating_given: number;
  ratings_given_count: number;
  task_completion_rate: number;
}

export interface TicketMetrics {
  tickets_assigned: number;
  tickets_resolved: number;
  tickets_requested: number;
  resolution_rate: number;
  avg_resolution_time: number;
}

export interface HelpMetrics {
  help_requests_made: number;
  help_requests_resolved: number;
  total_penalty_points: number;
  help_ratio: number;
}

export interface RatingMetrics {
  avg_task_rating_received: number;
  task_ratings_received_count: number;
  stakeholder_ratings_given: number;
  avg_stakeholder_rating_given: number;
}

export interface FinalRatingData {
  current_rating: number;
  average_rating: number;
  rating_trend: 'improving' | 'declining' | 'stable';
  total_periods: number;
  recent_ratings: Array<{
    final_rating: number;
    period_start: string;
    period_end: string;
  }>;
}

export interface UserPerformanceOverview {
  user_id: number;
  period: {
    start: string | null;
    end: string | null;
  };
  task_metrics: UserMetrics;
  ticket_metrics: TicketMetrics;
  help_metrics: HelpMetrics;
  rating_metrics: RatingMetrics;
  final_ratings: FinalRatingData;
  performance_score: number;
}

export interface TopPerformer {
  id: number;
  name: string;
  email: string;
  avg_final_rating: number;
  periods_rated: number;
}

export interface UserRanking extends TopPerformer {
  rank: number;
  performance_score: number;
}

export interface ProjectTaskAnalytics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  total_weight: number;
  completed_weight: number;
  avg_task_weight: number;
  overdue_tasks: number;
}

export interface ProjectRatingAnalytics {
  task_ratings: {
    count: number;
    average: number;
    highest: number;
    lowest: number;
  };
  stakeholder_ratings: {
    count: number;
    average: number;
    latest: number;
  };
}

export interface ProjectTeamAnalytics {
  team_size: number;
  team_members: Array<{
    user_id: number;
    name: string;
    total_assignment_percentage: number;
    task_count: number;
  }>;
  avg_assignment_percentage: number;
}

export interface ProjectTimelineAnalytics {
  project_age_days: number;
  estimated_completion_date: string | null;
  tasks_overdue: number;
  upcoming_deadlines: Array<{
    id: number;
    name: string;
    due_date: string;
    status: string;
  }>;
}

export interface ProjectHealthScore {
  overall_score: number;
  completion_score: number;
  quality_score: number;
  timeline_score: number;
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ProjectAnalytics {
  project_id: number;
  basic_info: {
    id: number;
    name: string;
    description: string;
    status: string;
    progress_percentage: number;
    stakeholder_will_rate: boolean;
    stakeholder_name: string;
    created_at: string;
    updated_at: string;
  };
  task_analytics: ProjectTaskAnalytics;
  rating_analytics: ProjectRatingAnalytics;
  team_analytics: ProjectTeamAnalytics;
  timeline_analytics: ProjectTimelineAnalytics;
  health_score: ProjectHealthScore;
}

export interface ProjectHealthSummary {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  project_health_distribution: RatingDistribution;
  avg_project_progress: number;
  overdue_projects_count: number;
}

export interface SystemStats {
  general_stats: {
    total_users: number;
    total_projects: number;
    total_tasks: number;
    total_tickets: number;
    total_help_requests: number;
    active_users: number;
    new_users: number;
  };
  activity_stats: {
    tasks_completed: number;
    tickets_resolved: number;
    help_requests_completed: number;
    ratings_given: number;
    projects_completed: number;
  };
  performance_stats: {
    avg_task_completion_time: number;
    avg_ticket_resolution_time: number;
    avg_help_request_resolution_time: number;
    system_efficiency_score: number;
  };
  quality_stats: {
    avg_task_rating: number;
    avg_stakeholder_rating: number;
    high_quality_tasks_percentage: number;
    help_request_penalty_distribution: Record<string, number>;
  };
  growth_stats: {
    tasks_growth: number;
    tickets_growth: number;
    users_growth: number;
    projects_growth: number;
  };
}

export interface DashboardSummary {
  user_metrics: UserPerformanceOverview | null;
  system_metrics: SystemStats;
  top_performers: TopPerformer[];
  project_health: ProjectHealthSummary;
  recent_activities: ActivityLog[];
  trends: {
    task_ratings_trend: TrendDataPoint[];
    tickets_solved_trend: TrendDataPoint[];
    help_requests_trend: TrendDataPoint[];
  };
}

export interface ComprehensiveReport {
  summary: DashboardSummary;
  user_analytics: UserPerformanceOverview | any;
  project_analytics: ProjectAnalytics | any;
  rating_analytics: {
    task_ratings: {
      total_ratings: number;
      average_rating: number;
      rating_distribution: Array<{ rating_range: string; count: number }>;
    };
    stakeholder_ratings: {
      total_ratings: number;
      average_rating: number;
      rating_distribution: Array<{ rating_range: string; count: number }>;
    };
  };
  performance_metrics: PerformanceMetrics;
  generated_at: string;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  user_id?: number;
  project_id?: number;
}

export interface AnalyticsExportRequest extends AnalyticsFilters {
  format?: 'json' | 'csv' | 'excel';
}
