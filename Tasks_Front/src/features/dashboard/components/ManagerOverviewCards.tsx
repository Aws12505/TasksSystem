// features/dashboard/components/ManagerOverviewCards.tsx
import React from 'react';
import StatCard from './StatCard';
import { Users, Briefcase, CheckCircle2, HelpCircle, Ticket, TrendingUp } from 'lucide-react';
import type { ManagerOverview } from '../../../types/Dashboard';

interface ManagerOverviewCardsProps {
  data: ManagerOverview;
}

const ManagerOverviewCards: React.FC<ManagerOverviewCardsProps> = ({ data }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Employees"
        value={data.total_employees}
        icon={Users}
        description="Active team members"
      />
      <StatCard
        title="Active Projects"
        value={data.active_projects}
        icon={Briefcase}
        description="In progress or pending"
      />
      <StatCard
        title="Tasks Completed"
        value={data.completed_tasks}
        icon={CheckCircle2}
        description={`Out of ${data.total_tasks} total tasks`}
      />
      <StatCard
        title="Completion Rate"
        value={`${data.average_task_completion_rate}%`}
        icon={TrendingUp}
        description="Average task completion"
      />
      <StatCard
        title="Pending Help Requests"
        value={data.pending_help_requests}
        icon={HelpCircle}
        description="Awaiting assistance"
      />
      <StatCard
        title="Open Tickets"
        value={data.open_tickets}
        icon={Ticket}
        description="Need attention"
      />
    </div>
  );
};

export default ManagerOverviewCards;
