// src/features/clocking/stores/clockingStore.ts

import { create } from 'zustand';
import { clockingService } from '../../../services/clockingService';
import type { ClockSession, SessionResponse } from '../../../types/Clocking';
import { toast } from 'sonner';

interface ClockingState {
  // Employee data
  session: ClockSession | null;
  companyTimezone: string;
  serverTimeUtc: string;
  records: ClockSession[];
  recordsPagination: any | null;
  
  // Manager data
  managerSessions: SessionResponse[];
  managerAllRecords: ClockSession[];
  managerAllRecordsPagination: any | null;
  
  // UI
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  updateSession: (data: SessionResponse) => void;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: (description?: string) => Promise<void>;
  fetchRecords: (filters?: any) => Promise<void>;
  exportRecords: (data?: any) => Promise<void>;
  
  // Manager actions
  fetchManagerInitialData: () => Promise<void>;
  updateManagerSession: (userId: number, data: SessionResponse) => void;
  fetchManagerAllRecords: (filters?: any) => Promise<void>;
  exportManagerRecords: (data?: any) => Promise<void>;
  
  clearError: () => void;
}

export const useClockingStore = create<ClockingState>((set, get) => ({
  // Initial state
  session: null,
  companyTimezone: 'UTC',
  serverTimeUtc: '',
  records: [],
  recordsPagination: null,
  managerSessions: [],
  managerAllRecords: [],
  managerAllRecordsPagination: null,
  isLoading: false,
  isExporting: false,
  error: null,

  // Fetch initial data
  fetchInitialData: async () => {
    try {
      const response = await clockingService.getInitialData();
      if (response.success) {
        set({
          session: response.data.session,
          companyTimezone: response.data.company_timezone,
          serverTimeUtc: response.data.server_time_utc,
        });
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  },

  // Update session from backend (WebSocket or API response)
  updateSession: (data: SessionResponse) => {
    set({
      session: data.session,
      companyTimezone: data.company_timezone,
      serverTimeUtc: data.server_time_utc,
    });
  },

  // Clock in
  clockIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await clockingService.clockIn();
      if (response.success) {
        toast.success(response.message);
        get().updateSession(response.data);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to clock in';
      set({ error: msg });
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // Clock out
  clockOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await clockingService.clockOut();
      if (response.success) {
        toast.success(response.message);
        get().updateSession(response.data);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to clock out';
      set({ error: msg });
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // Start break
  startBreak: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await clockingService.startBreak();
      if (response.success) {
        toast.success(response.message);
        get().updateSession(response.data);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to start break';
      set({ error: msg });
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // End break
  endBreak: async (description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clockingService.endBreak(
        description ? { description } : undefined
      );
      if (response.success) {
        toast.success(response.message);
        get().updateSession(response.data);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to end break';
      set({ error: msg });
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch records
  fetchRecords: async (filters?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clockingService.getRecords(filters);
      if (response.success) {
        set({
          records: response.data,
          recordsPagination: response.pagination,
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to fetch records';
      set({ error: msg });
      toast.error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // Export records
  exportRecords: async (data?: any) => {
    set({ isExporting: true });
    try {
      const response = await clockingService.exportRecords(data);
      if (response.success) {
        window.open(response.data.download_url, '_blank');
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      set({ isExporting: false });
    }
  },

  // Fetch manager initial data
  fetchManagerInitialData: async () => {
    set({ isLoading: true });
    try {
      const response = await clockingService.getManagerInitialData();
      if (response.success) {
        set({
          managerSessions: response.data.sessions,
          companyTimezone: response.data.company_timezone,
          serverTimeUtc: response.data.server_time_utc,
        });
      }
    } catch (error) {
      console.error('Failed to fetch manager data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Update manager session from WebSocket
  updateManagerSession: (userId: number, data: SessionResponse) => {
    set((state) => ({
      managerSessions: state.managerSessions.map((s) =>
        s.session?.user_id === userId ? data : s
      ),
    }));
  },

  // Fetch manager all records
  fetchManagerAllRecords: async (filters?: any) => {
    set({ isLoading: true });
    try {
      const response = await clockingService.getAllRecords(filters);
      if (response.success) {
        set({
          managerAllRecords: response.data,
          managerAllRecordsPagination: response.pagination,
        });
      }
    } catch (error) {
      console.error('Failed to fetch all records:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Export manager records
  exportManagerRecords: async (data?: any) => {
    set({ isExporting: true });
    try {
      const response = await clockingService.exportAllRecords(data);
      if (response.success) {
        window.open(response.data.download_url, '_blank');
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      set({ isExporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
