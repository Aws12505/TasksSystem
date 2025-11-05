// src/features/clocking/components/CorrectionTypeSelector.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ClockSession } from '@/types/Clocking';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ClockSession | null;
  onSelect: (type: 'clock_in' | 'clock_out' | 'break_in' | 'break_out', breakId?: number) => void;
  isLoading: boolean;
}

export const CorrectionTypeSelector = ({
  open,
  onOpenChange,
  session,
  onSelect,
  isLoading,
}: Props) => {
  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">What do you want to correct?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select the type of correction needed for this record
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          <Button
            onClick={() => {
              onSelect('clock_in');
              onOpenChange(false);
            }}
            disabled={isLoading}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-input hover:bg-accent"
          >
            <span className="text-sm font-semibold text-foreground">Clock In</span>
            <span className="text-xs text-muted-foreground">Edit start time</span>
          </Button>

          <Button
            onClick={() => {
              onSelect('clock_out');
              onOpenChange(false);
            }}
            disabled={!session.clock_out_utc || isLoading}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-input hover:bg-accent"
          >
            <span className="text-sm font-semibold text-foreground">Clock Out</span>
            <span className="text-xs text-muted-foreground">Edit end time</span>
          </Button>

          {session.break_records && session.break_records.length > 0 && (
            <>
              <Button
                onClick={() => {
                  onSelect('break_in', session.break_records[0]?.id);
                  onOpenChange(false);
                }}
                disabled={isLoading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center border-input hover:bg-accent"
              >
                <span className="text-sm font-semibold text-foreground">Break Start</span>
                <span className="text-xs text-muted-foreground">Edit break in</span>
              </Button>

              <Button
                onClick={() => {
                  onSelect('break_out', session.break_records[0]?.id);
                  onOpenChange(false);
                }}
                disabled={!session.break_records[0]?.break_end_utc || isLoading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center border-input hover:bg-accent"
              >
                <span className="text-sm font-semibold text-foreground">Break End</span>
                <span className="text-xs text-muted-foreground">Edit break out</span>
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-input"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
