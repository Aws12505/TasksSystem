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

  const hasBreaks = !!session.break_records?.length;

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
            onClick={() => { onSelect('clock_in'); onOpenChange(false); }}
            disabled={isLoading}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-input hover:bg-accent"
          >
            <span className="text-sm font-semibold text-foreground">Clock In</span>
            <span className="text-xs text-muted-foreground">Edit start time</span>
          </Button>

          <Button
            onClick={() => { onSelect('clock_out'); onOpenChange(false); }}
            disabled={!session.clock_out_utc || isLoading}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-input hover:bg-accent"
          >
            <span className="text-sm font-semibold text-foreground">Clock Out</span>
            <span className="text-xs text-muted-foreground">Edit end time</span>
          </Button>
        </div>

        {hasBreaks && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Breaks</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {session.break_records.map((b, idx) => {
                const label = `Break ${idx + 1}`;
                return (
                  <div key={b.id} className="flex gap-2">
                    <Button
                      onClick={() => { onSelect('break_in', b.id); onOpenChange(false); }}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 h-12 justify-between border-input hover:bg-accent"
                      title={`${label} start`}
                    >
                      {label}: Start
                    </Button>
                    <Button
                      onClick={() => { onSelect('break_out', b.id); onOpenChange(false); }}
                      disabled={!b.break_end_utc || isLoading}
                      variant="outline"
                      className="flex-1 h-12 justify-between border-input hover:bg-accent"
                      title={`${label} end`}
                    >
                      {label}: End
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter className="pt-2">
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
