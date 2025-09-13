<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AnalyticsService
{
    public function __construct(
        public UserAnalyticsService $userAnalytics,
        public ProjectAnalyticsService $projectAnalytics,
        public SystemAnalyticsService $systemAnalytics
    ) {}

    public function getDashboardSummary(?int $userId = null, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $cacheKey = "dashboard_summary_{$userId}_" . ($startDate?->format('Y-m-d') ?? 'all') . "_" . ($endDate?->format('Y-m-d') ?? 'all');
        
        return Cache::remember($cacheKey, 300, function() use ($userId, $startDate, $endDate) {
            return [
                'user_metrics' => $userId ? $this->userAnalytics->getUserPerformanceOverview($userId, $startDate, $endDate) : null,
                'system_metrics' => $this->systemAnalytics->getSystemOverview($startDate, $endDate),
                'top_performers' => $this->userAnalytics->getTopPerformers($startDate, $endDate, 5),
                'project_health' => $this->projectAnalytics->getProjectHealthSummary($startDate, $endDate),
                'recent_activities' => $this->getRecentActivities($startDate, $endDate, 10),
                'trends' => $this->getTrendData($startDate, $endDate),
            ];
        });
    }

    public function getComprehensiveReport(array $filters = []): array
    {
        $startDate = isset($filters['start_date']) ? Carbon::parse($filters['start_date']) : null;
        $endDate = isset($filters['end_date']) ? Carbon::parse($filters['end_date']) : null;
        $userId = $filters['user_id'] ?? null;
        $projectId = $filters['project_id'] ?? null;

        return [
            'summary' => $this->getDashboardSummary($userId, $startDate, $endDate),
            'user_analytics' => $this->userAnalytics->getDetailedUserAnalytics($userId, $startDate, $endDate),
            'project_analytics' => $this->projectAnalytics->getDetailedProjectAnalytics($projectId, $startDate, $endDate),
            'rating_analytics' => $this->getRatingAnalytics($startDate, $endDate),
            'performance_metrics' => $this->getPerformanceMetrics($startDate, $endDate),
            'generated_at' => now(),
        ];
    }

    private function getRecentActivities(?Carbon $startDate, ?Carbon $endDate, int $limit): array
    {
        $query = DB::table(DB::raw('(
            SELECT "task_rating" as type, task_id as reference_id, rater_id as user_id, rated_at as activity_date, final_rating as value
            FROM task_ratings
            UNION ALL
            SELECT "stakeholder_rating" as type, project_id as reference_id, stakeholder_id as user_id, rated_at as activity_date, final_rating as value
            FROM stakeholder_ratings
            UNION ALL
            SELECT "ticket_completed" as type, id as reference_id, assigned_to as user_id, completed_at as activity_date, NULL as value
            FROM tickets WHERE status = "resolved" AND completed_at IS NOT NULL
            UNION ALL
            SELECT "help_request_completed" as type, id as reference_id, helper_id as user_id, completed_at as activity_date, NULL as value
            FROM help_requests WHERE is_completed = 1 AND completed_at IS NOT NULL
        ) as activities'));

        if ($startDate) {
            $query->where('activity_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('activity_date', '<=', $endDate);
        }

        return $query->orderBy('activity_date', 'desc')
                    ->limit($limit)
                    ->get()
                    ->toArray();
    }

    private function getTrendData(?Carbon $startDate, ?Carbon $endDate): array
    {
        $defaultStart = $startDate ?? now()->subDays(30);
        $defaultEnd = $endDate ?? now();

        return [
            'task_ratings_trend' => $this->getDailyTrend('task_ratings', 'rated_at', 'final_rating', $defaultStart, $defaultEnd),
            'tickets_solved_trend' => $this->getDailyTrend('tickets', 'completed_at', null, $defaultStart, $defaultEnd, ['status' => 'resolved']),
            'help_requests_trend' => $this->getDailyTrend('help_requests', 'completed_at', null, $defaultStart, $defaultEnd, ['is_completed' => 1]),
        ];
    }

    private function getDailyTrend(string $table, string $dateColumn, ?string $valueColumn, Carbon $startDate, Carbon $endDate, array $conditions = []): array
    {
        $query = DB::table($table)
            ->selectRaw("DATE({$dateColumn}) as date")
            ->whereBetween($dateColumn, [$startDate, $endDate]);

        foreach ($conditions as $column => $value) {
            $query->where($column, $value);
        }

        if ($valueColumn) {
            $query->selectRaw("AVG({$valueColumn}) as avg_value, COUNT(*) as count");
        } else {
            $query->selectRaw("COUNT(*) as count");
        }

        return $query->groupBy(DB::raw("DATE({$dateColumn})"))
                    ->orderBy('date')
                    ->get()
                    ->toArray();
    }

    private function getRatingAnalytics(?Carbon $startDate, ?Carbon $endDate): array
    {
        $taskRatingsQuery = DB::table('task_ratings');
        $stakeholderRatingsQuery = DB::table('stakeholder_ratings');

        if ($startDate) {
            $taskRatingsQuery->where('rated_at', '>=', $startDate);
            $stakeholderRatingsQuery->where('rated_at', '>=', $startDate);
        }
        if ($endDate) {
            $taskRatingsQuery->where('rated_at', '<=', $endDate);
            $stakeholderRatingsQuery->where('rated_at', '<=', $endDate);
        }

        return [
            'task_ratings' => [
                'total_ratings' => $taskRatingsQuery->count(),
                'average_rating' => $taskRatingsQuery->avg('final_rating'),
                'rating_distribution' => $this->getRatingDistribution('task_ratings', $startDate, $endDate),
            ],
            'stakeholder_ratings' => [
                'total_ratings' => $stakeholderRatingsQuery->count(),
                'average_rating' => $stakeholderRatingsQuery->avg('final_rating'),
                'rating_distribution' => $this->getRatingDistribution('stakeholder_ratings', $startDate, $endDate),
            ],
        ];
    }

    private function getRatingDistribution(string $table, ?Carbon $startDate, ?Carbon $endDate): array
    {
        $query = DB::table($table)
            ->selectRaw('
                CASE 
                    WHEN final_rating >= 90 THEN "90-100"
                    WHEN final_rating >= 80 THEN "80-89"
                    WHEN final_rating >= 70 THEN "70-79"
                    WHEN final_rating >= 60 THEN "60-69"
                    ELSE "Below 60"
                END as rating_range,
                COUNT(*) as count
            ');

        if ($startDate) {
            $query->where('rated_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('rated_at', '<=', $endDate);
        }

        return $query->groupBy(DB::raw('
                CASE 
                    WHEN final_rating >= 90 THEN "90-100"
                    WHEN final_rating >= 80 THEN "80-89"
                    WHEN final_rating >= 70 THEN "70-79"
                    WHEN final_rating >= 60 THEN "60-69"
                    ELSE "Below 60"
                END
            '))
            ->get()
            ->toArray();
    }

    private function getPerformanceMetrics(?Carbon $startDate, ?Carbon $endDate): array
    {
        return [
            'productivity' => $this->getProductivityMetrics($startDate, $endDate),
            'quality' => $this->getQualityMetrics($startDate, $endDate),
            'efficiency' => $this->getEfficiencyMetrics($startDate, $endDate),
            'collaboration' => $this->getCollaborationMetrics($startDate, $endDate),
        ];
    }

    private function getProductivityMetrics(?Carbon $startDate, ?Carbon $endDate): array
    {
        $tasksQuery = DB::table('tasks');
        $ticketsQuery = DB::table('tickets')->where('status', 'resolved');

        if ($startDate && $endDate) {
            $tasksQuery->whereBetween('updated_at', [$startDate, $endDate]);
            $ticketsQuery->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return [
            'tasks_completed' => $tasksQuery->where('status', 'done')->count(),
            'tickets_resolved' => $ticketsQuery->count(),
            'average_task_weight' => $tasksQuery->where('status', 'done')->avg('weight'),
            'productivity_score' => $this->calculateProductivityScore($startDate, $endDate),
        ];
    }

    private function getQualityMetrics(?Carbon $startDate, ?Carbon $endDate): array
    {
        $taskRatingsQuery = DB::table('task_ratings');
        
        if ($startDate && $endDate) {
            $taskRatingsQuery->whereBetween('rated_at', [$startDate, $endDate]);
        }

        $helpRequestsQuery = DB::table('help_requests')
            ->whereNotNull('rating');

        if ($startDate && $endDate) {
            $helpRequestsQuery->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return [
            'average_task_rating' => $taskRatingsQuery->avg('final_rating'),
            'high_quality_tasks_percentage' => $this->getHighQualityTasksPercentage($startDate, $endDate),
            'help_request_penalty_avg' => $helpRequestsQuery->avg(DB::raw('
                CASE 
                    WHEN rating = "legitimate_learning" THEN 0.1
                    WHEN rating = "basic_skill_gap" THEN 0.3
                    WHEN rating = "careless_mistake" THEN 0.6
                    WHEN rating = "fixing_own_mistakes" THEN 0.8
                    ELSE 0
                END
            ')),
        ];
    }

    private function getEfficiencyMetrics(?Carbon $startDate, ?Carbon $endDate): array
    {
        return [
            'average_task_completion_time' => $this->getAverageTaskCompletionTime($startDate, $endDate),
            'ticket_resolution_rate' => $this->getTicketResolutionRate($startDate, $endDate),
            'help_request_frequency' => $this->getHelpRequestFrequency($startDate, $endDate),
        ];
    }

    private function getCollaborationMetrics(?Carbon $startDate, ?Carbon $endDate): array
    {
        $helpRequestsQuery = DB::table('help_requests')
            ->where('is_completed', true);

        if ($startDate && $endDate) {
            $helpRequestsQuery->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return [
            'help_requests_provided' => $helpRequestsQuery->count(),
            'collaboration_score' => $this->calculateCollaborationScore($startDate, $endDate),
            'team_assistance_rate' => $this->getTeamAssistanceRate($startDate, $endDate),
        ];
    }

    // Helper calculation methods
    private function calculateProductivityScore(?Carbon $startDate, ?Carbon $endDate): float
    {
        // Custom formula combining tasks, tickets, and weights
        $tasksCompleted = DB::table('tasks')->where('status', 'done');
        $ticketsResolved = DB::table('tickets')->where('status', 'resolved');

        if ($startDate && $endDate) {
            $tasksCompleted->whereBetween('updated_at', [$startDate, $endDate]);
            $ticketsResolved->whereBetween('completed_at', [$startDate, $endDate]);
        }

        $taskScore = $tasksCompleted->sum('weight') ?? 0;
        $ticketScore = $ticketsResolved->count() * 10; // 10 points per ticket

        return $taskScore + $ticketScore;
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

    private function getTicketResolutionRate(?Carbon $startDate, ?Carbon $endDate): float
    {
        $totalTicketsQuery = DB::table('tickets');
        $resolvedTicketsQuery = DB::table('tickets')->where('status', 'resolved');

        if ($startDate && $endDate) {
            $totalTicketsQuery->whereBetween('created_at', [$startDate, $endDate]);
            $resolvedTicketsQuery->whereBetween('completed_at', [$startDate, $endDate]);
        }

        $total = $totalTicketsQuery->count();
        $resolved = $resolvedTicketsQuery->count();

        return $total > 0 ? ($resolved / $total) * 100 : 0;
    }

    private function getHelpRequestFrequency(?Carbon $startDate, ?Carbon $endDate): float
    {
        $helpRequestsQuery = DB::table('help_requests');

        if ($startDate && $endDate) {
            $helpRequestsQuery->whereBetween('created_at', [$startDate, $endDate]);
            $days = $startDate->diffInDays($endDate) + 1;
        } else {
            $days = 30; // Default to 30 days
        }

        $count = $helpRequestsQuery->count();

        return $count / $days;
    }

    private function calculateCollaborationScore(?Carbon $startDate, ?Carbon $endDate): float
    {
        $helpProvidedQuery = DB::table('help_requests')
            ->where('is_completed', true);

        if ($startDate && $endDate) {
            $helpProvidedQuery->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return $helpProvidedQuery->count() * 5; // 5 points per help request resolved
    }

    private function getTeamAssistanceRate(?Carbon $startDate, ?Carbon $endDate): float
    {
        $totalHelpRequestsQuery = DB::table('help_requests');
        $completedHelpRequestsQuery = DB::table('help_requests')->where('is_completed', true);

        if ($startDate && $endDate) {
            $totalHelpRequestsQuery->whereBetween('created_at', [$startDate, $endDate]);
            $completedHelpRequestsQuery->whereBetween('completed_at', [$startDate, $endDate]);
        }

        $total = $totalHelpRequestsQuery->count();
        $completed = $completedHelpRequestsQuery->count();

        return $total > 0 ? ($completed / $total) * 100 : 0;
    }
}
