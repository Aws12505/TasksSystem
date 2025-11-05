// src/features/clocking/components/DirectEditDialog.tsx

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ClockSession, BreakRecord } from '@/types/Clocking';
import { companyTimeToUTC } from '@/utils/clockingCalculations';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'clock_in' | 'clock_out' | 'break_in' | 'break_out';
  session?: ClockSession | null;
  breakRecord?: BreakRecord | null;
  companyTimezone: string;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const DirectEditDialog = ({
  open,
  onOpenChange,
  type,
  companyTimezone,
  onSubmit,
  isLoading,
}: Props) => {
  const [time, setTime] = useState('');

  const handleSubmit = async () => {
    if (!time) return;

    const data: any = {};
    const utcTime = companyTimeToUTC(time, companyTimezone);

    if (type === 'clock_in') {
      data.clock_in_utc = utcTime;
    } else if (type === 'clock_out') {
      data.clock_out_utc = utcTime;
    } else if (type === 'break_in') {
      data.break_start_utc = utcTime;
    } else if (type === 'break_out') {
      data.break_end_utc = utcTime;
    }

    await onSubmit(data);
    setTime('');
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setTime('');
        onOpenChange(o);
      }}
    >
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Edit {type.replace('_', ' ').toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Change the time in {companyTimezone}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="time" className="text-foreground">
              New Time ({companyTimezone})
            </Label>
            <Input
              id="time"
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background border-input text-foreground"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setTime('');
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !time}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
