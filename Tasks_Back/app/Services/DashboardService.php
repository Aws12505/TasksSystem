<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use App\Models\HelpRequest;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get employee dashboard stats
     */
    public function getEmployeeDashboard(int $userId): array
    {
        $user = User::findOrFail($userId);

        return [
            'overview' => $this->getEmployeeOverview($user),
            'upcoming_tasks' => $this->getUpcomingTasks($user),
            'recent_activity' => $this->getRecentActivity($user),
        ];
    }

    /**
     * Get manager analytics dashboard
     */
    public function getManagerAnalytics(string $period = 'today'): array
    {
        [$startDate, $endDate] = $this->getPeriodDates($period);

        return [
            'overview' => $this->getManagerOverview($startDate, $endDate),
            'project_status' => $this->getProjectStatus($startDate, $endDate),
            'task_distribution' => $this->getTaskDistribution($startDate, $endDate),
            'help_requests_stats' => $this->getHelpRequestsStats($startDate, $endDate),
            'tickets_stats' => $this->getTicketsStats($startDate, $endDate),
            'upcoming_deadlines' => $this->getUpcomingDeadlines(),
            'top_performers' => $this->getTopPerformers($startDate, $endDate),
        ];
    }

    // ==================== EMPLOYEE DASHBOARD ====================

    private function getEmployeeOverview(User $user): array
    {
        $weekStart = Carbon::now()->startOfWeek();

        return [
            'assigned_tasks' => [
                'total' => $user->assignedTasks()->count(),
                'pending' => $user->assignedTasks()->where('status', 'pending')->count(),
                'in_progress' => $user->assignedTasks()->where('status', 'in_progress')->count(),
                'done' => $user->assignedTasks()->where('status', 'done')->count(),
                'rated' => $user->assignedTasks()->where('status', 'rated')->count(),
            ],
            'projects' => [
                'total' => $this->getUserProjectsCount($user),
                'as_stakeholder' => $user->projects()->count(),
                'as_contributor' => $this->getUserContributingProjectsCount($user),
            ],
            'help_requests' => [
                'requested' => $user->requestedHelp()->count(),
                'helped_others' => $user->helpingWith()->count(),
                'pending' => $user->requestedHelp()->where('is_completed', false)->count(),
            ],
            'tickets' => [
                'assigned' => $user->assignedTickets()->count(),
                'completed' => $user->assignedTickets()
                    ->where('status', \App\Enums\TicketStatus::RESOLVED->value)
                    ->count(),
                'in_progress' => $user->assignedTickets()
                    ->where('status', \App\Enums\TicketStatus::IN_PROGRESS->value)
                    ->count(),
            ],
            'this_week' => [
                'tasks_completed' => $user->assignedTasks()
                    ->whereIn('status', ['done', 'rated'])
                    ->where('completed_at', '>=', $weekStart)
                    ->count(),
                'helped_colleagues' => $user->helpingWith()
                    ->where('is_completed', true)
                    ->where('completed_at', '>=', $weekStart)
                    ->count(),
            ],
        ];
    }

    private function getUpcomingTasks(User $user, int $days = 7): array
    {
        $endDate = Carbon::today()->addDays($days);

        return $user->assignedTasks()
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereBetween('due_date', [Carbon::today(), $endDate])
            ->with(['section.project'])
            ->orderBy('due_date', 'asc')
            ->orderByRaw("FIELD(priority, 'critical', 'high', 'medium', 'low')")
            ->limit(10)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'name' => $task->name,
                    'due_date' => $task->due_date->toDateString(),
                    'days_until_due' => Carbon::today()->diffInDays($task->due_date, false),
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'project' => [
                        'id' => $task->section->project->id,
                        'name' => $task->section->project->name,
                    ],
                ];
            })
            ->toArray();
    }

    private function getRecentActivity(User $user, int $days = 7): array
    {
        $since = Carbon::now()->subDays($days);
        $activities = [];

        // Recent task completions
        $completedTasks = $user->assignedTasks()
            ->whereIn('status', ['done', 'rated'])
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $since)
            ->with('section.project')
            ->latest('completed_at')
            ->limit(5)
            ->get()
            ->map(function ($task) {
                return [
                    'type' => 'task_completed',
                    'title' => "Completed: {$task->name}",
                    'project' => $task->section->project->name,
                    'timestamp' => $task->completed_at,
                ];
            });

        // Recent help provided
        $helpProvided = $user->helpingWith()
            ->where('is_completed', true)
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $since)
            ->with(['task.section.project', 'requester'])
            ->latest('completed_at')
            ->limit(5)
            ->get()
            ->map(function ($help) {
                return [
                    'type' => 'helped_colleague',
                    'title' => "Helped {$help->requester->name}",
                    'project' => $help->task->section->project->name,
                    'timestamp' => $help->completed_at,
                ];
            });

        return $completedTasks->merge($helpProvided)
            ->sortByDesc('timestamp')
            ->take(10)
            ->values()
            ->toArray();
    }

    // ==================== MANAGER ANALYTICS ====================

    private function getManagerOverview(Carbon $startDate, Carbon $endDate): array
    {
        return [
            'total_employees' => User::count(),
            'active_projects' => Project::whereIn('status', ['in_progress', 'pending'])->count(),
            'total_tasks' => Task::whereBetween('due_date', [$startDate, $endDate])->count(),
            'completed_tasks' => Task::whereIn('status', ['done', 'rated'])
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->count(),
            'pending_help_requests' => HelpRequest::where('is_completed', false)->count(),
            'open_tickets' => Ticket::where('status', \App\Enums\TicketStatus::OPEN->value)->count(),
            'average_task_completion_rate' => $this->getAverageTaskCompletionRate($startDate, $endDate),
        ];
    }

    private function getProjectStatus(Carbon $startDate, Carbon $endDate): array
    {
        $projects = Project::with('sections.tasks')
            ->whereHas('sections.tasks', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('due_date', [$startDate, $endDate]);
            })
            ->get();

        return [
            'by_status' => [
                'pending' => $projects->where('status', 'pending')->count(),
                'in_progress' => $projects->where('status', 'in_progress')->count(),
                'done' => $projects->where('status', 'done')->count(),
                'rated' => $projects->where('status', 'rated')->count(),
            ],
            'average_progress' => round($projects->avg('progress_percentage'), 2),
            'at_risk' => $projects->filter(function ($project) {
                return $project->progress_percentage < 50 
                    && !in_array($project->status, ['done', 'rated']);
            })->count(),
        ];
    }

    private function getTaskDistribution(Carbon $startDate, Carbon $endDate): array
    {
        $tasks = Task::whereBetween('due_date', [$startDate, $endDate])->get();

        return [
            'by_status' => [
                'pending' => $tasks->where('status', 'pending')->count(),
                'in_progress' => $tasks->where('status', 'in_progress')->count(),
                'done' => $tasks->where('status', 'done')->count(),
                'rated' => $tasks->where('status', 'rated')->count(),
            ],
            'by_priority' => [
                'low' => $tasks->where('priority', 'low')->count(),
                'medium' => $tasks->where('priority', 'medium')->count(),
                'high' => $tasks->where('priority', 'high')->count(),
                'critical' => $tasks->where('priority', 'critical')->count(),
            ],
            'overdue' => $tasks->where('due_date', '<', Carbon::today())
                ->whereNotIn('status', ['done', 'rated'])
                ->count(),
        ];
    }

    private function getHelpRequestsStats(Carbon $startDate, Carbon $endDate): array
    {
        $helpRequests = HelpRequest::whereBetween('created_at', [$startDate, $endDate])->get();

        return [
            'total' => $helpRequests->count(),
            'completed' => $helpRequests->where('is_completed', true)->count(),
            'pending' => $helpRequests->where('is_completed', false)->count(),
            'average_resolution_time' => $this->getAverageHelpResolutionTime($helpRequests),
            'top_helpers' => $this->getTopHelpers($startDate, $endDate),
        ];
    }

    private function getTicketsStats(Carbon $startDate, Carbon $endDate): array
    {
        $tickets = Ticket::whereBetween('created_at', [$startDate, $endDate])->get();

        return [
            'total' => $tickets->count(),
            'open' => $tickets->where('status', \App\Enums\TicketStatus::OPEN->value)->count(),
            'in_progress' => $tickets->where('status', \App\Enums\TicketStatus::IN_PROGRESS->value)->count(),
            'resolved' => $tickets->where('status', \App\Enums\TicketStatus::RESOLVED->value)->count(),
            'by_type' => [
                'quick_fix' => $tickets->where('type', \App\Enums\TicketType::QUICK_FIX->value)->count(),
                'bug_investigation' => $tickets->where('type', \App\Enums\TicketType::BUG_INVESTIGATION->value)->count(),
                'user_support' => $tickets->where('type', \App\Enums\TicketType::USER_SUPPORT->value)->count(),
            ],
        ];
    }

    private function getUpcomingDeadlines(int $days = 7): array
    {
        $endDate = Carbon::today()->addDays($days);

        return Task::whereIn('status', ['pending', 'in_progress'])
            ->whereBetween('due_date', [Carbon::today(), $endDate])
            ->with(['section.project', 'assignedUsers'])
            ->orderBy('due_date', 'asc')
            ->orderByRaw("FIELD(priority, 'critical', 'high', 'medium', 'low')")
            ->limit(20)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'name' => $task->name,
                    'due_date' => $task->due_date->toDateString(),
                    'days_until_due' => Carbon::today()->diffInDays($task->due_date, false),
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'project' => [
                        'id' => $task->section->project->id,
                        'name' => $task->section->project->name,
                    ],
                    'assigned_users_count' => $task->assignedUsers->count(),
                ];
            })
            ->toArray();
    }

    private function getTopPerformers(Carbon $startDate, Carbon $endDate): array
    {
        // Get users with most completed tasks in period
        $topByTasks = Task::whereIn('status', ['done', 'rated'])
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->with('assignedUsers')
            ->get()
            ->flatMap(fn($task) => $task->assignedUsers)
            ->groupBy('id')
            ->map(function ($userTasks, $userId) {
                $user = $userTasks->first();
                return [
                    'user_id' => $userId,
                    'user_name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                    'completed_tasks' => $userTasks->count(),
                ];
            })
            ->sortByDesc('completed_tasks')
            ->take(5)
            ->values()
            ->toArray();

        return $topByTasks;
    }

    // ==================== HELPER METHODS ====================

    private function getPeriodDates(string $period): array
    {
        return match ($period) {
            'today' => [Carbon::today(), Carbon::today()],
            'yesterday' => [Carbon::yesterday(), Carbon::yesterday()],
            'this_week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'last_week' => [
                Carbon::now()->subWeek()->startOfWeek(),
                Carbon::now()->subWeek()->endOfWeek()
            ],
            'this_month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'last_month' => [
                Carbon::now()->subMonth()->startOfMonth(),
                Carbon::now()->subMonth()->endOfMonth()
            ],
            'month_to_date' => [Carbon::now()->startOfMonth(), Carbon::today()],
            default => [Carbon::today(), Carbon::today()],
        };
    }

    private function getUserProjectsCount(User $user): int
    {
        return Project::where('stakeholder_id', $user->id)
            ->orWhereHas('sections.tasks.assignedUsers', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->distinct()
            ->count();
    }

    private function getUserContributingProjectsCount(User $user): int
    {
        return Project::whereHas('sections.tasks.assignedUsers', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })
        ->where('stakeholder_id', '!=', $user->id)
        ->distinct()
        ->count();
    }

    private function getAverageTaskCompletionRate(Carbon $startDate, Carbon $endDate): float
    {
        $totalTasks = Task::whereBetween('due_date', [$startDate, $endDate])->count();
        
        if ($totalTasks === 0) {
            return 0;
        }

        $completedTasks = Task::whereIn('status', ['done', 'rated'])
            ->whereBetween('due_date', [$startDate, $endDate])
            ->count();

        return round(($completedTasks / $totalTasks) * 100, 2);
    }

    private function getAverageHelpResolutionTime($helpRequests): ?float
    {
        $completed = $helpRequests->where('is_completed', true)
            ->filter(fn($help) => $help->completed_at && $help->created_at);

        if ($completed->isEmpty()) {
            return null;
        }

        $totalHours = $completed->sum(function ($help) {
            return $help->created_at->diffInHours($help->completed_at);
        });

        return round($totalHours / $completed->count(), 2);
    }

    private function getTopHelpers(Carbon $startDate, Carbon $endDate): array
    {
        return HelpRequest::where('is_completed', true)
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->select('helper_id', DB::raw('count(*) as help_count'))
            ->groupBy('helper_id')
            ->orderByDesc('help_count')
            ->with('helper')
            ->limit(5)
            ->get()
            ->map(function ($record) {
                return [
                    'user_id' => $record->helper_id,
                    'user_name' => $record->helper->name,
                    'avatar_url' => $record->helper->avatar_url,
                    'help_count' => $record->help_count,
                ];
            })
            ->toArray();
    }
}
