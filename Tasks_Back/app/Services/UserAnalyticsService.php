<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class UserAnalyticsService
{
    public function getUserPerformanceOverview(int $userId, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        return [
            'user_id' => $userId,
            'period' => [
                'start' => $startDate?->toDateString(),
                'end' => $endDate?->toDateString(),
            ],
            'task_metrics' => $this->getUserTaskMetrics($userId, $startDate, $endDate),
            'ticket_metrics' => $this->getUserTicketMetrics($userId, $startDate, $endDate),
            'help_metrics' => $this->getUserHelpMetrics($userId, $startDate, $endDate),
            'rating_metrics' => $this->getUserRatingMetrics($userId, $startDate, $endDate),
            'final_ratings' => $this->getUserFinalRatings($userId, $startDate, $endDate),
            'performance_score' => $this->calculateUserPerformanceScore($userId, $startDate, $endDate),
        ];
    }

    public function getDetailedUserAnalytics(?int $userId = null, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        if ($userId) {
            return $this->getUserPerformanceOverview($userId, $startDate, $endDate);
        }

        return [
            'all_users_summary' => $this->getAllUsersSummary($startDate, $endDate),
            'top_performers' => $this->getTopPerformers($startDate, $endDate),
            'user_rankings' => $this->getUserRankings($startDate, $endDate),
        ];
    }

    public function getTopPerformers(?Carbon $startDate = null, ?Carbon $endDate = null, int $limit = 10): array
    {
        $query = DB::table('users as u')
            ->leftJoin('final_ratings as fr', 'u.id', '=', 'fr.user_id')
            ->select([
                'u.id',
                'u.name',
                'u.email',
                DB::raw('AVG(fr.final_rating) as avg_final_rating'),
                DB::raw('COUNT(fr.id) as periods_rated'),
            ]);

        if ($startDate && $endDate) {
            $query->whereBetween('fr.period_start', [$startDate, $endDate]);
        }

        return $query->groupBy(['u.id', 'u.name', 'u.email'])
            ->orderBy('avg_final_rating', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getUserRankings(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $performanceScores = $this->getAllUsersPerformanceScores($startDate, $endDate);

        return collect($performanceScores)
            ->sortByDesc('performance_score')
            ->values()
            ->map(function ($user, $index) {
                $user['rank'] = $index + 1;
                return $user;
            })
            ->toArray();
    }

    private function getUserTaskMetrics(int $userId, ?Carbon $startDate, ?Carbon $endDate): array
    {
        // Tasks assigned to user (through task_user pivot)
        $assignedTasksQuery = DB::table('task_user as tu')
            ->join('tasks as t', 'tu.task_id', '=', 't.id')
            ->where('tu.user_id', $userId);

        if ($startDate && $endDate) {
            $assignedTasksQuery->whereBetween('t.created_at', [$startDate, $endDate]);
        }

        $assignedTasks = $assignedTasksQuery->get();

        // Task ratings given by user
        $ratingsByUserQuery = DB::table('task_ratings as tr')
            ->join('tasks as t', 'tr.task_id', '=', 't.id')
            ->where('tr.rater_id', $userId);

        if ($startDate && $endDate) {
            $ratingsByUserQuery->whereBetween('tr.rated_at', [$startDate, $endDate]);
        }

        return [
            'assigned_tasks_count' => $assignedTasks->count(),
            'completed_tasks_count' => $assignedTasks->where('status', 'done')->count(),
            'total_task_weight' => $assignedTasks->sum('weight'),
            'avg_task_rating_given' => $ratingsByUserQuery->avg('tr.final_rating'),
            'ratings_given_count' => $ratingsByUserQuery->count(),
            'task_completion_rate' => $assignedTasks->count() > 0 
                ? ($assignedTasks->where('status', 'done')->count() / $assignedTasks->count()) * 100 
                : 0,
        ];
    }

    private function getUserTicketMetrics(int $userId, ?Carbon $startDate, ?Carbon $endDate): array
    {
        $assignedTicketsQuery = DB::table('tickets')->where('assigned_to', $userId);
        $requestedTicketsQuery = DB::table('tickets')->where('requester_id', $userId);

        if ($startDate && $endDate) {
            $assignedTicketsQuery->whereBetween('created_at', [$startDate, $endDate]);
            $requestedTicketsQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        $resolvedTickets = clone $assignedTicketsQuery;
        $resolvedTickets->where('status', 'resolved');

        return [
            'tickets_assigned' => $assignedTicketsQuery->count(),
            'tickets_resolved' => $resolvedTickets->count(),
            'tickets_requested' => $requestedTicketsQuery->count(),
            'resolution_rate' => $assignedTicketsQuery->count() > 0 
                ? ($resolvedTickets->count() / $assignedTicketsQuery->count()) * 100 
                : 0,
            'avg_resolution_time' => $resolvedTickets->whereNotNull('completed_at')
                ->selectRaw('AVG(DATEDIFF(completed_at, created_at))')
                ->value('AVG(DATEDIFF(completed_at, created_at))'),
        ];
    }

    private function getUserHelpMetrics(int $userId, ?Carbon $startDate, ?Carbon $endDate): array
    {
        $helpRequestedQuery = DB::table('help_requests')->where('requester_id', $userId);
        $helpProvidedQuery = DB::table('help_requests')->where('helper_id', $userId);

        if ($startDate && $endDate) {
            $helpRequestedQuery->whereBetween('created_at', [$startDate, $endDate]);
            $helpProvidedQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        $penaltyQuery = clone $helpRequestedQuery;
        $penaltyQuery->whereNotNull('rating');

        return [
            'help_requests_made' => $helpRequestedQuery->count(),
            'help_requests_resolved' => $helpProvidedQuery->where('is_completed', true)->count(),
            'total_penalty_points' => $penaltyQuery->sum(DB::raw('
                CASE 
                    WHEN rating = "legitimate_learning" THEN 0.1
                    WHEN rating = "basic_skill_gap" THEN 0.3
                    WHEN rating = "careless_mistake" THEN 0.6
                    WHEN rating = "fixing_own_mistakes" THEN 0.8
                    ELSE 0
                END
            ')),
            'help_ratio' => $helpRequestedQuery->count() > 0 
                ? $helpProvidedQuery->where('is_completed', true)->count() / $helpRequestedQuery->count()
                : 0,
        ];
    }

    private function getUserRatingMetrics(int $userId, ?Carbon $startDate, ?Carbon $endDate): array
    {
        // Ratings received on user's tasks
        $taskRatingsQuery = DB::table('task_ratings as tr')
            ->join('task_user as tu', 'tr.task_id', '=', 'tu.task_id')
            ->where('tu.user_id', $userId);

        if ($startDate && $endDate) {
            $taskRatingsQuery->whereBetween('tr.rated_at', [$startDate, $endDate]);
        }

        // Stakeholder ratings given by user
        $stakeholderRatingsQuery = DB::table('stakeholder_ratings')
            ->where('stakeholder_id', $userId);

        if ($startDate && $endDate) {
            $stakeholderRatingsQuery->whereBetween('rated_at', [$startDate, $endDate]);
        }

        return [
            'avg_task_rating_received' => $taskRatingsQuery->avg('tr.final_rating'),
            'task_ratings_received_count' => $taskRatingsQuery->count(),
            'stakeholder_ratings_given' => $stakeholderRatingsQuery->count(),
            'avg_stakeholder_rating_given' => $stakeholderRatingsQuery->avg('final_rating'),
        ];
    }

    private function getUserFinalRatings(int $userId, ?Carbon $startDate, ?Carbon $endDate): array
    {
        $finalRatingsQuery = DB::table('final_ratings')->where('user_id', $userId);

        if ($startDate && $endDate) {
            $finalRatingsQuery->where(function($q) use ($startDate, $endDate) {
                $q->whereBetween('period_start', [$startDate, $endDate])
                  ->orWhereBetween('period_end', [$startDate, $endDate]);
            });
        }

        $ratings = $finalRatingsQuery->orderBy('period_start', 'desc')->get();

        return [
            'current_rating' => $ratings->first()?->final_rating,
            'average_rating' => $ratings->avg('final_rating'),
            'rating_trend' => $this->calculateRatingTrend($ratings),
            'total_periods' => $ratings->count(),
            'recent_ratings' => $ratings->take(5)->toArray(),
        ];
    }

    private function calculateUserPerformanceScore(int $userId, ?Carbon $startDate, ?Carbon $endDate): float
    {
        $taskMetrics = $this->getUserTaskMetrics($userId, $startDate, $endDate);
        $ticketMetrics = $this->getUserTicketMetrics($userId, $startDate, $endDate);
        $helpMetrics = $this->getUserHelpMetrics($userId, $startDate, $endDate);
        $ratingMetrics = $this->getUserRatingMetrics($userId, $startDate, $endDate);

        // Custom scoring algorithm
        $taskScore = ($taskMetrics['completed_tasks_count'] * 10) + ($taskMetrics['total_task_weight'] * 0.5);
        $ticketScore = $ticketMetrics['tickets_resolved'] * 15;
        $ratingScore = ($ratingMetrics['avg_task_rating_received'] ?? 0) * 2;
        $helpScore = $helpMetrics['help_requests_resolved'] * 8;
        $penalty = $helpMetrics['total_penalty_points'] * 10;

        return max(0, $taskScore + $ticketScore + $ratingScore + $helpScore - $penalty);
    }

    private function getAllUsersSummary(?Carbon $startDate, ?Carbon $endDate): array
    {
        $usersQuery = DB::table('users');
        $totalUsers = $usersQuery->count();

        return [
            'total_users' => $totalUsers,
            'active_users' => $this->getActiveUsersCount($startDate, $endDate),
            'avg_performance_score' => $this->getAveragePerformanceScore($startDate, $endDate),
            'performance_distribution' => $this->getPerformanceDistribution($startDate, $endDate),
        ];
    }

    private function getAllUsersPerformanceScores(?Carbon $startDate, ?Carbon $endDate): array
    {
        $users = DB::table('users')->select(['id', 'name', 'email'])->get();

        return $users->map(function($user) use ($startDate, $endDate) {
            return [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'performance_score' => $this->calculateUserPerformanceScore($user->id, $startDate, $endDate),
            ];
        })->toArray();
    }

    private function calculateRatingTrend($ratings): string
    {
        if ($ratings->count() < 2) {
            return 'stable';
        }

        $recent = $ratings->take(3)->avg('final_rating');
        $older = $ratings->skip(3)->take(3)->avg('final_rating');

        if ($recent > $older + 5) return 'improving';
        if ($recent < $older - 5) return 'declining';
        return 'stable';
    }

    private function getActiveUsersCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('users as u')
            ->where(function($q) use ($startDate, $endDate) {
                $q->whereExists(function($sq) use ($startDate, $endDate) {
                    $sq->select(DB::raw(1))
                       ->from('task_ratings')
                       ->whereColumn('rater_id', 'u.id');
                    if ($startDate && $endDate) {
                        $sq->whereBetween('rated_at', [$startDate, $endDate]);
                    }
                })
                ->orWhereExists(function($sq) use ($startDate, $endDate) {
                    $sq->select(DB::raw(1))
                       ->from('tickets')
                       ->whereColumn('assigned_to', 'u.id')
                       ->where('status', 'resolved');
                    if ($startDate && $endDate) {
                        $sq->whereBetween('completed_at', [$startDate, $endDate]);
                    }
                });
            });

        return $query->distinct()->count();
    }

    private function getAveragePerformanceScore(?Carbon $startDate, ?Carbon $endDate): float
    {
        $scores = $this->getAllUsersPerformanceScores($startDate, $endDate);
        return collect($scores)->avg('performance_score') ?? 0;
    }

    private function getPerformanceDistribution(?Carbon $startDate, ?Carbon $endDate): array
    {
        $scores = collect($this->getAllUsersPerformanceScores($startDate, $endDate));

        return [
            'excellent' => $scores->where('performance_score', '>=', 200)->count(),
            'good' => $scores->whereBetween('performance_score', [100, 199])->count(),
            'average' => $scores->whereBetween('performance_score', [50, 99])->count(),
            'needs_improvement' => $scores->where('performance_score', '<', 50)->count(),
        ];
    }
}
