// src/features/clocking/components/RecordsTable.tsx

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
import { ChevronLeft, ChevronRight, Coffee, AlertCircle } from 'lucide-react';
import type { ClockSession } from '../../../types/Clocking';
import { 
  calculateWorkDuration, 
  calculateTotalBreakDuration, 
  formatDuration,
  convertToCompanyTime 
} from '../../../utils/clockingCalculations';

interface Props {
  records: ClockSession[];
  companyTimezone: string;
  pagination: any | null;
  showUser?: boolean;
  onPageChange?: (page: number) => void;
}

export const RecordsTable = ({ 
  records, 
  companyTimezone, 
  pagination, 
  showUser = false, 
  onPageChange 
}: Props) => {
  if (!records.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No records found</p>
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
                <TableRow key={session.id} className="border-border hover:bg-accent/50">
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
                        {new Date(session.session_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
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
    </div>
  );
};