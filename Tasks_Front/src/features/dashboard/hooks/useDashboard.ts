// features/dashboard/hooks/useDashboard.ts
import { useDashboardStore } from '../stores/dashboardStore';
import { usePermissions } from '../../../hooks/usePermissions';

export const useDashboard = () => {
  const {
    employeeDashboard,
    managerAnalytics,
    currentPeriod,
    isLoading,
    error,
    fetchEmployeeDashboard,
    fetchManagerAnalytics,
    setPeriod,
    clearError,
  } = useDashboardStore();

  const { hasPermission } = usePermissions();
  const canViewAnalytics = hasPermission('view analytics');

  return {
    employeeDashboard,
    managerAnalytics,
    currentPeriod,
    isLoading,
    error,
    fetchEmployeeDashboard,
    fetchManagerAnalytics,
    setPeriod,
    clearError,
    canViewAnalytics,
  };
};
