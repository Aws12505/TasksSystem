// features/dashboard/components/UpcomingDeadlinesTable.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { UpcomingDeadline } from '../../../types/Dashboard';
import { useNavigate } from 'react-router-dom';

interface UpcomingDeadlinesTableProps {
  deadlines: UpcomingDeadline[];
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const UpcomingDeadlinesTable: React.FC<UpcomingDeadlinesTableProps> = ({ deadlines }) => {
  const navigate = useNavigate();

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No upcoming deadlines in the next 7 days
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines ({deadlines.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              onClick={() => navigate(`/projects/${deadline.project.id}`)}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{deadline.name}</h4>
                  <Badge variant="outline" className={`${priorityColors[deadline.priority]} text-white text-xs`}>
                    {deadline.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{deadline.project.name}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {deadline.assigned_users_count}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(deadline.due_date), 'MMM d')}
                </span>
                <span className={`flex items-center gap-1 font-medium ${deadline.days_until_due <= 2 ? 'text-red-600' : ''}`}>
                  <AlertCircle className="h-3 w-3" />
                  {deadline.days_until_due === 0 ? 'Today' : `${deadline.days_until_due}d`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlinesTable;
