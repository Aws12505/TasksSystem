// src/features/clocking/components/ManagerDashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { useWorkTimer, useBreakTimer } from '../../../hooks/useClockingTimers';
import { Users, Clock, Coffee, Activity } from 'lucide-react';
import type { SessionResponse } from '../../../types/Clocking';
import { convertToCompanyTime } from '../../../utils/clockingCalculations';
import { useRef, useEffect } from 'react';

interface Props {
  sessions: SessionResponse[];
  companyTimezone: string;
}

export const ManagerDashboard = ({ sessions, companyTimezone }: Props) => {
    const renderCount = useRef(0);
  const prevSessionsRef = useRef(sessions);
  
  useEffect(() => {
    renderCount.current += 1;
    
    console.group(`🟤 [LEVEL 4] ManagerDashboard Render #${renderCount.current}`);
    console.log('Sessions prop:', sessions.length);
    console.log('Sessions data:', sessions.map(s => ({
      userId: s.session?.user_id,
      sessionId: s.session?.id,
      status: s.session?.status,
      breakCount: s.session?.break_records?.length,
    })));
    
    // Check if reference changed
    console.log('Sessions reference changed?', prevSessionsRef.current !== sessions);
    
    // Check if content changed
    if (prevSessionsRef.current !== sessions) {
      console.log('🔍 Comparing old vs new:');
      sessions.forEach((newSession, index) => {
        const oldSession = prevSessionsRef.current[index];
        if (oldSession && newSession !== oldSession) {
          console.log(`Session ${index} changed:`, {
            old: {
              userId: oldSession.session?.user_id,
              status: oldSession.session?.status,
              breakCount: oldSession.session?.break_records?.length,
            },
            new: {
              userId: newSession.session?.user_id,
              status: newSession.session?.status,
              breakCount: newSession.session?.break_records?.length,
            }
          });
        }
      });
    }
    
    prevSessionsRef.current = sessions;
    console.groupEnd();
  });

  const activeSessions = sessions.filter(s => s.session !== null);

  console.log('🔵 [LEVEL 4] Rendering', activeSessions.length, 'active sessions');


  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-accent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-xl">
            <Users className="w-6 h-6" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-chart-3" />
            </span>
            <span className="text-sm text-muted-foreground">Live Updates</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {!activeSessions.length ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSessions.map((sessionData) => (
              <ActiveSessionRow
                key={sessionData.session!.id}
                sessionData={sessionData}
                companyTimezone={companyTimezone}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ActiveSessionRow = ({ 
  sessionData, 
  companyTimezone 
}: { 
  sessionData: SessionResponse; 
  companyTimezone: string;
}) => {
  const session = sessionData.session!;

  // Work timer
  const workTime = useWorkTimer(
    session.clock_in_utc,
    session.clock_out_utc,
    session.break_records,
    session.status
  );

  // Break timer
  const breakTime = useBreakTimer(
    session.break_records,
    session.status
  );

  const user = session.user;
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // FIXED: Safe time formatting with fallback
  const formatClockInTime = () => {
    try {
      if (!session.clock_in_utc || !companyTimezone) return '—';
      const fullTime = convertToCompanyTime(session.clock_in_utc, companyTimezone);
      const parts = fullTime.split(', ');
      return parts.length > 1 ? parts[1] : fullTime;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '—';
    }
  };

  return (
    <div className={`p-5 rounded-lg border-2 transition-all ${
      session.status === 'active' 
        ? 'bg-accent border-chart-3/20' 
        : 'bg-accent border-chart-2/20'
    }`}>
      {/* Header Row - User Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-background">
            <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-lg text-foreground">
              {user.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              Clocked in at {formatClockInTime()}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge className={`h-10 px-6 text-sm font-semibold ${
          session.status === 'active' 
            ? 'bg-chart-3 text-white hover:bg-chart-3/90' 
            : 'bg-chart-2 text-white hover:bg-chart-2/90'
        }`}>
          <Activity className="w-4 h-4 mr-2" />
          {session.status === 'active' ? 'Working' : 'On Break'}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Work Time */}
        <div className="p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-chart-3" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Work
            </span>
          </div>
          <div className="text-2xl font-bold text-chart-3 font-mono tabular-nums">
            {workTime}
          </div>
          {session.status === 'active' && (
            <div className="flex items-center gap-1 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-3" />
              </span>
              <span className="text-xs text-chart-3 font-medium">
                Running
              </span>
            </div>
          )}
        </div>

        {/* Total Break Time */}
        <div className="p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Coffee className="w-4 h-4 text-chart-2" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Break
            </span>
          </div>
          <div className="text-2xl font-bold text-chart-2 font-mono tabular-nums">
            {breakTime}
          </div>
          {session.status === 'on_break' && (
            <div className="flex items-center gap-1 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2" />
              </span>
              <span className="text-xs text-chart-2 font-medium">
                On Break
              </span>
            </div>
          )}
        </div>

        {/* Break Count */}
        <div className="p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Coffee className="w-4 h-4 text-chart-5" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Breaks
            </span>
          </div>
          <div className="text-2xl font-bold text-chart-5">
            {session.break_records?.length || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {session.break_records?.length === 1 ? 'break' : 'breaks'} today
          </p>
        </div>
      </div>
    </div>
  );
};