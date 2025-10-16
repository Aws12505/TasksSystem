// src/features/clocking/hooks/useClockingManager.ts

import { useEffect } from 'react';
import { useClockingStore } from '../stores/clockingStore';
import { websocketClient } from '../../../websockets/websocketClient';
import type { ClockSessionUpdatedEvent } from '../../../types/Clocking';

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
    websocketClient.initialize();
    fetchManagerInitialData();

    websocketClient.subscribe<ClockSessionUpdatedEvent>(
      'clocking.manager',
      'ClockSessionUpdated',
      (event) => {
        updateManagerSession(event.user_id, {
          session: event.session,
          company_timezone: event.company_timezone,
          server_time_utc: event.server_time_utc,
        });
      }
    );

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
