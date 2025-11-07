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
import { 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  AlertCircle, 
  Loader2, 
  Settings2,
  Clock,
  Play,
  Square,
  Calendar,
  User
} from 'lucide-react';
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
import { Card, CardContent } from '../../../components/ui/card';


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


      {/* Enhanced Breaks Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] max-w-4xl p-0 overflow-hidden">
          {/* Sticky header with gradient background */}
          <DialogHeader className="sticky top-0 z-20 bg-gradient-to-r from-card to-accent/30 border-b border-border px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-5 h-5 text-chart-1" />
                  Session Details
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  {selected && (
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatCompanyCalendarDate({
                          sessionDate: selected.session_date,
                          companyTimezone,
                          utcFallback: selected.clock_in_utc,
                          locale: 'en-US',
                        })}
                      </span>
                      {selected.crosses_midnight && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Crossed midnight
                        </Badge>
                      )}
                      {showUser && selected.user && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {selected.user.name}
                        </span>
                      )}
                    </div>
                  )}
                </DialogDescription>
              </div>
              <Badge 
                variant={
                  selected?.status === 'completed' ? 'secondary' :
                  selected?.status === 'active' ? 'default' : 'outline'
                }
                className="text-sm px-3 py-1"
              >
                {selected?.status === 'completed' ? 'Completed' :
                 selected?.status === 'active' ? 'Active' : 'On Break'}
              </Badge>
            </div>
          </DialogHeader>

          {/* Scrollable content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6">
            {/* Session Overview Cards */}
            {selected && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-accent/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Play className="w-4 h-4 text-chart-1" />
                      Clock In
                    </div>
                    <div className="font-medium text-sm">
                      {convertToCompanyTime(selected.clock_in_utc, companyTimezone)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Square className="w-4 h-4 text-chart-2" />
                      Clock Out
                    </div>
                    <div className="font-medium text-sm">
                      {selected.clock_out_utc
                        ? convertToCompanyTime(selected.clock_out_utc, companyTimezone)
                        : '—'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="w-4 h-4 text-chart-3" />
                      Work Time
                    </div>
                    <div className="font-mono tabular-nums font-medium text-chart-3">
                      {formatDuration(
                        calculateWorkDuration(
                          selected.clock_in_utc,
                          selected.clock_out_utc,
                          selected.break_records
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Coffee className="w-4 h-4 text-chart-2" />
                      Break Time
                    </div>
                    <div className="font-mono tabular-nums font-medium text-chart-2">
                      {formatDuration(calculateTotalBreakDuration(selected.break_records))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Breaks Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-chart-2" />
                  Breaks
                  <Badge variant="secondary" className="ml-2">
                    {selected?.break_records?.length || 0}
                  </Badge>
                </h3>
                <div className="text-sm text-muted-foreground">
                  Total: {formatDuration(calculateTotalBreakDuration(selected?.break_records || []))}
                </div>
              </div>

              {selected?.break_records?.length ? (
                <div className="space-y-3">
                  {selected.break_records.map((b, idx) => {
                    const start = convertToCompanyTime(b.break_start_utc, companyTimezone).split(', ')[1];
                    const end = b.break_end_utc
                      ? convertToCompanyTime(b.break_end_utc, companyTimezone).split(', ')[1]
                      : null;

                    const seconds = b.break_end_utc
                      ? Math.max(
                          0,
                          Math.floor(
                            (new Date(b.break_end_utc).getTime() -
                              new Date(b.break_start_utc).getTime()) / 1000
                          )
                        )
                      : 0;

                    const isActive = b.status === 'active';

                    return (
                      <Card 
                        key={b.id} 
                        className={`border-l-4 ${
                          isActive 
                            ? 'border-l-chart-2 bg-chart-2/5' 
                            : 'border-l-chart-1 bg-accent'
                        } transition-all duration-200 hover:shadow-md`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                isActive ? 'bg-chart-2 animate-pulse' : 'bg-chart-1'
                              }`} />
                              <div className="font-medium">
                                Break {idx + 1}
                              </div>
                              {isActive && (
                                <Badge variant="default" className="bg-chart-2 text-white">
                                  Active
                                </Badge>
                              )}
                            </div>
                            {!isActive && (
                              <div className="font-mono tabular-nums font-semibold text-chart-1">
                                {formatDuration(seconds)}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-chart-1" />
                                <span className="text-muted-foreground">Start:</span>
                                <span className="font-medium">{start}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Square className="w-4 h-4 text-chart-2" />
                                <span className="text-muted-foreground">End:</span>
                                <span className="font-medium">{end ?? '—'}</span>
                              </div>
                            </div>
                            
                            {b.description && (
                              <div className="md:col-span-2">
                                <Separator className="my-2" />
                                <div className="flex gap-2">
                                  <span className="text-muted-foreground min-w-12">Notes:</span>
                                  <span className="text-foreground bg-accent px-3 py-2 rounded-md border border-border flex-1">
                                    {b.description}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-border bg-accent/50">
                  <CardContent className="p-8 text-center">
                    <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No breaks recorded for this session</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All breaks will appear here when taken
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sticky footer */}
          <DialogFooter className="sticky bottom-0 z-20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70 border-t border-border px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                Timezone: {companyTimezone}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-input"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                {onCorrectionClick && selected && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      setOpen(false);
                      onCorrectionClick(selected);
                    }}
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Correct Session
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};