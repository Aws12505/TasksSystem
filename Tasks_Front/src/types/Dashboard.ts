// types/Dashboard.ts

export type PeriodType = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'month_to_date';

// ==================== Employee Dashboard ====================

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  done: number;
  rated: number;
}

export interface ProjectStats {
  total: number;
  as_stakeholder: number;
  as_contributor: number;
}

export interface HelpRequestStats {
  requested: number;
  helped_others: number;
  pending: number;
}

export interface TicketStats {
  assigned: number;
  completed: number;
  in_progress: number;
}

export interface WeekStats {
  tasks_completed: number;
  helped_colleagues: number;
}

export interface EmployeeOverview {
  assigned_tasks: TaskStats;
  projects: ProjectStats;
  help_requests: HelpRequestStats;
  tickets: TicketStats;
  this_week: WeekStats;
}

export interface UpcomingTask {
  id: number;
  name: string;
  due_date: string;
  days_until_due: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'done' | 'rated';
  project: {
    id: number;
    name: string;
  };
}

export interface RecentActivity {
  type: 'task_completed' | 'helped_colleague';
  title: string;
  project: string;
  timestamp: string;
}

export interface EmployeeDashboardData {
  overview: EmployeeOverview;
  upcoming_tasks: UpcomingTask[];
  recent_activity: RecentActivity[];
}

// ==================== Manager Analytics ====================

export interface ManagerOverview {
  total_employees: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_help_requests: number;
  open_tickets: number;
  average_task_completion_rate: number;
}

export interface ProjectStatusStats {
  by_status: {
    pending: number;
    in_progress: number;
    done: number;
    rated: number;
  };
  average_progress: number;
  at_risk: number;
}

export interface TaskDistribution {
  by_status: {
    pending: number;
    in_progress: number;
    done: number;
    rated: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  overdue: number;
}

export interface HelpRequestsAnalytics {
  total: number;
  completed: number;
  pending: number;
  average_resolution_time: number | null;
  top_helpers: TopHelper[];
}

export interface TopHelper {
  user_id: number;
  user_name: string;
  avatar_url: string | null;
  help_count: number;
}

export interface TicketsAnalytics {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  by_type: {
    quick_fix: number;
    bug_investigation: number;
    user_support: number;
  };
}

export interface UpcomingDeadline {
  id: number;
  name: string;
  due_date: string;
  days_until_due: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'done' | 'rated';
  project: {
    id: number;
    name: string;
  };
  assigned_users_count: number;
}

export interface TopPerformer {
  user_id: number;
  user_name: string;
  avatar_url: string | null;
  completed_tasks: number;
}

export interface ManagerAnalyticsData {
  overview: ManagerOverview;
  project_status: ProjectStatusStats;
  task_distribution: TaskDistribution;
  help_requests_stats: HelpRequestsAnalytics;
  tickets_stats: TicketsAnalytics;
  upcoming_deadlines: UpcomingDeadline[];
  top_performers: TopPerformer[];
}
