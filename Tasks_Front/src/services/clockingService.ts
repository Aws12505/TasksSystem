// src/services/clockingService.ts

import { apiClient } from './api';
import type { 
  SessionResponse,
  ManagerSessionsResponse,
  EndBreakRequest,
  ExportRequest,
  RecordsFilters,
  ManagerRecordsFilters,
  ClockSession
} from '../types/Clocking';
import type { ApiResponse, PaginatedApiResponse } from '../types/ApiResponse';

export class ClockingService {
  /**
   * Get initial data for authenticated user
   */
  async getInitialData(): Promise<ApiResponse<SessionResponse>> {
    return apiClient.get<SessionResponse>('/clocking/initial-data');
  }

  /**
   * Clock in
   */
  async clockIn(): Promise<ApiResponse<SessionResponse>> {
    return apiClient.post<SessionResponse>('/clocking/clock-in');
  }

  /**
   * Clock out
   */
  async clockOut(): Promise<ApiResponse<SessionResponse>> {
    return apiClient.post<SessionResponse>('/clocking/clock-out');
  }

  /**
   * Start break
   */
  async startBreak(): Promise<ApiResponse<SessionResponse>> {
    return apiClient.post<SessionResponse>('/clocking/break/start');
  }

  /**
   * End break
   */
  async endBreak(data?: EndBreakRequest): Promise<ApiResponse<SessionResponse>> {
    return apiClient.post<SessionResponse>('/clocking/break/end', data);
  }

  /**
   * Get user's records
   */
  async getRecords(filters?: RecordsFilters): Promise<PaginatedApiResponse<ClockSession>> {
    return apiClient.getPaginated<ClockSession>('/clocking/records', filters);
  }

  /**
   * Export user's records
   */
  async exportRecords(data?: ExportRequest): Promise<{ blob: Blob; filename: string }> {
    return apiClient.downloadFile('/clocking/export', data);
  }

  /**
   * Get manager initial data
   */
  async getManagerInitialData(): Promise<ApiResponse<ManagerSessionsResponse>> {
    return apiClient.get<ManagerSessionsResponse>('/clocking/manager/initial-data');
  }

  /**
   * Get all records (managers)
   */
  async getAllRecords(filters?: ManagerRecordsFilters): Promise<PaginatedApiResponse<ClockSession>> {
    return apiClient.getPaginated<ClockSession>('/clocking/manager/all-records', filters);
  }

  /**
   * Export all records
   */
  async exportAllRecords(data?: ExportRequest): Promise<{ blob: Blob; filename: string }> {
    return apiClient.downloadFile('/clocking/manager/export-all', data);
  }
}

export const clockingService = new ClockingService();
