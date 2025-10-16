// src/features/clocking/hooks/useClockingManager.ts

import { useEffect } from 'react';
import { useClockingStore } from '../stores/clockingStore';
import { websocketClient } from '../../../websockets/websocketClient';
import type { ClockSessionUpdatedEvent } from '../../../types/Clocking';

/**
 * Manager hook
 * Fetches initial data + WebSocket for real-time updates
 */
export const useClockingManager = () => {
  const {
    managerSessions,
    companyTimezone,
    isLoading,
    isExporting,
    fetchManagerInitialData,
    updateManagerSession,
    fetchManagerAllRecords,
    exportManagerRecords,
  } = useClockingStore();

  useEffect(() => {
    // Initialize WebSocket
    websocketClient.initialize();

    // Fetch initial data
    fetchManagerInitialData();

    // Subscribe to manager channel
    websocketClient.subscribe<ClockSessionUpdatedEvent>(
      'clocking.manager',
      'ClockSessionUpdated',
      (event) => {
        console.log('📡 Manager received update for user:', event.user_id);
        // Update specific user's session
        updateManagerSession(event.user_id, {
          session: event.session,
          company_timezone: event.company_timezone,
          server_time_utc: event.server_time_utc,
        });
      }
    );

    // Cleanup
    return () => {
      websocketClient.unsubscribe('clocking.manager');
    };
  }, [fetchManagerInitialData, updateManagerSession]);

  return {
    sessions: managerSessions,
    companyTimezone,
    isLoading,
    isExporting,
    refresh: fetchManagerInitialData,
    fetchAllRecords: fetchManagerAllRecords,
    exportAll: exportManagerRecords,
  };
};
