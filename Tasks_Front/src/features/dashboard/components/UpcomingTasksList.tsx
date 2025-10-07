// features/dashboard/components/UpcomingTasksList.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { UpcomingTask } from '../../../types/Dashboard';
import { useNavigate } from 'react-router-dom';

interface UpcomingTasksListProps {
  tasks: UpcomingTask[];
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({ tasks }) => {
  const navigate = useNavigate();

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No upcoming tasks in the next 7 days
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
          Upcoming Tasks ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/projects/${task.project.id}`)}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{task.name}</h4>
                  <Badge variant="outline" className={`${priorityColors[task.priority]} text-white text-xs`}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{task.project.name}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </span>
                  <span className={`flex items-center gap-1 ${task.days_until_due <= 2 ? 'text-red-600 font-medium' : ''}`}>
                    <AlertCircle className="h-3 w-3" />
                    {task.days_until_due === 0 ? 'Due today' : `${task.days_until_due} days left`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksList;
