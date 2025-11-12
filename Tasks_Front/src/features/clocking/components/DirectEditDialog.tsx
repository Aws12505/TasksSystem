import { useMemo, useState } from 'react';
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
import type { ClockSession, BreakRecord } from '@/types/Clocking';
import { convertToCompanyTime, companyTimeToUTC } from '@/utils/clockingCalculations';
import { CalendarWithInputAndTime } from '../../../components/ui/calendar-with-input-and-time'

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
  session,
  breakRecord,
  companyTimezone,
  onSubmit,
  isLoading,
}: Props) => {
  const [time, setTime] = useState('');

  const currentTimeLabel = useMemo(() => {
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
  }, [type, session, breakRecord, companyTimezone]);

  const handleSubmit = async () => {
    if (!time) return;

    const data: any = {};
    const utcTime = companyTimeToUTC(time, companyTimezone);

    if (type === 'clock_in') data.clock_in_utc = utcTime;
    else if (type === 'clock_out') data.clock_out_utc = utcTime;
    else if (type === 'break_in') data.break_start_utc = utcTime;
    else if (type === 'break_out') data.break_end_utc = utcTime;

    await onSubmit(data);
    setTime('');
    onOpenChange(false);
  };
const datePart = time ? time.split('T')[0] : ''
const timePart = time ? (time.split('T')[1] || '') : ''

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
            Current: {currentTimeLabel}
          </DialogDescription>
          <DialogDescription className="text-muted-foreground">
            Enter new time in {companyTimezone}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
  <Label htmlFor="time" className="text-foreground">
    New Time ({companyTimezone})
  </Label>
  <CalendarWithInputAndTime
    id="time"
    name="time"
    /* date part (YYYY-MM-DD) controlled from existing `time` */
    value={datePart}
    onChange={(v) => {
      // keep a single combined string in `time` state
      if (!v) return setTime('')
      setTime(timePart ? `${v}T${timePart}` : `${v}T00:00`)
    }}

    /* time part (HH:mm or HH:mm:ss) controlled from existing `time` */
    timeId="time_clock"
    timeName="time_clock"
    timeValue={timePart}
    onTimeChange={(v) => {
      if (!v) return setTime(datePart ? `${datePart}T00:00` : '')
      setTime(datePart ? `${datePart}T${v}` : '')
    }}

    /* pass-through flags so UX matches original */
    required
    disabled={isLoading}
    dateLabel="Date"
    timeLabel="Time"
    className="border-input text-foreground"
    timeClassName="border-input text-foreground"
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
            className="border-input"
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
