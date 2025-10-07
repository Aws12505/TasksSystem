// features/dashboard/components/TaskDistributionChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import type { TaskDistribution } from '../../../types/Dashboard';

interface TaskDistributionChartProps {
  data: TaskDistribution;
}

const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({ data }) => {
  const total = Object.values(data.by_status).reduce((sum, val) => sum + val, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Task Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* By Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">By Status</h4>
            <div className="space-y-2">
              {Object.entries(data.by_status).map(([status, count]) => {
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Priority */}
          <div>
            <h4 className="text-sm font-medium mb-3">By Priority</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.by_priority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-xs capitalize">{priority}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue */}
          {data.overdue > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">
                {data.overdue} overdue task{data.overdue !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDistributionChart;
