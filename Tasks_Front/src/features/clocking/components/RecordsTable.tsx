// src/features/clocking/components/RecordsTable.tsx - FULL REPLACEMENT

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { ChevronLeft, ChevronRight, Coffee, AlertCircle, Loader2, Settings2 } from 'lucide-react';
import type { ClockSession } from '../../../types/Clocking';
import { 
  calculateWorkDuration, 
  calculateTotalBreakDuration, 
  formatDuration,
  convertToCompanyTime,
  formatCompanyCalendarDate,
} from '../../../utils/clockingCalculations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Separator } from '../../../components/ui/separator';


interface Props {
  records: ClockSession[];
  companyTimezone: string;
  pagination: any | null;
  showUser?: boolean;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onCorrectionClick?: (session: ClockSession) => void;
}


export const RecordsTable = ({ 
  records, 
  companyTimezone, 
  pagination, 
  showUser = false, 
  onPageChange,
  isLoading = false,
  onCorrectionClick,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ClockSession | null>(null);


  if (!records.length && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No records found</p>
      </div>
    );
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent">
              {showUser && <TableHead className="text-foreground">Employee</TableHead>}
              <TableHead className="text-foreground">Date</TableHead>
              <TableHead className="text-foreground">Clock In</TableHead>
              <TableHead className="text-foreground">Clock Out</TableHead>
              <TableHead className="text-foreground">Work Time</TableHead>
              <TableHead className="text-foreground">Break Time</TableHead>
              <TableHead className="text-foreground">Breaks</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((session) => {
              const workSeconds = calculateWorkDuration(
                session.clock_in_utc,
                session.clock_out_utc,
                session.break_records
              );
              const breakSeconds = calculateTotalBreakDuration(session.break_records);


              return (
                <TableRow
                  key={session.id}
                  className="border-border hover:bg-accent/50 cursor-pointer"
                  onClick={() => {
                    setSelected(session);
                    setOpen(true);
                  }}
                >
                  {showUser && (
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{session.user.name}</div>
                          <div className="text-xs text-muted-foreground">{session.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {formatCompanyCalendarDate({
                          sessionDate: session.session_date,
                          companyTimezone,
                          utcFallback: session.clock_in_utc,
                          locale: 'en-US',
                        })}
                      </span>
                      {session.crosses_midnight && (
                        <AlertCircle className="w-4 h-4 text-chart-2" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {convertToCompanyTime(session.clock_in_utc, companyTimezone).split(', ')[1]}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {session.clock_out_utc 
                      ? convertToCompanyTime(session.clock_out_utc, companyTimezone).split(', ')[1]
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-chart-3 font-mono tabular-nums">
                      {formatDuration(workSeconds)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-chart-2 font-mono tabular-nums">
                      {formatDuration(breakSeconds)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{session.break_records?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      session.status === 'completed' ? 'secondary' :
                      session.status === 'active' ? 'default' : 'outline'
                    }>
                      {session.status === 'completed' ? 'Completed' :
                       session.status === 'active' ? 'Active' : 'On Break'}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-input text-xs"
                      onClick={() => onCorrectionClick?.(session)}
                    >
                      <Settings2 className="w-4 h-4 mr-1" />
                      Correct
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>


      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="border-input"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm px-4 text-foreground">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="border-input"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}


      {/* Breaks Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selected
                ? `Date: ${formatCompanyCalendarDate({
                    sessionDate: selected.session_date,
                    companyTimezone,
                    utcFallback: selected.clock_in_utc,
                    locale: 'en-US',
                  })} • ${selected.crosses_midnight ? 'Crossed midnight' : 'Same day'}`
                : ''}
            </DialogDescription>
          </DialogHeader>


          {selected?.break_records?.length ? (
            <div className="space-y-4">
              {selected.break_records.map((b, idx) => {
                const start = convertToCompanyTime(b.break_start_utc, companyTimezone).split(', ')[1];
                const end = b.break_end_utc
                  ? convertToCompanyTime(b.break_end_utc, companyTimezone).split(', ')[1]
                  : null;


                const seconds =
                  b.break_end_utc
                    ? Math.max(
                        0,
                        Math.floor(
                          (new Date(b.break_end_utc).getTime() -
                            new Date(b.break_start_utc).getTime()) / 1000
                        )
                      )
                    : 0;


                return (
                  <div key={b.id} className="rounded-md border border-border p-4 bg-accent">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Break {idx + 1}{' '}
                        {b.status === 'active' ? (
                          <span className="ml-2 inline-block rounded bg-chart-2 px-2 py-0.5 text-xs text-white">
                            Active
                          </span>
                        ) : null}
                      </div>
                      {b.status === 'completed' ? (
                        <div className="text-sm font-mono tabular-nums text-foreground">
                          {formatDuration(seconds)}
                        </div>
                      ) : null}
                    </div>


                    <Separator className="my-3 bg-border" />


                    <div className="text-sm text-muted-foreground">
                      <div>
                        <span className="text-foreground">Start:</span> {start}
                      </div>
                      <div>
                        <span className="text-foreground">End:</span> {end ?? '—'}
                      </div>
                      {b.description ? (
                        <div className="mt-2">
                          <span className="text-foreground">Notes:</span> {b.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No breaks recorded for this session.</div>
          )}


          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-input" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
