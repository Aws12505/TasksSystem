// src/features/clocking/stores/clockingStore.ts

import { create } from 'zustand';
import { clockingService } from '../../../services/clockingService';
import type { ClockSession, SessionResponse, ClockingCorrectionRequest } from '../../../types/Clocking';
import { toast } from 'sonner';

interface ClockingState {
  session: ClockSession | null;
  companyTimezone: string;
  serverTimeUtc: string;
  records: ClockSession[];
  recordsPagination: any | null;
  
  managerSessions: SessionResponse[];
  managerAllRecords: ClockSession[];
  managerAllRecordsPagination: any | null;
  
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  
  pendingCorrections: ClockingCorrectionRequest[];
  allPendingCorrections: ClockingCorrectionRequest[];
  correctionLoading: boolean;
  correctionError: string | null;

  fetchInitialData: () => Promise<void>;
  updateSession: (data: SessionResponse) => void;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: (description?: string) => Promise<void>;
  fetchRecords: (filters?: any) => Promise<void>;
  exportRecords: (data?: any) => Promise<void>;
  
  fetchManagerInitialData: () => Promise<void>;
  updateManagerSession: (userId: number, data: SessionResponse) => void;
  fetchManagerAllRecords: (filters?: any) => Promise<void>;
  exportManagerRecords: (data?: any) => Promise<void>;
  
  clearError: () => void;

  requestCorrection: (data: any) => Promise<void>;
  getPendingCorrections: () => Promise<void>;
  getAllPendingCorrections: () => Promise<void>;
  handleCorrection: (correctionId: number, action: 'approve' | 'reject', notes?: string) => Promise<void>;
  directEditClockSession: (sessionId: number, data: any) => Promise<void>;
  directEditBreakRecord: (breakId: number, data: any) => Promise<void>;
  clearCorrectionError: () => void;
}

export const useClockingStore = create<ClockingState>((set, get) => ({
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
  pendingCorrections: [],
  allPendingCorrections: [],
  correctionLoading: false,
  correctionError: null,

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

  updateSession: (data: SessionResponse) => {
    set({
      session: data.session,
      companyTimezone: data.company_timezone,
      serverTimeUtc: data.server_time_utc,
    });
  },

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

   exportRecords: async (data?: any) => {
    set({ isExporting: true });
    try {
      // NEW: Download file directly instead of opening URL
      const result = await clockingService.exportRecords(data);
      
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export downloaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      set({ isExporting: false });
    }
  },

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

  // Update or remove manager session based on status
  updateManagerSession: (userId: number, data: SessionResponse) => {
    set((state) => {
      // If session is completed or null, remove it from the list
      if (!data.session || data.session.status === 'completed') {
        return {
          managerSessions: state.managerSessions.filter(
            s => s.session?.user_id !== userId
          ),
          serverTimeUtc: data.server_time_utc,
        };
      }

      // Otherwise, update or add the session
      const sessionIndex = state.managerSessions.findIndex(
        s => s.session?.user_id === userId
      );

      if (sessionIndex === -1) {
        // User not found - add new session
        return {
          managerSessions: [...state.managerSessions, data],
          serverTimeUtc: data.server_time_utc,
        };
      }

      // Update existing session
      const newSessions = [...state.managerSessions];
      newSessions[sessionIndex] = data;

      return {
        managerSessions: newSessions,
        serverTimeUtc: data.server_time_utc,
      };
    });
  },

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

  exportManagerRecords: async (data?: any) => {
    set({ isExporting: true });
    try {
      // NEW: Download file directly instead of opening URL
      const result = await clockingService.exportAllRecords(data);
      
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export downloaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      set({ isExporting: false });
    }
  },

  clearError: () => set({ error: null }),

  requestCorrection: async (data) => {
    set({ correctionLoading: true, correctionError: null });
    try {
      const response = await clockingService.requestCorrection(data);
      if (response.success) {
        toast.success('Correction request submitted');
        await get().getPendingCorrections();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to submit correction';
      set({ correctionError: msg });
      toast.error(msg);
    } finally {
      set({ correctionLoading: false });
    }
  },

  getPendingCorrections: async () => {
    try {
      const response = await clockingService.getPendingCorrections();
      if (response.success) {
        set({ pendingCorrections: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch corrections:', error);
    }
  },

  getAllPendingCorrections: async () => {
    try {
      const response = await clockingService.getAllPendingCorrections();
      if (response.success) {
        set({ allPendingCorrections: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch all corrections:', error);
    }
  },

  handleCorrection: async (correctionId, action, notes) => {
    set({ correctionLoading: true, correctionError: null });
    try {
      const response = await clockingService.handleCorrection(correctionId, {
        action,
        admin_notes: notes,
      });
      if (response.success) {
        toast.success(`Correction ${action}ed`);
        await get().getAllPendingCorrections();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to handle correction';
      set({ correctionError: msg });
      toast.error(msg);
    } finally {
      set({ correctionLoading: false });
    }
  },

  directEditClockSession: async (sessionId, data) => {
    set({ correctionLoading: true, correctionError: null });
    try {
      const response = await clockingService.directEditClockSession(sessionId, data);
      if (response.success) {
        toast.success('Session updated');
        await get().fetchRecords();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update session';
      set({ correctionError: msg });
      toast.error(msg);
    } finally {
      set({ correctionLoading: false });
    }
  },

  directEditBreakRecord: async (breakId, data) => {
    set({ correctionLoading: true, correctionError: null });
    try {
      const response = await clockingService.directEditBreakRecord(breakId, data);
      if (response.success) {
        toast.success('Break updated');
        await get().fetchRecords();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update break';
      set({ correctionError: msg });
      toast.error(msg);
    } finally {
      set({ correctionLoading: false });
    }
  },

  clearCorrectionError: () => {
    set({ correctionError: null });
  },
}));
