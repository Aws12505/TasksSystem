// features/dashboard/components/EmployeeOverview.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, PlayCircle, Star, Briefcase, HelpCircle } from 'lucide-react';
import type { EmployeeOverview } from '../../../types/Dashboard';

interface EmployeeOverviewProps {
  data: EmployeeOverview;
}

const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({ data }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Tasks Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.assigned_tasks.total}</div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pending
              </span>
              <span className="font-medium">{data.assigned_tasks.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <PlayCircle className="h-3 w-3" /> In Progress
              </span>
              <span className="font-medium">{data.assigned_tasks.in_progress}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" /> Done
              </span>
              <span className="font-medium text-green-600">{data.assigned_tasks.done}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.projects.total}</div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>As Stakeholder</span>
              <span className="font-medium">{data.projects.as_stakeholder}</span>
            </div>
            <div className="flex justify-between">
              <span>As Contributor</span>
              <span className="font-medium">{data.projects.as_contributor}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Requests Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Help Requests</CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.help_requests.helped_others}</div>
          <p className="text-xs text-muted-foreground">Times helped others</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Requested Help</span>
              <span className="font-medium">{data.help_requests.requested}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-medium">{data.help_requests.pending}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Week Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.this_week.tasks_completed}</div>
          <p className="text-xs text-muted-foreground">Tasks completed</p>
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Helped Colleagues</span>
              <span className="font-medium">{data.this_week.helped_colleagues}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeOverview;
