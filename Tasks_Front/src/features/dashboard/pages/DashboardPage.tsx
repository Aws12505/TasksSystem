// pages/DashboardPage.tsx
import React, { useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useAuthStore } from '../../auth/stores/authStore';
import { Loader2 } from 'lucide-react';
import EmployeeOverview from '../components/EmployeeOverview';
import UpcomingTasksList from '../components/UpcomingTasksList';
import RecentActivityList from '../components/RecentActivityList';
import ManagerOverviewCards from '../components/ManagerOverviewCards';
import TopPerformers from '../components/TopPerformers';
import TaskDistributionChart from '../components/TaskDistributionChart';
import ProjectStatusChart from '../components/ProjectStatusChart';
import HelpAndTicketsStats from '../components/HelpAndTicketsStats';
import UpcomingDeadlinesTable from '../components/UpcomingDeadlinesTable';
import PeriodSelector from '../components/PeriodSelector';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    employeeDashboard,
    managerAnalytics,
    currentPeriod,
    isLoading,
    fetchEmployeeDashboard,
    fetchManagerAnalytics,
    setPeriod,
    canViewAnalytics,
  } = useDashboard();

  useEffect(() => {
    fetchEmployeeDashboard();
    if (canViewAnalytics) {
      fetchManagerAnalytics(currentPeriod);
    }
  }, []);

  if (isLoading && !employeeDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}!
            </p>
          </div>
        </div>

        {/* Employee Dashboard Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">My Overview</h2>
          
          {employeeDashboard && (
            <>
              <EmployeeOverview data={employeeDashboard.overview} />
              
              <div className="grid gap-6 md:grid-cols-2">
                <UpcomingTasksList tasks={employeeDashboard.upcoming_tasks} />
                <RecentActivityList activities={employeeDashboard.recent_activity} />
              </div>
            </>
          )}
        </div>

        {/* Manager Analytics Section */}
        {canViewAnalytics && (
          <div className="space-y-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Team Analytics</h2>
              <PeriodSelector value={currentPeriod} onChange={setPeriod} />
            </div>

            {isLoading && !managerAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : managerAnalytics ? (
              <>
                <ManagerOverviewCards data={managerAnalytics.overview} />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <ProjectStatusChart data={managerAnalytics.project_status} />
                  <TaskDistributionChart data={managerAnalytics.task_distribution} />
                  <TopPerformers performers={managerAnalytics.top_performers} />
                </div>

                <HelpAndTicketsStats
                  helpRequests={managerAnalytics.help_requests_stats}
                  tickets={managerAnalytics.tickets_stats}
                />

                <UpcomingDeadlinesTable deadlines={managerAnalytics.upcoming_deadlines} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
