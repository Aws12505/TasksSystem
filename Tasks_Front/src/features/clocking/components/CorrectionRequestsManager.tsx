// src/features/clocking/components/CorrectionRequestsManager.tsx - FIXED RETURN

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, AlertCircle } from 'lucide-react';
import type { ClockingCorrectionRequest } from '@/types/Clocking';
import { convertToCompanyTime } from '@/utils/clockingCalculations';

interface Props {
  corrections: ClockingCorrectionRequest[];
  companyTimezone: string;
  isLoading: boolean;
  onApprove: (correctionId: number, notes?: string) => Promise<void>;
  onReject: (correctionId: number, notes?: string) => Promise<void>;
  onDirectEdit?: (session: any) => void;
}

export const CorrectionRequestsManager = ({
  corrections,
  companyTimezone,
  isLoading,
  onApprove,
  onReject,
}: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');

  const pending = corrections.filter(c => c.status === 'pending');
  const selected = pending.find(c => c.id === selectedId);

  const handleSubmit = async () => {
    if (!selected) return;

    if (action === 'approve') {
      await onApprove(selected.id, notes.trim() || undefined);
    } else if (action === 'reject') {
      await onReject(selected.id, notes.trim() || undefined);
    }

    setSelectedId(null);
    setAction(null);
    setNotes('');
  };

  if (!pending.length) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No pending correction requests
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pending.map((correction) => (
          <Card key={correction.id} className="bg-card border-border hover:border-border/80 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={correction.user?.avatar_url || undefined}
                      alt={correction.user?.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {correction.user?.name
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {correction.user?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {correction.user?.email}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-chart-2 border-chart-2/50">
                  {correction.correction_type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-accent rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Original Time</p>
                  <p className="font-mono text-sm text-foreground">
                    {convertToCompanyTime(correction.original_time_utc, companyTimezone)}
                  </p>
                </div>
                <div className="p-3 bg-accent rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Requested Time</p>
                  <p className="font-mono text-sm text-foreground">
                    {convertToCompanyTime(correction.requested_time_utc, companyTimezone)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Reason</p>
                <p className="p-3 bg-accent rounded-lg border border-border text-sm text-foreground leading-relaxed">
                  {correction.reason}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-chart-3 border-chart-3/50 hover:bg-chart-3/10"
                  onClick={() => {
                    setSelectedId(correction.id);
                    setAction('approve');
                  }}
                  disabled={isLoading}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={() => {
                    setSelectedId(correction.id);
                    setAction('reject');
                  }}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={selectedId !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedId(null);
          setAction(null);
          setNotes('');
        }
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {action === 'approve' ? 'Approve' : 'Reject'} Correction Request
            </DialogTitle>
            <DialogDescription>
              {selected?.user?.name} • {selected?.correction_type.replace('_', ' ')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-accent rounded-lg border border-border space-y-2">
              <p className="text-sm font-medium text-foreground">Times</p>
              <p className="text-sm font-mono text-muted-foreground">
                {selected && convertToCompanyTime(selected.original_time_utc, companyTimezone)}
              </p>
              <p className="text-xs text-muted-foreground">↓</p>
              <p className="text-sm font-mono text-foreground">
                {selected && convertToCompanyTime(selected.requested_time_utc, companyTimezone)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {action === 'approve' ? 'Approval' : 'Rejection'} Notes (Optional)
              </label>
              <Textarea
                placeholder="Add optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                className="bg-background border-input text-foreground resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/500
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedId(null);
                setAction(null);
                setNotes('');
              }}
              disabled={isLoading}
              className="border-input"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={action === 'approve' ? 'bg-chart-3 hover:bg-chart-3/90' : 'bg-destructive hover:bg-destructive/90'}
            >
              {isLoading
                ? action === 'approve'
                  ? 'Approving...'
                  : 'Rejecting...'
                : action === 'approve'
                ? 'Approve Request'
                : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
    </>
  );
};
