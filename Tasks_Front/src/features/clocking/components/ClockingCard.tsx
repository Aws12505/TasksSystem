// src/features/clocking/components/ClockingCard.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
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
  onEndBreak: (description?: string) => void;
}

export const ClockingCard = ({
  session,
  companyTimezone,
  isLoading,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak
}: Props) => {
  const [endBreakOpen, setEndBreakOpen] = useState(false);
  const [description, setDescription] = useState('');

  const handleEndBreak = () => {
    onEndBreak(description.trim() || undefined);
    setDescription('');
    setEndBreakOpen(false);
  };

  const activeBreak = session?.break_records?.find(b => b.status === 'active');
  
  // Treat completed sessions as no session
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
                <Badge className={
                  session.status === 'active' 
                    ? 'bg-chart-3 text-white' 
                    : 'bg-chart-2 text-white'
                }>
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
              // No active session or completed session - show Clock In button
              <Button
                onClick={onClockIn}
                disabled={isLoading}
                className="w-full h-16 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <LogIn className="w-6 h-6 mr-2" />
                Clock In
              </Button>
            ) : session.status === 'active' ? (
              // Active session - show Start Break and Clock Out
              <div className="space-y-2">
                <Button
                  onClick={onStartBreak}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 border-chart-2 text-chart-2 hover:bg-accent"
                >
                  <Coffee className="w-5 h-5 mr-2" />
                  Start Break
                </Button>
                <Button
                  onClick={onClockOut}
                  disabled={isLoading}
                  className="w-full h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Clock Out
                </Button>
              </div>
            ) : (
              // On break - show End Break options
              <div className="space-y-2">
                <Button
                  onClick={() => setEndBreakOpen(true)}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="w-5 h-5 mr-2" />
                  End Break & Resume Work
                </Button>
                <Button
                  onClick={onClockOut}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  End Break & Clock Out
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* End Break Dialog */}
      <Dialog open={endBreakOpen} onOpenChange={setEndBreakOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">End Break</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add an optional description for this break
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="description" className="text-foreground">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Lunch break, Coffee break..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={255}
              disabled={isLoading}
              className="mt-2 bg-background border-input text-foreground"
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDescription('');
                setEndBreakOpen(false);
              }}
              disabled={isLoading}
              className="border-input"
            >
              Cancel
            </Button>
            <Button onClick={handleEndBreak} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? 'Ending...' : 'End Break'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
