// src/features/clocking/components/TodaySessionSummary.tsx

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { useLiveTimer } from '../../../hooks/useClockingTimers';
import { Calendar, AlertCircle, Coffee } from 'lucide-react';
import type { ClockSession } from '../../../types/Clocking';
import { convertToCompanyTime, calculateDuration, formatDuration } from '../../../utils/clockingCalculations';
import { ScrollArea, ScrollBar } from '../../../components/ui/scroll-area'; // 👈 add this

interface Props {
  session: ClockSession | null;
  companyTimezone: string;
}

export const TodaySessionSummary = ({ session, companyTimezone }: Props) => {
  if (!session) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5" />
            Current Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No session for today. Clock in to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5" />
            Today's Session
          </CardTitle>
          <Badge variant={session.status === 'completed' ? 'secondary' : 'default'}>
            {session.status === 'completed' ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {session.crosses_midnight && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This session crossed midnight
            </AlertDescription>
          </Alert>
        )}

        {/* Clock Times */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Clock In</p>
            <p className="font-medium text-foreground">
              {convertToCompanyTime(session.clock_in_utc, companyTimezone).split(', ')[1]}
            </p>
          </div>
          {session.clock_out_utc && (
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Clock Out</p>
              <p className="font-medium text-foreground">
                {convertToCompanyTime(session.clock_out_utc, companyTimezone).split(', ')[1]}
              </p>
            </div>
          )}
        </div>

        {/* Breaks List */}
        {session.break_records && session.break_records.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coffee className="w-4 h-4" />
              Breaks ({session.break_records.length})
            </div>

            <ScrollArea className="max-h-64">
              <div className="space-y-2 pr-2">
                {session.break_records.map((breakRecord, index) => (
                  <BreakRow
                    key={breakRecord.id}
                    breakRecord={breakRecord}
                    index={index}
                    companyTimezone={companyTimezone}
                  />
                ))}
              </div>
              {/* vertical scrollbar appears as needed */}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BreakRow = ({ 
  breakRecord, 
  index, 
  companyTimezone 
}: { 
  breakRecord: any; 
  index: number; 
  companyTimezone: string;
}) => {
  // Live timer for active breaks
  const liveTime = useLiveTimer(
    breakRecord.break_start_utc,
    breakRecord.break_end_utc,
    breakRecord.status === 'active'
  );

  // Completed break duration
  const completedDuration = breakRecord.status === 'completed' 
    ? formatDuration(calculateDuration(breakRecord.break_start_utc, breakRecord.break_end_utc))
    : null;

  return (
    <div className={`p-4 rounded-lg border-2 ${
      breakRecord.status === 'active' 
        ? 'bg-accent border-chart-2/20' 
        : 'bg-accent border-border'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              Break {index + 1}
            </Badge>
            {breakRecord.status === 'active' && (
              <Badge className="text-xs bg-chart-2 text-white">Active</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {convertToCompanyTime(breakRecord.break_start_utc, companyTimezone).split(', ')[1]}
            {breakRecord.break_end_utc && (
              <> → {convertToCompanyTime(breakRecord.break_end_utc, companyTimezone).split(', ')[1]}</>
            )}
          </p>
          {breakRecord.description && (
            <p className="text-sm text-foreground mt-2">
              {breakRecord.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground font-mono tabular-nums">
            {breakRecord.status === 'active' ? liveTime : completedDuration}
          </div>
        </div>
      </div>
    </div>
  );
};
