// services/analyticsService.ts
import { apiClient } from './api';
import type { 
  DashboardSummary,
  ComprehensiveReport,
  UserPerformanceOverview,
  ProjectAnalytics,
  TopPerformer,
  SystemStats,
  AnalyticsFilters,
  AnalyticsExportRequest
} from '../types/Analytics';
import type { ApiResponse } from '../types/ApiResponse';

export class AnalyticsService {
  /**
   * Get dashboard summary data with optional user and date filtering
   */
  async getDashboardSummary(
    userId?: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<ApiResponse<DashboardSummary>> {
    const params = new URLSearchParams();
    
    if (userId) params.append('user_id', userId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get<DashboardSummary>(`/analytics/dashboard?${params.toString()}`);
  }

  /**
   * Get comprehensive analytics report with filtering
   */
  async getComprehensiveReport(filters: AnalyticsFilters = {}): Promise<ApiResponse<ComprehensiveReport>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return apiClient.get<ComprehensiveReport>(`/analytics/report?${params.toString()}`);
  }

  /**
   * Get detailed user performance analytics
   */
  async getUserAnalytics(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<UserPerformanceOverview>> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get<UserPerformanceOverview>(`/analytics/users/${userId}?${params.toString()}`);
  }

  /**
   * Get detailed project analytics
   */
  async getProjectAnalytics(
    projectId: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ProjectAnalytics>> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get<ProjectAnalytics>(`/analytics/projects/${projectId}?${params.toString()}`);
  }

  /**
   * Get top performing users
   */
  async getTopPerformers(
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<TopPerformer[]>> {
    const params = new URLSearchParams();
    
    params.append('limit', limit.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get<TopPerformer[]>(`/analytics/top-performers?${params.toString()}`);
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStats(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<SystemStats>> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get<SystemStats>(`/analytics/system?${params.toString()}`);
  }

  /**
   * Export analytics report in different formats
   */
  async exportReport(request: AnalyticsExportRequest): Promise<ApiResponse<ComprehensiveReport>> {
    const params = new URLSearchParams();
    
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return apiClient.get<ComprehensiveReport>(`/analytics/export?${params.toString()}`);
  }

  /**
   * Get user rankings with performance scores
   */
  async getUserRankings(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<Array<{
    user_id: number;
    name: string;
    email: string;
    performance_score: number;
    rank: number;
  }>>> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get(`/analytics/rankings?${params.toString()}`);
  }

  /**
   * Get project health overview
   */
  async getProjectHealthOverview(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    project_health_distribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
    avg_project_progress: number;
    overdue_projects_count: number;
  }>> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get(`/analytics/project-health?${params.toString()}`);
  }

  /**
   * Get trending data for charts
   */
  async getTrendData(
    metric: 'task_ratings' | 'tickets_solved' | 'help_requests',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<Array<{
    date: string;
    count?: number;
    avg_value?: number;
  }>>> {
    const params = new URLSearchParams();
    
    params.append('metric', metric);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get(`/analytics/trends?${params.toString()}`);
  }

  /**
   * Get performance comparison between users
   */
  async compareUsers(
    userIds: number[],
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<Array<UserPerformanceOverview>>> {
    const params = new URLSearchParams();
    
    userIds.forEach(id => params.append('user_ids[]', id.toString()));
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get(`/analytics/compare-users?${params.toString()}`);
  }

  /**
   * Get performance comparison between projects
   */
  async compareProjects(
    projectIds: number[],
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<Array<ProjectAnalytics>>> {
    const params = new URLSearchParams();
    
    projectIds.forEach(id => params.append('project_ids[]', id.toString()));
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return apiClient.get(`/analytics/compare-projects?${params.toString()}`);
  }

  /**
   * Get real-time analytics summary (for live dashboards)
   */
  async getRealTimeStats(): Promise<ApiResponse<{
    active_users_now: number;
    tasks_completed_today: number;
    tickets_resolved_today: number;
    help_requests_today: number;
    average_performance_today: number;
    system_health_score: number;
  }>> {
    return apiClient.get('/analytics/realtime');
  }

  /**
   * Generate custom analytics report
   */
  async generateCustomReport(config: {
    metrics: string[];
    groupBy: 'user' | 'project' | 'date';
    filters: AnalyticsFilters;
    aggregations: ('sum' | 'avg' | 'count' | 'min' | 'max')[];
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/analytics/custom-report', config);
  }

  /**
   * Schedule analytics report generation
   */
  async scheduleReport(config: {
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    filters: AnalyticsFilters;
    email_recipients: string[];
    format: 'json' | 'csv' | 'excel';
  }): Promise<ApiResponse<{ scheduled_report_id: number }>> {
    return apiClient.post('/analytics/schedule-report', config);
  }

  /**
   * Get performance alerts and notifications
   */
  async getPerformanceAlerts(): Promise<ApiResponse<Array<{
    id: number;
    type: 'low_performance' | 'overdue_tasks' | 'rating_drop' | 'system_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    user_id?: number;
    project_id?: number;
    created_at: string;
    is_read: boolean;
  }>>> {
    return apiClient.get('/analytics/alerts');
  }

  /**
   * Mark performance alert as read
   */
  async markAlertAsRead(alertId: number): Promise<ApiResponse<null>> {
    return apiClient.post(`/analytics/alerts/${alertId}/mark-read`, {});
  }

  // Helper methods for data processing and formatting

  /**
   * Format analytics data for chart display
   */
  formatForChart(
    data: Array<{ date: string; count?: number; avg_value?: number }>,
    type: 'line' | 'bar' | 'pie'
  ): any {
    switch (type) {
      case 'line':
      case 'bar':
        return {
          labels: data.map(item => item.date),
          datasets: [{
            data: data.map(item => item.count || item.avg_value || 0),
          }]
        };
      case 'pie':
        return {
          labels: data.map(item => item.date),
          data: data.map(item => item.count || item.avg_value || 0),
        };
      default:
        return data;
    }
  }

  /**
   * Calculate performance grade from score
   */
  getPerformanceGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get performance status color
   */
  getPerformanceColor(score: number): string {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#eab308'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Format duration in days to human readable format
   */
  formatDuration(days: number): string {
    if (days < 1) return 'Less than a day';
    if (days === 1) return '1 day';
    if (days < 7) return `${Math.round(days)} days`;
    if (days < 30) return `${Math.round(days / 7)} weeks`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  }
}

export const analyticsService = new AnalyticsService();
