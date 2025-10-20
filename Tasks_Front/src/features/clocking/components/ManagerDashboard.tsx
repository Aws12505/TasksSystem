// src/features/clocking/components/ManagerDashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { useWorkTimer, useBreakTimer } from '../../../hooks/useClockingTimers';
import { Users, Clock, Coffee, Activity } from 'lucide-react';
import type { SessionResponse } from '../../../types/Clocking';
import { convertToCompanyTime } from '../../../utils/clockingCalculations';

type DashboardLayout = 'list' | 'grid';

interface Props {
  sessions: SessionResponse[];
  companyTimezone: string;
  // NEW
  layout?: DashboardLayout;
}

export const ManagerDashboard = ({ sessions, companyTimezone, layout = 'list' }: Props) => {
  const activeSessions = sessions.filter(s => s.session !== null);

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
        ) : layout === 'list' ? (
          // ORIGINAL LIST VIEW (unchanged)
          <div className="space-y-4">
            {activeSessions.map((sessionData) => (
              <ActiveSessionRow
                key={sessionData.session!.id}
                sessionData={sessionData}
                companyTimezone={companyTimezone}
              />
            ))}
          </div>
        ) : (
          // NEW: COMPACT GRID VIEW
          <div
            className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {activeSessions.map((sessionData) => (
              <CompactSessionCard
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

const formatClockInTime = (clockInUtc?: string | null, companyTimezone?: string) => {
  try {
    if (!clockInUtc || !companyTimezone) return '—';
    const fullTime = convertToCompanyTime(clockInUtc, companyTimezone);
    const parts = fullTime.split(', ');
    return parts.length > 1 ? parts[1] : fullTime;
  } catch {
    return '—';
  }
};

const ActiveSessionRow = ({ 
  sessionData, 
  companyTimezone 
}: { 
  sessionData: SessionResponse; 
  companyTimezone: string;
}) => {
  const session = sessionData.session!;



  const user = session.user;
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`p-5 rounded-lg border-2 transition-all ${
      session.status === 'active' 
        ? 'bg-accent border-chart-3/20' 
        : 'bg-accent border-chart-2/20'
    }`}>
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
              Clocked in at {formatClockInTime(session.clock_in_utc, companyTimezone)}
            </p>
          </div>
        </div>

        <Badge className={`h-10 px-6 text-sm font-semibold ${
          session.status === 'active' 
            ? 'bg-chart-3 text-white hover:bg-chart-3/90' 
            : 'bg-chart-2 text-white hover:bg-chart-2/90'
        }`}>
          <Activity className="w-4 h-4 mr-2" />
          {session.status === 'active' ? 'Working' : 'On Break'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricTile
          icon={<Clock className="w-4 h-4 text-chart-3" />}
          label="Total Work"
          value={useWorkTimer(
            session.clock_in_utc,
            session.clock_out_utc,
            session.break_records,
            session.status
          )}
          highlight="chart-3"
          running={session.status === 'active'}
        />
        <MetricTile
          icon={<Coffee className="w-4 h-4 text-chart-2" />}
          label="Total Break"
          value={useBreakTimer(session.break_records, session.status)}
          highlight="chart-2"
          running={session.status === 'on_break'}
          runningLabel="On Break"
        />
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

// Small presentational helper used in both variants
const MetricTile = ({
  icon,
  label,
  value,
  highlight,
  running,
  runningLabel = 'Running',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight: 'chart-2' | 'chart-3' | 'chart-5';
  running?: boolean;
  runningLabel?: string;
}) => (
  <div className="p-4 bg-background rounded-lg border border-border">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className={`text-2xl font-bold font-mono tabular-nums text-${highlight}`}>
      {value}
    </div>
    {running && (
      <div className="flex items-center gap-1 mt-2">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${highlight} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 bg-${highlight}`} />
        </span>
        <span className={`text-xs font-medium text-${highlight}`}>
          {runningLabel}
        </span>
      </div>
    )}
  </div>
);

// NEW: Compact card used in grid
const CompactSessionCard = ({
  sessionData,
  companyTimezone,
}: {
  sessionData: SessionResponse;
  companyTimezone: string;
}) => {
  const session = sessionData.session!;
  const user = session.user;

  const workTime = useWorkTimer(
    session.clock_in_utc,
    session.clock_out_utc,
    session.break_records,
    session.status
  );
  const breakTime = useBreakTimer(session.break_records, session.status);

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isActive = session.status === 'active';
  const isBreak = session.status === 'on_break';

  return (
    <div
      className={`rounded-lg border-2 transition-all p-4
        ${isActive ? 'bg-accent border-chart-3/20' : isBreak ? 'bg-accent border-chart-2/20' : 'bg-accent'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-background">
            <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-foreground leading-tight">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              In at {formatClockInTime(session.clock_in_utc, companyTimezone)}
            </div>
          </div>
        </div>

        <Badge
          className={`h-7 px-3 text-xs font-semibold
            ${isActive ? 'bg-chart-3 text-white hover:bg-chart-3/90' : 'bg-chart-2 text-white hover:bg-chart-2/90'}
          `}
        >
          <Activity className="w-3 h-3 mr-1" />
          {isActive ? 'Working' : 'On Break'}
        </Badge>
      </div>

      {/* condensed metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="p-2.5 bg-background rounded-md border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-chart-3" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Work
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-chart-3 leading-none">{workTime}</div>
        </div>

        <div className="p-2.5 bg-background rounded-md border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Coffee className="w-3.5 h-3.5 text-chart-2" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Break
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-chart-2 leading-none">{breakTime}</div>
        </div>

        <div className="p-2.5 bg-background rounded-md border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Coffee className="w-3.5 h-3.5 text-chart-5" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Breaks
            </span>
          </div>
          <div className="text-lg font-bold text-chart-5 leading-none">
            {session.break_records?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
