// features/finalRatings/components/UserRatingDetail.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { FinalRatingResult } from '../../../types/FinalRating';

interface UserRatingDetailProps {
  user: FinalRatingResult;
}

const UserRatingDetail: React.FC<UserRatingDetailProps> = ({ user }) => {
  const { breakdown } = user;

  return (
    <div className="space-y-6 mt-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {breakdown.task_ratings.enabled && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Task Ratings</div>
            <div className="text-lg font-bold text-blue-600">
              +{breakdown.task_ratings.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {breakdown.task_ratings.tasks_included} tasks
            </div>
          </div>
        )}

        {breakdown.stakeholder_ratings.enabled && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Stakeholder</div>
            <div className="text-lg font-bold text-purple-600">
              +{breakdown.stakeholder_ratings.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {breakdown.stakeholder_ratings.projects_included} projects
            </div>
          </div>
        )}

        {breakdown.help_requests.helper.enabled && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Helped Others</div>
            <div className="text-lg font-bold text-green-600">
              +{breakdown.help_requests.helper.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {breakdown.help_requests.helper.count} times
            </div>
          </div>
        )}

        {breakdown.help_requests.requester.enabled && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Help Requests</div>
            <div className="text-lg font-bold text-red-600">
              {breakdown.help_requests.requester.value}
            </div>
            <div className="text-xs text-muted-foreground">penalties</div>
          </div>
        )}

        {breakdown.tickets_resolved.enabled && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Tickets</div>
            <div className="text-lg font-bold text-indigo-600">
              +{breakdown.tickets_resolved.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {breakdown.tickets_resolved.count} resolved
            </div>
          </div>
        )}
      </div>

      {/* Detailed Breakdown */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {breakdown.task_ratings.enabled && (
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          )}
          {breakdown.stakeholder_ratings.enabled && (
            <TabsTrigger value="stakeholder">Stakeholder</TabsTrigger>
          )}
          {breakdown.help_requests.helper.enabled && (
            <TabsTrigger value="help">Help</TabsTrigger>
          )}
          {breakdown.tickets_resolved.enabled && (
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          )}
        </TabsList>

        {/* Task Details */}
        {breakdown.task_ratings.enabled && (
          <TabsContent value="tasks" className="space-y-3">
            <div className="text-sm text-muted-foreground mb-2">
              Aggregation: {breakdown.task_ratings.aggregation} • 
              Weight: {breakdown.task_ratings.include_task_weight ? 'Included' : 'Excluded'} • 
              Percentage: {breakdown.task_ratings.include_user_percentage ? 'Included' : 'Excluded'}
            </div>
            {breakdown.task_ratings.details.map((task) => (
              <div key={task.task_id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{task.task_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Rating: {task.task_rating}/100
                      {task.task_weight && ` • Weight: ${task.task_weight}/100`}
                      {task.user_percentage && ` • Your %: ${task.user_percentage}%`}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    +{task.contribution}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded">
                  {task.calculation}
                </div>
              </div>
            ))}
          </TabsContent>
        )}

        {/* Stakeholder Details */}
        {breakdown.stakeholder_ratings.enabled && (
          <TabsContent value="stakeholder" className="space-y-3">
            <div className="text-sm text-muted-foreground mb-2">
              Aggregation: {breakdown.stakeholder_ratings.aggregation}
            </div>
            {breakdown.stakeholder_ratings.details.map((project) => (
              <div key={project.project_id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{project.project_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Stakeholder Rating: {project.stakeholder_rating}/100
                      {project.user_project_percentage && 
                        ` • Your Project %: ${project.user_project_percentage}%`
                      }
                    </div>
                  </div>
                  <Badge variant="outline" className="text-purple-600">
                    +{project.contribution}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded">
                  {project.calculation}
                </div>
              </div>
            ))}
          </TabsContent>
        )}

        {/* Help Requests Details */}
        {breakdown.help_requests.helper.enabled && (
          <TabsContent value="help" className="space-y-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Helped Others</div>
                <Badge variant="outline" className="text-green-600">
                  +{breakdown.help_requests.helper.value}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Completed {breakdown.help_requests.helper.count} help requests × {breakdown.help_requests.helper.points_per_help} points each
                {breakdown.help_requests.helper.capped && (
                  <div className="text-xs text-orange-600 mt-1">
                    (Capped at {breakdown.help_requests.helper.max_points} points maximum)
                  </div>
                )}
              </div>
            </div>

            {breakdown.help_requests.requester.enabled && 
             Object.keys(breakdown.help_requests.requester.breakdown).length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Requested Help</div>
                  <Badge variant="outline" className="text-red-600">
                    {breakdown.help_requests.requester.value}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {Object.entries(breakdown.help_requests.requester.breakdown).map(
                    ([type, data]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="capitalize">{type.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-muted-foreground">
                            {data.count} requests × {data.penalty_per_request} points
                          </div>
                        </div>
                        <div className="text-red-600 font-medium">{data.total}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* Tickets Details */}
        {breakdown.tickets_resolved.enabled && (
          <TabsContent value="tickets" className="space-y-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Tickets Resolved</div>
                <Badge variant="outline" className="text-indigo-600">
                  +{breakdown.tickets_resolved.value}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Resolved {breakdown.tickets_resolved.count} tickets × {breakdown.tickets_resolved.points_per_ticket} points each
                {breakdown.tickets_resolved.capped && (
                  <div className="text-xs text-orange-600 mt-1">
                    (Capped at {breakdown.tickets_resolved.max_points} points maximum)
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserRatingDetail;
