// src/features/clocking/components/LiveStatsDisplay.tsx

import { Card, CardContent } from '../../../components/ui/card';
import { useWorkTimer, useBreakTimer } from '../../../hooks/useClockingTimers';
import { Clock, Coffee, Hash } from 'lucide-react';
import type { ClockSession } from '../../../types/Clocking';

interface Props {
  session: ClockSession | null;
}

export const LiveStatsDisplay = ({ session }: Props) => {
  // Work timer - pauses during break
  const workTime = useWorkTimer(
    session?.clock_in_utc || null,
    session?.clock_out_utc || null,
    session?.break_records || [],
    session?.status || null
  );

  // Break timer - only runs during break
  const breakTime = useBreakTimer(
    session?.break_records || [],
    session?.status || null
  );

  const stats = [
    {
      label: 'Work Time',
      value: workTime,
      icon: Clock,
      color: 'text-chart-3',
      bgColor: 'bg-accent',
      isActive: session?.status === 'active',
    },
    {
      label: 'Break Time',
      value: breakTime,
      icon: Coffee,
      color: 'text-chart-2',
      bgColor: 'bg-accent',
      isActive: session?.status === 'on_break',
    },
    {
      label: 'Breaks Today',
      value: session?.break_records?.length || 0,
      icon: Hash,
      color: 'text-chart-5',
      bgColor: 'bg-accent',
      isActive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`bg-card border-border ${stat.isActive ? 'ring-2 ring-ring' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground font-mono tabular-nums">
                {stat.value}
              </div>
              {stat.isActive && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ring opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-ring" />
                  </span>
                  <span className="text-xs text-ring font-medium">
                    Running
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};