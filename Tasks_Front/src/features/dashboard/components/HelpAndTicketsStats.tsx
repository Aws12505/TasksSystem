// features/dashboard/components/HelpAndTicketsStats.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HelpCircle, Ticket } from 'lucide-react';
import type { HelpRequestsAnalytics, TicketsAnalytics } from '../../../types/Dashboard';

interface HelpAndTicketsStatsProps {
  helpRequests: HelpRequestsAnalytics;
  tickets: TicketsAnalytics;
}

const HelpAndTicketsStats: React.FC<HelpAndTicketsStatsProps> = ({ helpRequests, tickets }) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Help Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold">{helpRequests.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">{helpRequests.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{helpRequests.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>


            {helpRequests.top_helpers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Top Helpers</h4>
                <div className="space-y-2">
                  {helpRequests.top_helpers.map((helper) => (
                    <div key={helper.user_id} className="flex items-center gap-2 p-2 border rounded">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={helper.avatar_url || undefined} alt={helper.user_name} />
                        <AvatarFallback className="text-xs">{getInitials(helper.user_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{helper.user_name}</p>
                        <p className="text-xs text-muted-foreground">{helper.help_count} helps</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold">{tickets.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-red-600">{tickets.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{tickets.in_progress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ {tickets.resolved} Resolved
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">By Type</h4>
              <div className="space-y-2">
                {Object.entries(tickets.by_type).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-xs capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpAndTicketsStats;
