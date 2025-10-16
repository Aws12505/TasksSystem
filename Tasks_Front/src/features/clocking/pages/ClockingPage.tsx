// src/features/clocking/pages/ClockingPage.tsx

import { useClocking } from '../hooks/useClocking';
import { useLiveClock } from '../../../hooks/useClockingTimers';
import { ClockingCard } from '../components/ClockingCard';
import { LiveStatsDisplay } from '../components/LiveStatsDisplay';
import { TodaySessionSummary } from '../components/TodaySessionSummary';
import { Card, CardContent } from '../../../components/ui/card';
import { format, parse } from 'date-fns';
import { Clock } from 'lucide-react';
import { convertToCompanyTime } from '../../../utils/clockingCalculations';

const ClockingPage = () => {
  const { 
    session, 
    companyTimezone, 
    isLoading, 
    clockIn, 
    clockOut, 
    startBreak, 
    endBreak 
  } = useClocking();

  const utcNow = useLiveClock();

  const companyDateTimeStr = convertToCompanyTime(utcNow.toISOString(), companyTimezone ?? "UTC");

  const [mdyPart, timePart] = companyDateTimeStr.split(", ");

  const prettyDate =
  mdyPart
    ? format(parse(mdyPart, "MM/dd/yyyy", new Date()), "EEEE, MMMM d, yyyy")
    : "";


  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Time Clock</h1>
              <p className="text-muted-foreground">Track your work hours and breaks</p>
            </div>
          </div>
        </div>

        {/* Live Clock Display */}
        <Card className="bg-card border-border">
  <CardContent className="p-8">
    <div className="text-center">
      <div className="text-6xl font-bold text-foreground font-mono tabular-nums mb-2">
        {timePart ?? companyDateTimeStr} {/* fallback if split ever fails */}
      </div>
      <div className="text-xl text-muted-foreground">
        {prettyDate || mdyPart /* fallback */}
      </div>
    </div>
  </CardContent>
</Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clocking Card */}
          <div className="lg:col-span-1">
            <ClockingCard
              session={session}
              companyTimezone={companyTimezone}
              isLoading={isLoading}
              onClockIn={clockIn}
              onClockOut={clockOut}
              onStartBreak={startBreak}
              onEndBreak={endBreak}
            />
          </div>

          {/* Stats & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <LiveStatsDisplay session={session} />
            <TodaySessionSummary session={session} companyTimezone={companyTimezone} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockingPage;