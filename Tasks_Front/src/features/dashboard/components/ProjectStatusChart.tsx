// features/dashboard/components/ProjectStatusChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import type { ProjectStatusStats } from '../../../types/Dashboard';

interface ProjectStatusChartProps {
  data: ProjectStatusStats;
}

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ data }) => {
  const total = Object.values(data.by_status).reduce((sum, val) => sum + val, 0);

  const statusColors = {
    pending: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    done: 'bg-green-500',
    rated: 'bg-purple-500',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Project Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status breakdown */}
          <div className="space-y-2">
            {Object.entries(data.by_status).map(([status, count]) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${statusColors[status as keyof typeof statusColors]}`} />
                      {status.replace('_', ' ')}
                    </span>
                    <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status as keyof typeof statusColors]} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Average progress */}
          <div className="p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Average Progress</span>
              <span className="text-lg font-bold">{data.average_progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                style={{ width: `${data.average_progress}%` }}
              />
            </div>
          </div>

          {/* At risk projects */}
          {data.at_risk > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ {data.at_risk} project{data.at_risk !== 1 ? 's' : ''} at risk
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Less than 50% complete
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectStatusChart;
