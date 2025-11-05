// src/features/clocking/components/ClockingCard.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { LogIn, LogOut, Coffee, Play } from 'lucide-react';
import type { ClockSession } from '../../../types/Clocking';
import { convertToCompanyTime } from '../../../utils/clockingCalculations';

interface Props {
  session: ClockSession | null;
  companyTimezone: string;
  isLoading: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
}

export const ClockingCard = ({
  session,
  companyTimezone,
  isLoading,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
}: Props) => {
  // NEW: Confirmation states
  const [clockInOpen, setClockInOpen] = useState(false);
  const [clockOutOpen, setClockOutOpen] = useState(false);
  const [startBreakOpen, setStartBreakOpen] = useState(false);
  const [endBreakOpen, setEndBreakOpen] = useState(false);

  // NEW: Confirm and execute
  const handleClockInConfirm = () => {
    setClockInOpen(false);
    onClockIn();
  };

  const handleClockOutConfirm = () => {
    setClockOutOpen(false);
    onClockOut();
  };

  const handleStartBreakConfirm = () => {
    setStartBreakOpen(false);
    onStartBreak();
  };

  const handleEndBreakConfirm = () => {
    setEndBreakOpen(false);
    onEndBreak();
  };

  const activeBreak = session?.break_records?.find((b) => b.status === 'active');
  const isSessionActive = session && session.status !== 'completed';

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="bg-accent">
          <CardTitle className="text-foreground text-xl">Time Clock</CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Status Display */}
          {isSessionActive && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Clocked in at</p>
                  <p className="text-lg font-bold text-foreground">
                    {convertToCompanyTime(session.clock_in_utc, companyTimezone).split(', ')[1]}
                  </p>
                </div>
                <Badge
                  className={
                    session.status === 'active'
                      ? 'bg-chart-3 text-white'
                      : 'bg-chart-2 text-white'
                  }
                >
                  {session.status === 'active' ? 'Working' : 'On Break'}
                </Badge>
              </div>

              {activeBreak && (
                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Break started at</p>
                    <p className="text-lg font-bold text-chart-2">
                      {convertToCompanyTime(activeBreak.break_start_utc, companyTimezone).split(', ')[1]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isSessionActive ? (
              // NEW: Clock In with confirmation
              <Button
                onClick={() => setClockInOpen(true)}
                disabled={isLoading}
                className="w-full bg-chart-3 text-white hover:bg-chart-3/90"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            ) : (
              <>
                {session.status === 'active' ? (
                  <>
                    {/* NEW: Start Break with confirmation */}
                    <Button
                      onClick={() => setStartBreakOpen(true)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Coffee className="w-4 h-4 mr-2" />
                      Start Break
                    </Button>

                    {/* NEW: Clock Out with confirmation */}
                    <Button
                      onClick={() => setClockOutOpen(true)}
                      disabled={isLoading}
                      className="w-full bg-destructive text-white hover:bg-destructive/90"
                      size="lg"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Clock Out
                    </Button>
                  </>
                ) : (
                  // NEW: End Break with confirmation
                  <Button
                    onClick={() => setEndBreakOpen(true)}
                    disabled={isLoading}
                    className="w-full bg-chart-2 text-white hover:bg-chart-2/90"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    End Break
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NEW: Clock In Confirmation */}
      <AlertDialog open={clockInOpen} onOpenChange={setClockInOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clock In</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clock in now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClockInConfirm}>
              Clock In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NEW: Clock Out Confirmation */}
      <AlertDialog open={clockOutOpen} onOpenChange={setClockOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clock Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clock out now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClockOutConfirm}>
              Clock Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NEW: Start Break Confirmation */}
      <AlertDialog open={startBreakOpen} onOpenChange={setStartBreakOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Break</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start your break now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartBreakConfirm}>
              Start Break
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NEW: End Break Confirmation */}
      <AlertDialog open={endBreakOpen} onOpenChange={setEndBreakOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Break</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your break now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndBreakConfirm}>
              End Break
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
