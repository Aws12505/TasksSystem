// src/features/clocking/components/PendingCorrectionsPanel.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import type { ClockingCorrectionRequest } from '@/types/Clocking';
import { convertToCompanyTime } from '@/utils/clockingCalculations';

interface Props {
  corrections: ClockingCorrectionRequest[];
  isLoading: boolean;
  onRefresh: () => void;
  companyTimezone: string;
}

export const PendingCorrectionsPanel = ({
  corrections,
  companyTimezone,
}: Props) => {
  const pending = corrections.filter(c => c.status === 'pending');

  if (!pending.length) return null;

  return (
    <Card className="bg-card border-chart-2/50">
      <CardHeader className="bg-accent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertCircle className="w-5 h-5 text-chart-2" />
            Pending Corrections ({pending.length})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-3">
        {pending.map((correction) => (
          <div
            key={correction.id}
            className="p-4 rounded-lg border border-chart-2/30 bg-accent space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-chart-2" />
                <span className="font-medium text-foreground capitalize">
                  {correction.correction_type.replace('_', ' ')}
                </span>
              </div>
              <Badge variant="outline" className="text-chart-2">
                Pending
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <span className="text-foreground">Original:</span> {convertToCompanyTime(correction.original_time_utc, companyTimezone)}
              </div>
              <div>
                <span className="text-foreground">Requested:</span> {convertToCompanyTime(correction.requested_time_utc, companyTimezone)}
              </div>
              <div className="mt-2 p-3 bg-background rounded border border-border">
                <p className="text-foreground text-xs">{correction.reason}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Submitted {new Date(correction.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
