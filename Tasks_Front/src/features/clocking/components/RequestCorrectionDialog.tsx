// src/features/clocking/components/RequestCorrectionDialog.tsx

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
import { Textarea } from '@/components/ui/textarea';
import type { ClockSession, BreakRecord } from '@/types/Clocking';
import { convertToCompanyTime, companyTimeToUTC } from '@/utils/clockingCalculations';

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

export const RequestCorrectionDialog = ({
  open,
  onOpenChange,
  type,
  session,
  breakRecord,
  companyTimezone,
  onSubmit,
  isLoading,
}: Props) => {
  const [requestedTime, setRequestedTime] = useState('');
  const [reason, setReason] = useState('');

  const getOriginalTime = (): string => {
    if (type === 'clock_in' && session?.clock_in_utc) {
      return convertToCompanyTime(session.clock_in_utc, companyTimezone);
    }
    if (type === 'clock_out' && session?.clock_out_utc) {
      return convertToCompanyTime(session.clock_out_utc, companyTimezone);
    }
    if (type === 'break_in' && breakRecord?.break_start_utc) {
      return convertToCompanyTime(breakRecord.break_start_utc, companyTimezone);
    }
    if (type === 'break_out' && breakRecord?.break_end_utc) {
      return convertToCompanyTime(breakRecord.break_end_utc, companyTimezone);
    }
    return 'Not set';
  };

  const handleSubmit = async () => {
    if (!requestedTime || !reason.trim() || reason.length < 10) return;

    const utcTime = companyTimeToUTC(requestedTime, companyTimezone);

    await onSubmit({
      clock_session_id: type.includes('clock') ? session?.id : undefined,
      break_record_id: type.includes('break') ? breakRecord?.id : undefined,
      correction_type: type,
      requested_time_utc: utcTime,
      reason: reason.trim(),
    });

    setRequestedTime('');
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Request {type.replace('_', ' ').toUpperCase()} Correction
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Original: {getOriginalTime()}
          </DialogDescription>
          <DialogDescription className="text-muted-foreground">
  Enter corrected time in {companyTimezone}
</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requested_time" className="text-foreground">
              Corrected Time ({companyTimezone})
            </Label>
            <Input
              id="requested_time"
              type="datetime-local"
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              className="bg-background border-input text-foreground"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter time in {companyTimezone}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">
              Reason (required - min 10 chars)
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need this correction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              className="bg-background border-input text-foreground"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !requestedTime || reason.length < 10}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
