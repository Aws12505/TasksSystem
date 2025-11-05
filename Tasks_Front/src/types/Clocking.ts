// src/types/Clocking.ts

import type { User } from './User';

export type ClockSessionStatus = 'active' | 'on_break' | 'completed';
export type BreakRecordStatus = 'active' | 'completed';

/**
 * Break record - only timestamps from backend
 */
export interface BreakRecord {
  id: number;
  clock_session_id: number;
  break_start_utc: string;
  break_end_utc: string | null;
  description: string | null;
  status: BreakRecordStatus;
}

/**
 * Clock session - only timestamps from backend
 */
export interface ClockSession {
  id: number;
  user_id: number;
  clock_in_utc: string;
  clock_out_utc: string | null;
  session_date: string;
  status: ClockSessionStatus;
  crosses_midnight: boolean;
  break_records: BreakRecord[];
  user: User;
}

/**
 * API Response for session data
 */
export interface SessionResponse {
  session: ClockSession | null;
  company_timezone: string;
  server_time_utc: string;
}

/**
 * Manager sessions response
 */
export interface ManagerSessionsResponse {
  sessions: SessionResponse[];
  company_timezone: string;
  server_time_utc: string;
}

/**
 * WebSocket event payload
 */
export interface ClockSessionUpdatedEvent {
  user_id: number;
  session: ClockSession;
  company_timezone: string;
  server_time_utc: string;
}

// Request types
export interface EndBreakRequest {
  description?: string;
}

export interface ExportRequest {
  start_date?: string;
  end_date?: string;
}

export interface RecordsFilters {
  start_date?: string;
  end_date?: string;
  status?: ClockSessionStatus;
  page?: number;
  per_page?: number;
}

export interface ManagerRecordsFilters extends RecordsFilters {
  user_id?: number;
}


