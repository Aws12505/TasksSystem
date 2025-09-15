<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProjectAnalyticsService
{
    public function getProjectHealthSummary(?Carbon $startDate = null, ?Carbon $endDate = null)
    {
        return [
            'total_projects' => $this->getTotalProjectsCount($startDate, $endDate),
            'active_projects' => $this->getActiveProjectsCount($startDate, $endDate),
            'completed_projects' => $this->getCompletedProjectsCount($startDate, $endDate),
            'project_health_distribution' => $this->getProjectHealthDistribution($startDate, $endDate),
            'avg_project_progress' => $this->getAverageProjectProgress($startDate, $endDate),
            'overdue_projects_count' => $this->getOverdueProjectsCount($startDate, $endDate),
        ];
    }

    public function getDetailedProjectAnalytics(?int $projectId = null, ?Carbon $startDate = null, ?Carbon $endDate = null)
    {
        if ($projectId) {
            return $this->getSingleProjectAnalytics($projectId, $startDate, $endDate);
        }

        return [
            'project_overview' => $this->getAllProjectsOverview($startDate, $endDate),
            'top_performing_projects' => $this->getTopPerformingProjects($startDate, $endDate),
            'project_metrics_summary' => $this->getProjectMetricsSummary($startDate, $endDate),
        ];
    }

    private function getSingleProjectAnalytics(int $projectId, ?Carbon $startDate, ?Carbon $endDate)
    {
        return [
            'project_id' => $projectId,
            'basic_info' => $this->getProjectBasicInfo($projectId),
            'task_analytics' => $this->getProjectTaskAnalytics($projectId, $startDate, $endDate),
            'rating_analytics' => $this->getProjectRatingAnalytics($projectId, $startDate, $endDate),
            'team_analytics' => $this->getProjectTeamAnalytics($projectId, $startDate, $endDate),
            'timeline_analytics' => $this->getProjectTimelineAnalytics($projectId, $startDate, $endDate),
            'health_score' => $this->calculateProjectHealthScore($projectId, $startDate, $endDate),
        ];
    }

    private function getProjectBasicInfo(int $projectId)
    {
        return DB::table('projects as p')
            ->leftJoin('users as u', 'p.stakeholder_id', '=', 'u.id')
            ->select([
                'p.id',
                'p.name',
                'p.description',
                'p.status',
                'p.progress_percentage',
                'p.stakeholder_will_rate',
                'u.name as stakeholder_name',
                'p.created_at',
                'p.updated_at'
            ])
            ->where('p.id', $projectId)
            ->first() ?: [];
    }

    private function getProjectTaskAnalytics(int $projectId, ?Carbon $startDate, ?Carbon $endDate)
    {
        $tasksQuery = DB::table('tasks as t')
            ->join('sections as s', 't.section_id', '=', 's.id')
            ->where('s.project_id', $projectId);

        if ($startDate && $endDate) {
            $tasksQuery->whereBetween('t.created_at', [$startDate, $endDate]);
        }

        $tasks = $tasksQuery->get();

        return [
            'total_tasks' => $tasks->count(),
            'completed_tasks' => $tasks->where('status', 'done')->count(),
            'in_progress_tasks' => $tasks->where('status', 'in_progress')->count(),
            'pending_tasks' => $tasks->where('status', 'pending')->count(),
            'total_weight' => $tasks->sum('weight'),
            'completed_weight' => $tasks->where('status', 'done')->sum('weight'),
            'avg_task_weight' => $tasks->avg('weight'),
            'overdue_tasks' => $tasks->where('due_date', '<', now())->whereIn('status', ['pending', 'in_progress'])->count(),
        ];
    }

    private function getProjectRatingAnalytics(int $projectId, ?Carbon $startDate, ?Carbon $endDate)
    {
        // Task ratings for this project
        $taskRatingsQuery = DB::table('task_ratings as tr')
            ->join('tasks as t', 'tr.task_id', '=', 't.id')
            ->join('sections as s', 't.section_id', '=', 's.id')
            ->where('s.project_id', $projectId);

        // Stakeholder ratings for this project
        $stakeholderRatingsQuery = DB::table('stakeholder_ratings')
            ->where('project_id', $projectId);

        if ($startDate && $endDate) {
            $taskRatingsQuery->whereBetween('tr.rated_at', [$startDate, $endDate]);
            $stakeholderRatingsQuery->whereBetween('rated_at', [$startDate, $endDate]);
        }

        return [
            'task_ratings' => [
                'count' => $taskRatingsQuery->count(),
                'average' => $taskRatingsQuery->avg('tr.final_rating'),
                'highest' => $taskRatingsQuery->max('tr.final_rating'),
                'lowest' => $taskRatingsQuery->min('tr.final_rating'),
            ],
            'stakeholder_ratings' => [
                'count' => $stakeholderRatingsQuery->count(),
                'average' => $stakeholderRatingsQuery->avg('final_rating'),
                'latest' => $stakeholderRatingsQuery->orderBy('rated_at', 'desc')->value('final_rating'),
            ],
        ];
    }

    private function getProjectTeamAnalytics(int $projectId, ?Carbon $startDate, ?Carbon $endDate)
    {
        // Get users assigned to tasks in this project
        $teamQuery = DB::table('task_user as tu')
            ->join('tasks as t', 'tu.task_id', '=', 't.id')
            ->join('sections as s', 't.section_id', '=', 's.id')
            ->join('users as u', 'tu.user_id', '=', 'u.id')
            ->where('s.project_id', $projectId);

        if ($startDate && $endDate) {
            $teamQuery->whereBetween('t.created_at', [$startDate, $endDate]);
        }

        $team = $teamQuery->select(['u.id', 'u.name', 'tu.percentage'])
            ->get()
            ->groupBy('id')
            ->map(function($assignments, $userId) {
                return [
                    'user_id' => $userId,
                    'name' => $assignments->first()->name,
                    'total_assignment_percentage' => $assignments->sum('percentage'),
                    'task_count' => $assignments->count(),
                ];
            })
            ->values();

        return [
            'team_size' => $team->count(),
            'team_members' => $team->toArray(),
            'avg_assignment_percentage' => $team->avg('total_assignment_percentage'),
        ];
    }

    private function getProjectTimelineAnalytics(int $projectId, ?Carbon $startDate, ?Carbon $endDate)
    {
        $project = DB::table('projects')->where('id', $projectId)->first();
        
        if (!$project) {
            return [];
        }

        $tasksQuery = DB::table('tasks as t')
            ->join('sections as s', 't.section_id', '=', 's.id')
            ->where('s.project_id', $projectId);

        return [
            'project_age_days' => Carbon::parse($project->created_at)->diffInDays(now()),
            'estimated_completion_date' => $this->estimateProjectCompletion($projectId),
            'tasks_overdue' => $tasksQuery->where('due_date', '<', now())
                ->whereIn('status', ['pending', 'in_progress'])
                ->count(),
            'upcoming_deadlines' => $this->getUpcomingDeadlines($projectId, 7),
        ];
    }

    private function calculateProjectHealthScore(int $projectId, ?Carbon $startDate, ?Carbon $endDate)
    {
        $taskAnalytics = $this->getProjectTaskAnalytics($projectId, $startDate, $endDate);
        $ratingAnalytics = $this->getProjectRatingAnalytics($projectId, $startDate, $endDate);
        
        // Calculate health score based on multiple factors
        $completionScore = $taskAnalytics['total_tasks'] > 0 
            ? ($taskAnalytics['completed_tasks'] / $taskAnalytics['total_tasks']) * 100 
            : 0;
        
        $ratingScore = $ratingAnalytics['task_ratings']['average'] ?? 0;
        
        $overdueScore = $taskAnalytics['total_tasks'] > 0 
            ? 100 - (($taskAnalytics['overdue_tasks'] / $taskAnalytics['total_tasks']) * 100)
            : 100;

        $overallScore = ($completionScore * 0.4) + ($ratingScore * 0.4) + ($overdueScore * 0.2);

        return [
            'overall_score' => round($overallScore, 2),
            'completion_score' => round($completionScore, 2),
            'quality_score' => round($ratingScore, 2),
            'timeline_score' => round($overdueScore, 2),
            'health_status' => $this->getHealthStatus($overallScore),
        ];
    }

    private function getAllProjectsOverview(?Carbon $startDate, ?Carbon $endDate): array
    {
        $projectsQuery = DB::table('projects');

        if ($startDate && $endDate) {
            $projectsQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        return $projectsQuery->select([
            'id',
            'name',
            'status',
            'progress_percentage',
            'stakeholder_will_rate',
            'created_at'
        ])->get()->map(function($project) {
            return array_merge((array)$project, [
                'health_score' => $this->calculateProjectHealthScore($project->id, null, null),
            ]);
        })->toArray();
    }

    private function getTopPerformingProjects(?Carbon $startDate, ?Carbon $endDate, int $limit = 10): array
    {
        $projects = $this->getAllProjectsOverview($startDate, $endDate);
        
        return collect($projects)
            ->sortByDesc('health_score.overall_score')
            ->take($limit)
            ->values()
            ->toArray();
    }

    private function getProjectMetricsSummary(?Carbon $startDate, ?Carbon $endDate): array
    {
        $projectsQuery = DB::table('projects');

        if ($startDate && $endDate) {
            $projectsQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        return [
            'avg_progress_percentage' => $projectsQuery->avg('progress_percentage'),
            'projects_with_stakeholder_rating' => $projectsQuery->where('stakeholder_will_rate', true)->count(),
            'total_sections' => $this->getTotalSectionsCount($startDate, $endDate),
            'total_project_tasks' => $this->getTotalProjectTasksCount($startDate, $endDate),
        ];
    }

    // Helper methods
    private function getTotalProjectsCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('projects');
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getActiveProjectsCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('projects')->where('status', 'in_progress');
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getCompletedProjectsCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('projects')->whereIn('status', ['done', 'rated']);
        
        if ($startDate && $endDate) {
            $query->whereBetween('updated_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getProjectHealthDistribution(?Carbon $startDate, ?Carbon $endDate): array
    {
        $projects = $this->getAllProjectsOverview($startDate, $endDate);
        
        $healthDistribution = collect($projects)->groupBy(function($project) {
            $score = $project['health_score']['overall_score'];
            if ($score >= 80) return 'excellent';
            if ($score >= 60) return 'good';
            if ($score >= 40) return 'fair';
            return 'poor';
        })->map(function($group) {
            return $group->count();
        });

        return [
            'excellent' => $healthDistribution['excellent'] ?? 0,
            'good' => $healthDistribution['good'] ?? 0,
            'fair' => $healthDistribution['fair'] ?? 0,
            'poor' => $healthDistribution['poor'] ?? 0,
        ];
    }

    private function getAverageProjectProgress(?Carbon $startDate, ?Carbon $endDate): float
    {
        $query = DB::table('projects');
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        return $query->avg('progress_percentage') ?? 0;
    }

    private function getOverdueProjectsCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        // Projects with overdue tasks
        return DB::table('projects as p')
            ->join('sections as s', 'p.id', '=', 's.project_id')
            ->join('tasks as t', 's.id', '=', 't.section_id')
            ->where('t.due_date', '<', now())
            ->whereIn('t.status', ['pending', 'in_progress'])
            ->when($startDate && $endDate, function($q) use ($startDate, $endDate) {
                $q->whereBetween('p.created_at', [$startDate, $endDate]);
            })
            ->distinct('p.id')
            ->count();
    }

    private function estimateProjectCompletion(int $projectId): ?string
    {
        $project = DB::table('projects')->where('id', $projectId)->first();
        
        if (!$project || $project->progress_percentage >= 100) {
            return null;
        }

        $remainingProgress = 100 - $project->progress_percentage;
        $daysSinceStart = Carbon::parse($project->created_at)->diffInDays(now());
        
        if ($daysSinceStart > 0 && $project->progress_percentage > 0) {
            $progressPerDay = $project->progress_percentage / $daysSinceStart;
            $estimatedDaysRemaining = $remainingProgress / $progressPerDay;
            
            return now()->addDays($estimatedDaysRemaining)->toDateString();
        }

        return null;
    }

    private function getUpcomingDeadlines(int $projectId, int $days): array
    {
        return DB::table('tasks as t')
            ->join('sections as s', 't.section_id', '=', 's.id')
            ->where('s.project_id', $projectId)
            ->where('t.due_date', '>', now())
            ->where('t.due_date', '<=', now()->addDays($days))
            ->whereIn('t.status', ['pending', 'in_progress'])
            ->select(['t.id', 't.name', 't.due_date', 't.status'])
            ->orderBy('t.due_date')
            ->get()
            ->toArray();
    }

    private function getHealthStatus(float $score): string
    {
        if ($score >= 80) return 'excellent';
        if ($score >= 60) return 'good';
        if ($score >= 40) return 'fair';
        return 'poor';
    }

    private function getTotalSectionsCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('sections as s')
            ->join('projects as p', 's.project_id', '=', 'p.id');
            
        if ($startDate && $endDate) {
            $query->whereBetween('p.created_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }

    private function getTotalProjectTasksCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        $query = DB::table('tasks as t')
            ->join('sections as s', 't.section_id', '=', 's.id')
            ->join('projects as p', 's.project_id', '=', 'p.id');
            
        if ($startDate && $endDate) {
            $query->whereBetween('p.created_at', [$startDate, $endDate]);
        }
        
        return $query->count();
    }
}
