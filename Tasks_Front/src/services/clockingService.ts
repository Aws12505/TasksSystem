// src/services/clockingService.ts

import { apiClient } from './api';
import type { 
  SessionResponse,
  ManagerSessionsResponse,
  EndBreakRequest,
  ExportRequest,
  RecordsFilters,
  ManagerRecordsFilters,
  ClockSession,
  BreakRecord,
  ClockingCorrectionRequest
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

  async requestCorrection(data: {
    clock_session_id?: number;
    break_record_id?: number;
    correction_type: 'clock_in' | 'clock_out' | 'break_in' | 'break_out';
    requested_time_utc: string;
    reason: string;
  }): Promise<ApiResponse<ClockingCorrectionRequest>> {
    return apiClient.post<ClockingCorrectionRequest>('/clocking/correction-request', data);
  }

  async getPendingCorrections(): Promise<ApiResponse<ClockingCorrectionRequest[]>> {
    return apiClient.get<ClockingCorrectionRequest[]>('/clocking/pending-corrections');
  }

  async getAllPendingCorrections(): Promise<ApiResponse<ClockingCorrectionRequest[]>> {
    return apiClient.get<ClockingCorrectionRequest[]>('/clocking/manager/pending-corrections');
  }

  async handleCorrection(correctionId: number, data: {
    action: 'approve' | 'reject';
    admin_notes?: string;
  }): Promise<ApiResponse<ClockingCorrectionRequest>> {
    return apiClient.post<ClockingCorrectionRequest>(
      `/clocking/manager/correction/${correctionId}/handle`,
      data
    );
  }

  async directEditClockSession(sessionId: number, data: {
    clock_in_utc?: string;
    clock_out_utc?: string;
  }): Promise<ApiResponse<ClockSession>> {
    return apiClient.put<ClockSession>(`/clocking/manager/session/${sessionId}/edit`, data);
  }

  async directEditBreakRecord(breakId: number, data: {
    break_start_utc?: string;
    break_end_utc?: string;
  }): Promise<ApiResponse<BreakRecord>> {
    return apiClient.put<BreakRecord>(`/clocking/manager/break/${breakId}/edit`, data);
  }
}

export const clockingService = new ClockingService();
