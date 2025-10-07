// services/dashboardService.ts
import { apiClient } from './api';
import type { ApiResponse } from '../types/ApiResponse';
import type {
  EmployeeDashboardData,
  ManagerAnalyticsData,
  PeriodType,
} from '../types/Dashboard';

export class DashboardService {
  /**
   * Get employee dashboard data
   */
  async getEmployeeDashboard(): Promise<ApiResponse<EmployeeDashboardData>> {
    return apiClient.get<EmployeeDashboardData>('/dashboard/employee');
  }

  /**
   * Get manager analytics dashboard
   */
  async getManagerAnalytics(period: PeriodType = 'today'): Promise<ApiResponse<ManagerAnalyticsData>> {
    return apiClient.get<ManagerAnalyticsData>('/dashboard/analytics', { period });
  }
}

export const dashboardService = new DashboardService();
