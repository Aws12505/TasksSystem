<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SystemAnalyticsService
{
    public function getSystemOverview(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        return [
            'general_stats' => $this->getGeneralSystemStats($startDate, $endDate),
            'activity_stats' => $this->getActivityStats($startDate, $endDate),
            'performance_stats' => $this->getPerformanceStats($startDate, $endDate),
            'quality_stats' => $this->getQualityStats($startDate, $endDate),
            'growth_stats' => $this->getGrowthStats($startDate, $endDate),
        ];
    }

    private function getGeneralSystemStats(?Carbon $startDate, ?Carbon $endDate): array
    {
        return [
            'total_users' => DB::table('users')->count(),
            'total_projects' => DB::table('projects')->count(),
            'total_tasks' => DB::table('tasks')->count(),
            'total_tickets' => DB::table('tickets')->count(),
            'total_help_requests' => DB::table('help_requests')->count(),
            'active_users' => $this->getActiveUsersInPeriod($startDate, $endDate),
            'new_users' => $this->getNewUsersInPeriod($startDate, $endDate),
        ];
    }

    private function getActivityStats(?Carbon $startDate, ?Carbon $endDate): array
    {
        return [
            'tasks_completed' => $this->getTasksCompletedInPeriod($startDate, $endDate),
            'tickets_resolved' => $this->getTicketsResolvedInPeriod($startDate, $endDate),
            'help_requests_completed' => $this->getHelpRequestsCompletedInPeriod($startDate, $endDate),
            'ratings_given' => $this->getRatingsGivenInPeriod($startDate, $endDate),
            'projects_completed' => $this->getProjectsCompletedInPeriod($startDate, $endDate),
        ];
    }

    private function getPerformanceStats(?Carbon $startDate, ?Carbon $endDate): array
    {
        return [
            'avg_task_completion_time' => $this->getAverageTaskCompletionTime($startDate, $endDate),
            'avg_ticket_resolution_time' => $this->getAverageTicketResolutionTime($startDate, $endDate),
            'avg_help_request_resolution_time' => $this->getAverageHelpRequestResolutionTime($startDate, $endDate),
            'system_efficiency_score' => $this->calculateSystemEfficiencyScore($startDate, $endDate),
        ];
    }

    private function getQualityStats(?Carbon $startDate, ?Carbon $endDate): array
    {
        return [
            'avg_task_rating' => $this->getAverageTaskRating($startDate, $endDate),
            'avg_stakeholder_rating' => $this->getAverageStakeholderRating($startDate, $endDate),
            'high_quality_tasks_percentage' => $this->getHighQualityTasksPercentage($startDate, $endDate),
            'help_request_penalty_distribution' => $this->getHelpRequestPenaltyDistribution($startDate, $endDate),
        ];
    }

    private function getGrowthStats(?Carbon $startDate, ?Carbon $endDate): array
    {
        $currentPeriod = $this->getActivityStats($startDate, $endDate);
        
        // Compare with previous period
        $periodLength = $startDate && $endDate ? $startDate->diffInDays($endDate) : 30;
        $prevStart = $startDate ? $startDate->copy()->subDays($periodLength) : now()->subDays(60);
        $prevEnd = $startDate ? $startDate->copy()->subDay() : now()->subDays(30);
        
        $previousPeriod = $this->getActivityStats($prevStart, $prevEnd);

        return [
            'tasks_growth' => $this->calculateGrowthPercentage(
                $previousPeriod['tasks_completed'], 
                $currentPeriod['tasks_completed']
            ),
            'tickets_growth' => $this->calculateGrowthPercentage(
                $previousPeriod['tickets_resolved'], 
                $currentPeriod['tickets_resolved']
            ),
            'users_growth' => $this->calculateGrowthPercentage(
                $this->getNewUsersInPeriod($prevStart, $prevEnd),
                $this->getNewUsersInPeriod($startDate, $endDate)
            ),
            'projects_growth' => $this->calculateGrowthPercentage(
                $previousPeriod['projects_completed'], 
                $currentPeriod['projects_completed']
            ),
        ];
    }

    // Helper methods for data collection
    private function getActiveUsersInPeriod(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('users as u')
            ->where(function($q) use ($startDate, $endDate) {
                // Users who rated tasks
                $q->whereExists(function($sq) use ($startDate, $endDate) {
                    $sq->select(DB::raw(1))
                       ->from('task_ratings')
                       ->whereColumn('rater_id', 'u.id');
                    if ($startDate && $endDate) {
                        $sq->whereBetween('rated_at', [$startDate, $endDate]);
                    }
                })
                // Or users who resolved tickets
                ->orWhereExists(function($sq) use ($startDate, $endDate) {
                    $sq->select(DB::raw(1))
                       ->from('tickets')
                       ->whereColumn('assigned_to', 'u.id')
                       ->where('status', 'resolved');
                    if ($startDate && $endDate) {
                        $sq->whereBetween('completed_at', [$startDate, $endDate]);
                    }
                })
                // Or users who helped with help requests
                ->orWhereExists(function($sq) use ($startDate, $endDate) {
                    $sq->select(DB::raw(1))
                       ->from('help_requests')
                       ->whereColumn('helper_id', 'u.id')
                       ->where('is_completed', true);
                    if ($startDate && $endDate) {
                        $sq->whereBetween('completed_at', [$startDate, $endDate]);
                    }
                });
            });

        return $query->distinct()->count();
    }

    private function getNewUsersInPeriod(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('users');
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getTasksCompletedInPeriod(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('tasks')->where('status', 'done');
        
        if ($startDate && $endDate) {
            $query->whereBetween('updated_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getTicketsResolvedInPeriod(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('tickets')->where('status', 'resolved');
        
        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getHelpRequestsCompletedInPeriod(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('help_requests')->where('is_completed', true);
        
        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getRatingsGivenInPeriod(?Carbon $startDate, ?Carbon $endDate): int
    {
        $taskRatingsQuery = DB::table('task_ratings');
        $stakeholderRatingsQuery = DB::table('stakeholder_ratings');
        
        if ($startDate && $endDate) {
            $taskRatingsQuery->whereBetween('rated_at', [$startDate, $endDate]);
            $stakeholderRatingsQuery->whereBetween('rated_at', [$startDate, $endDate]);
        }
        
        return $taskRatingsQuery->count() + $stakeholderRatingsQuery->count();
    }

    private function getProjectsCompletedInPeriod(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('projects')->whereIn('status', ['done', 'rated']);
        
        if ($startDate && $endDate) {
            $query->whereBetween('updated_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getAverageTaskCompletionTime(?Carbon $startDate, ?Carbon $endDate): ?float
    {
        $query = DB::table('tasks')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->where('status', 'done');

        if ($startDate && $endDate) {
            $query->whereBetween('updated_at', [$startDate, $endDate]);
        }

        return $query->value('avg_days');
    }

    private function getAverageTicketResolutionTime(?Carbon $startDate, ?Carbon $endDate): ?float
    {
        $query = DB::table('tickets')
            ->selectRaw('AVG(DATEDIFF(completed_at, created_at)) as avg_days')
            ->where('status', 'resolved')
            ->whereNotNull('completed_at');

        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return $query->value('avg_days');
    }

    private function getAverageHelpRequestResolutionTime(?Carbon $startDate, ?Carbon $endDate): ?float
    {
        $query = DB::table('help_requests')
            ->selectRaw('AVG(DATEDIFF(completed_at, created_at)) as avg_days')
            ->where('is_completed', true)
            ->whereNotNull('completed_at');

        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return $query->value('avg_days');
    }

    private function calculateSystemEfficiencyScore(?Carbon $startDate, ?Carbon $endDate): float
    {
        $tasksCompleted = $this->getTasksCompletedInPeriod($startDate, $endDate);
        $ticketsResolved = $this->getTicketsResolvedInPeriod($startDate, $endDate);
        $helpRequestsCompleted = $this->getHelpRequestsCompletedInPeriod($startDate, $endDate);
        $avgTaskTime = $this->getAverageTaskCompletionTime($startDate, $endDate) ?? 10;

        // Custom efficiency formula
        $completionScore = $tasksCompleted + ($ticketsResolved * 2) + $helpRequestsCompleted;
        $timeEfficiency = max(1, 20 - $avgTaskTime); // Better score for faster completion
        
        return $completionScore * $timeEfficiency;
    }

    private function getAverageTaskRating(?Carbon $startDate, ?Carbon $endDate): ?float
    {
        $query = DB::table('task_ratings');
        
        if ($startDate && $endDate) {
            $query->whereBetween('rated_at', [$startDate, $endDate]);
        }
        
        return $query->avg('final_rating');
    }

    private function getAverageStakeholderRating(?Carbon $startDate, ?Carbon $endDate): ?float
    {
        $query = DB::table('stakeholder_ratings');
        
        if ($startDate && $endDate) {
            $query->whereBetween('rated_at', [$startDate, $endDate]);
        }
        
        return $query->avg('final_rating');
    }

    private function getHighQualityTasksPercentage(?Carbon $startDate, ?Carbon $endDate): float
    {
        $totalRatingsQuery = DB::table('task_ratings');
        $highQualityRatingsQuery = DB::table('task_ratings')->where('final_rating', '>=', 85);

        if ($startDate && $endDate) {
            $totalRatingsQuery->whereBetween('rated_at', [$startDate, $endDate]);
            $highQualityRatingsQuery->whereBetween('rated_at', [$startDate, $endDate]);
        }

        $total = $totalRatingsQuery->count();
        $highQuality = $highQualityRatingsQuery->count();

        return $total > 0 ? ($highQuality / $total) * 100 : 0;
    }

    private function getHelpRequestPenaltyDistribution(?Carbon $startDate, ?Carbon $endDate): array
    {
        $query = DB::table('help_requests')
            ->select([
                'rating',
                DB::raw('COUNT(*) as count')
            ])
            ->whereNotNull('rating');

        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return $query->groupBy('rating')
            ->get()
            ->keyBy('rating')
            ->map(function($item) {
                return $item->count;
            })
            ->toArray();
    }

    private function calculateGrowthPercentage(?float $previous, ?float $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return (($current - $previous) / $previous) * 100;
    }
}
