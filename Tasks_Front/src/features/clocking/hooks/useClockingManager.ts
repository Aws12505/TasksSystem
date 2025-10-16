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
    websocketClient.initialize();
    fetchManagerInitialData();

    // LEVEL 2: Log event handler execution
    websocketClient.subscribe<ClockSessionUpdatedEvent>(
      'clocking.manager',
      'ClockSessionUpdated',
      (event) => {
        console.group(`🟢 [LEVEL 2] Hook Event Handler Triggered`);
        console.log('Event Received:', {
          user_id: event.user_id,
          session_id: event.session?.id,
          session_status: event.session?.status,
          break_records_count: event.session?.break_records?.length,
          company_timezone: event.company_timezone,
          server_time: event.server_time_utc,
        });
        
        // Check current state BEFORE update
        const currentState = useClockingStore.getState();
        console.log('Current managerSessions count:', currentState.managerSessions.length);
        console.log('Current managerSessions:', currentState.managerSessions.map(s => ({
          userId: s.session?.user_id,
          sessionId: s.session?.id,
          status: s.session?.status,
        })));
        
        // Find the session we're about to update
        const existingSession = currentState.managerSessions.find(
          s => s.session?.user_id === event.user_id
        );
        console.log('Existing session for user', event.user_id, ':', existingSession ? {
          sessionId: existingSession.session?.id,
          status: existingSession.session?.status,
          breakCount: existingSession.session?.break_records?.length,
        } : 'NOT FOUND');
        
        console.groupEnd();
        
        // Call the update function
        console.log('🟡 Calling updateManagerSession...');
        updateManagerSession(event.user_id, {
          session: event.session,
          company_timezone: event.company_timezone,
          server_time_utc: event.server_time_utc,
        });
        
        // Check state AFTER update (with a small delay to ensure state updated)
        setTimeout(() => {
          const updatedState = useClockingStore.getState();
          console.group(`🟣 [LEVEL 2] State After Update`);
          console.log('Updated managerSessions count:', updatedState.managerSessions.length);
          const updatedSession = updatedState.managerSessions.find(
            s => s.session?.user_id === event.user_id
          );
          console.log('Updated session for user', event.user_id, ':', updatedSession ? {
            sessionId: updatedSession.session?.id,
            status: updatedSession.session?.status,
            breakCount: updatedSession.session?.break_records?.length,
          } : 'STILL NOT FOUND');
          
          // Check if reference changed
          console.log('Did array reference change?', currentState.managerSessions !== updatedState.managerSessions);
          console.log('Did object reference change?', existingSession !== updatedSession);
          console.groupEnd();
        }, 100);
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
