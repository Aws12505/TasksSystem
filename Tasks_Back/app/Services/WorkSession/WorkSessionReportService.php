<?php

namespace App\Services\WorkSession;

use App\Models\User;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Aggregated reports over work sessions and their items.
 *
 * Everything here uses the Query Builder (not Eloquent) on purpose:
 *  - LEFT JOIN from sessions to items so sessions with zero items still count;
 *  - Task's "user_scope" global scope never applies to the task/project joins;
 *  - all SQL stays portable between MySQL (dev/prod) and SQLite (tests).
 *
 * Completion % is always computed with WorkSession::completionPct() so the
 * PARTIAL_WEIGHT credit is defined in exactly one place.
 */
class WorkSessionReportService
{
    /** Hard cap on by-task rows returned to the client. */
    public const BY_TASK_MAX_ROWS = 500;

    // ─── Public API ──────────────────────────────────────────────────

    /**
     * Totals, per-user breakdown and a daily series for a date range.
     *
     * @param  int[]  $userIds  empty = all users
     * @param  bool  $includeOpen  include sessions still "open" (default: confirmed only)
     */
    public function overview(string $start, string $end, array $userIds = [], bool $includeOpen = false): array
    {
        [$start, $end] = $this->normalizeRange($start, $end);
        $userIds = $this->normalizeIds($userIds);

        // Totals (single row)
        $totalsRow = $this->sessionsWithItems($start, $end, $userIds, $includeOpen)
            ->selectRaw('COUNT(DISTINCT s.user_id) AS users')
            ->selectRaw('COUNT(DISTINCT s.id) AS sessions')
            ->selectRaw("COUNT(DISTINCT CASE WHEN s.status = 'confirmed' THEN s.id ELSE NULL END) AS confirmed_sessions")
            ->addSelect($this->itemAggregates())
            ->first();

        // Per user
        $perUserRows = $this->sessionsWithItems($start, $end, $userIds, $includeOpen)
            ->select('s.user_id')
            ->selectRaw('COUNT(DISTINCT s.id) AS sessions_count')
            ->selectRaw('MAX(s.work_date) AS last_work_date')
            ->addSelect($this->itemAggregates())
            ->groupBy('s.user_id')
            ->get();

        $users = $this->loadUsers($perUserRows->pluck('user_id')->all());

        $perUser = $perUserRows
            ->map(function ($row) use ($users) {
                $user = $users->get((int) $row->user_id);
                $done = (int) $row->done;
                $partial = (int) $row->partial;
                $total = (int) $row->items_total;

                return [
                    'user_id' => (int) $row->user_id,
                    'user_name' => $user?->name ?? 'Unknown',
                    'avatar_url' => $user?->avatar_url,
                    'sessions_count' => (int) $row->sessions_count,
                    'items_total' => $total,
                    'done' => $done,
                    'partial' => $partial,
                    'not_done' => (int) $row->not_done,
                    'pending' => (int) $row->pending,
                    'completion_pct' => WorkSession::completionPct($done, $partial, $total),
                    'estimated_minutes_total' => (int) $row->estimated_minutes_total,
                    'last_work_date' => $this->dateString($row->last_work_date),
                ];
            })
            ->sortBy('user_name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();

        // Daily series
        $daily = $this->sessionsWithItems($start, $end, $userIds, $includeOpen)
            ->select('s.work_date')
            ->selectRaw('COUNT(DISTINCT s.id) AS sessions_count')
            ->addSelect($this->itemAggregates())
            ->groupBy('s.work_date')
            ->orderBy('s.work_date')
            ->get()
            ->map(function ($row) {
                $done = (int) $row->done;
                $partial = (int) $row->partial;
                $total = (int) $row->items_total;

                return [
                    'date' => $this->dateString($row->work_date),
                    'sessions_count' => (int) $row->sessions_count,
                    'items_total' => $total,
                    'done' => $done,
                    'partial' => $partial,
                    'not_done' => (int) $row->not_done,
                    'pending' => (int) $row->pending,
                    'completion_pct' => WorkSession::completionPct($done, $partial, $total),
                ];
            })
            ->all();

        $done = (int) ($totalsRow->done ?? 0);
        $partial = (int) ($totalsRow->partial ?? 0);
        $total = (int) ($totalsRow->items_total ?? 0);

        return [
            'period' => [
                'start' => $start,
                'end' => $end,
                'include_open' => $includeOpen,
                'user_ids' => $userIds,
            ],
            'totals' => [
                'users' => (int) ($totalsRow->users ?? 0),
                'sessions' => (int) ($totalsRow->sessions ?? 0),
                'confirmed_sessions' => (int) ($totalsRow->confirmed_sessions ?? 0),
                'items_total' => $total,
                'done' => $done,
                'partial' => $partial,
                'not_done' => (int) ($totalsRow->not_done ?? 0),
                'pending' => (int) ($totalsRow->pending ?? 0),
                'completion_pct' => WorkSession::completionPct($done, $partial, $total),
                'estimated_minutes_total' => (int) ($totalsRow->estimated_minutes_total ?? 0),
            ],
            'per_user' => $perUser,
            'daily' => $daily,
        ];
    }

    /**
     * Items grouped by linked task (group_by=task, unlinked items are skipped)
     * or by normalized title (group_by=title, LOWER(TRIM(title))).
     *
     * @param  int[]  $userIds  empty = all users
     */
    public function byTask(string $start, string $end, array $userIds = [], string $groupBy = 'task', bool $includeOpen = false): array
    {
        [$start, $end] = $this->normalizeRange($start, $end);
        $userIds = $this->normalizeIds($userIds);
        $groupBy = $groupBy === 'title' ? 'title' : 'task';

        $query = $this->itemsWithSessions($start, $end, $userIds, $includeOpen)
            ->leftJoin('tasks', 'tasks.id', '=', 'i.task_id')
            ->leftJoin('sections', 'sections.id', '=', 'tasks.section_id')
            ->leftJoin('projects', 'projects.id', '=', 'sections.project_id')
            ->selectRaw('COUNT(i.id) AS occurrences')
            ->selectRaw('COUNT(DISTINCT s.id) AS sessions_count')
            ->selectRaw("SUM(CASE WHEN i.outcome = 'done' THEN 1 ELSE 0 END) AS done")
            ->selectRaw("SUM(CASE WHEN i.outcome = 'partial' THEN 1 ELSE 0 END) AS partial")
            ->selectRaw("SUM(CASE WHEN i.outcome = 'not_done' THEN 1 ELSE 0 END) AS not_done")
            ->selectRaw("SUM(CASE WHEN i.outcome = 'pending' THEN 1 ELSE 0 END) AS pending")
            ->selectRaw('COALESCE(SUM(i.estimated_minutes), 0) AS estimated_minutes_total')
            ->selectRaw('MIN(s.work_date) AS first_date')
            ->selectRaw('MAX(s.work_date) AS last_date')
            ->selectRaw('SUM(CASE WHEN i.carried_from_item_id IS NOT NULL THEN 1 ELSE 0 END) AS carried_over_count')
            ->selectRaw('MAX(tasks.name) AS task_name')
            ->selectRaw('MAX(projects.name) AS project_name')
            ->orderByDesc('occurrences')
            ->limit(self::BY_TASK_MAX_ROWS);

        if ($groupBy === 'task') {
            $query
                ->whereNotNull('i.task_id')
                ->addSelect('i.task_id')
                ->selectRaw('MIN(i.title) AS title')
                ->groupBy('i.task_id')
                ->orderBy('i.task_id');
        } else {
            $query
                ->selectRaw('LOWER(TRIM(i.title)) AS title_key')
                ->selectRaw('MAX(i.task_id) AS task_id')
                ->selectRaw('MIN(i.title) AS title')
                ->groupByRaw('LOWER(TRIM(i.title))')
                ->orderBy('title_key');
        }

        $rows = $query->get();

        // Distinct users per group (second query: portable, no GROUP_CONCAT limits)
        $userMap = $this->usersPerGroup($start, $end, $userIds, $includeOpen, $groupBy, $rows);

        $result = $rows->map(function ($row) use ($groupBy, $userMap) {
            $key = $groupBy === 'task' ? (string) $row->task_id : (string) $row->title_key;
            $done = (int) $row->done;
            $partial = (int) $row->partial;
            $total = (int) $row->occurrences;

            return [
                'task_id' => $row->task_id !== null ? (int) $row->task_id : null,
                'task_name' => $row->task_name,
                'project_name' => $row->project_name,
                'title' => $groupBy === 'title' ? (string) $row->title_key : (string) $row->title,
                'occurrences' => $total,
                'sessions_count' => (int) $row->sessions_count,
                'users' => $userMap[$key] ?? [],
                'done' => $done,
                'partial' => $partial,
                'not_done' => (int) $row->not_done,
                'pending' => (int) $row->pending,
                'completion_pct' => WorkSession::completionPct($done, $partial, $total),
                'estimated_minutes_total' => (int) $row->estimated_minutes_total,
                'first_date' => $this->dateString($row->first_date),
                'last_date' => $this->dateString($row->last_date),
                'carried_over_count' => (int) $row->carried_over_count,
            ];
        })->values()->all();

        return [
            'period' => [
                'start' => $start,
                'end' => $end,
                'include_open' => $includeOpen,
                'user_ids' => $userIds,
            ],
            'group_by' => $groupBy,
            'rows' => $result,
        ];
    }

    /**
     * Per-user stats for a calendar month (confirmed sessions only), keyed by
     * user_id. Every requested id is present (zero-filled when no data).
     *
     * @param  int[]  $userIds  empty = only users with data in that month
     * @return array<int, array{sessions_count:int,items_total:int,done:int,partial:int,not_done:int,completion_pct:?float}>
     */
    public function monthlyStatsForUsers(int $year, int $month, array $userIds = []): array
    {
        [$start, $end] = $this->monthRange($year, $month);
        $userIds = $this->normalizeIds($userIds);

        $rows = $this->sessionsWithItems($start, $end, $userIds, false)
            ->select('s.user_id')
            ->selectRaw('COUNT(DISTINCT s.id) AS sessions_count')
            ->addSelect($this->itemAggregates())
            ->groupBy('s.user_id')
            ->get();

        $stats = [];
        foreach ($rows as $row) {
            $done = (int) $row->done;
            $partial = (int) $row->partial;
            $total = (int) $row->items_total;

            $stats[(int) $row->user_id] = [
                'sessions_count' => (int) $row->sessions_count,
                'items_total' => $total,
                'done' => $done,
                'partial' => $partial,
                'not_done' => (int) $row->not_done,
                'completion_pct' => WorkSession::completionPct($done, $partial, $total),
            ];
        }

        foreach ($userIds as $id) {
            $stats[$id] ??= $this->emptyStats();
        }

        return $stats;
    }

    /**
     * Full month detail for one user (PDF): stats + every session of the
     * month with its items (linked task and project names included).
     */
    public function monthlyDetailForUser(User $user, int $year, int $month): array
    {
        [$start, $end] = $this->monthRange($year, $month);

        $stats = $this->monthlyStatsForUsers($year, $month, [$user->id])[$user->id];

        $sessions = DB::table('work_sessions as s')
            ->where('s.user_id', $user->id)
            ->whereBetween('s.work_date', [$start, $end])
            ->orderBy('s.work_date')
            ->get(['s.id', 's.work_date', 's.status', 's.started_at', 's.confirmed_at', 's.summary_note']);

        $items = DB::table('work_session_items as i')
            ->join('work_sessions as s', 's.id', '=', 'i.work_session_id')
            ->leftJoin('tasks', 'tasks.id', '=', 'i.task_id')
            ->leftJoin('sections', 'sections.id', '=', 'tasks.section_id')
            ->leftJoin('projects', 'projects.id', '=', 'sections.project_id')
            ->where('s.user_id', $user->id)
            ->whereBetween('s.work_date', [$start, $end])
            ->orderBy('i.work_session_id')
            ->orderBy('i.sort_order')
            ->orderBy('i.id')
            ->get([
                'i.id', 'i.work_session_id', 'i.task_id', 'i.title', 'i.description', 'i.priority',
                'i.estimated_minutes', 'i.outcome', 'i.outcome_note', 'i.carried_from_item_id',
                'tasks.name as task_name', 'projects.name as project_name',
            ])
            ->groupBy('work_session_id');

        $sessionList = $sessions->map(function ($session) use ($items) {
            $sessionItems = collect($items->get($session->id, []))->map(fn ($i) => [
                'id' => (int) $i->id,
                'task_id' => $i->task_id !== null ? (int) $i->task_id : null,
                'task_name' => $i->task_name,
                'project_name' => $i->project_name,
                'title' => $i->title,
                'description' => $i->description,
                'priority' => $i->priority,
                'estimated_minutes' => $i->estimated_minutes !== null ? (int) $i->estimated_minutes : null,
                'outcome' => $i->outcome,
                'outcome_note' => $i->outcome_note,
                'carried_over' => $i->carried_from_item_id !== null,
            ])->values();

            $done = $sessionItems->where('outcome', WorkSessionItem::OUTCOME_DONE)->count();
            $partial = $sessionItems->where('outcome', WorkSessionItem::OUTCOME_PARTIAL)->count();
            $notDone = $sessionItems->where('outcome', WorkSessionItem::OUTCOME_NOT_DONE)->count();
            $pending = $sessionItems->where('outcome', WorkSessionItem::OUTCOME_PENDING)->count();

            return [
                'id' => (int) $session->id,
                'work_date' => $this->dateString($session->work_date),
                'status' => $session->status,
                'started_at' => $session->started_at,
                'confirmed_at' => $session->confirmed_at,
                'summary_note' => $session->summary_note,
                'items_total' => $sessionItems->count(),
                'done' => $done,
                'partial' => $partial,
                'not_done' => $notDone,
                'pending' => $pending,
                'completion_pct' => WorkSession::completionPct($done, $partial, $sessionItems->count()),
                'estimated_minutes_total' => (int) $sessionItems->sum('estimated_minutes'),
                'items' => $sessionItems->all(),
            ];
        })->values()->all();

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
            'year' => $year,
            'month' => $month,
            'period' => [
                'start' => $start,
                'end' => $end,
                'label' => Carbon::createFromDate($year, $month, 1)->format('F Y'),
            ],
            'stats' => $stats,
            'sessions' => $sessionList,
        ];
    }

    /** Zero-filled stats entry (public so callers can pad missing users). */
    public function emptyStats(): array
    {
        return [
            'sessions_count' => 0,
            'items_total' => 0,
            'done' => 0,
            'partial' => 0,
            'not_done' => 0,
            'completion_pct' => null,
        ];
    }

    // ─── Query building ───────────────────────────────────────────────

    /** work_sessions LEFT JOIN items, filtered by range / users / status. */
    private function sessionsWithItems(string $start, string $end, array $userIds, bool $includeOpen): Builder
    {
        $query = DB::table('work_sessions as s')
            ->leftJoin('work_session_items as i', 'i.work_session_id', '=', 's.id')
            ->whereBetween('s.work_date', [$start, $end]);

        return $this->applyFilters($query, $userIds, $includeOpen);
    }

    /** work_session_items INNER JOIN sessions (only rows with items). */
    private function itemsWithSessions(string $start, string $end, array $userIds, bool $includeOpen): Builder
    {
        $query = DB::table('work_session_items as i')
            ->join('work_sessions as s', 's.id', '=', 'i.work_session_id')
            ->whereBetween('s.work_date', [$start, $end]);

        return $this->applyFilters($query, $userIds, $includeOpen);
    }

    private function applyFilters(Builder $query, array $userIds, bool $includeOpen): Builder
    {
        if (! $includeOpen) {
            $query->where('s.status', WorkSession::STATUS_CONFIRMED);
        }

        if ($userIds !== []) {
            $query->whereIn('s.user_id', $userIds);
        }

        return $query;
    }

    /** Item outcome counters, shared by every aggregate query. */
    private function itemAggregates(): array
    {
        return [
            DB::raw('COUNT(i.id) AS items_total'),
            DB::raw("SUM(CASE WHEN i.outcome = 'done' THEN 1 ELSE 0 END) AS done"),
            DB::raw("SUM(CASE WHEN i.outcome = 'partial' THEN 1 ELSE 0 END) AS partial"),
            DB::raw("SUM(CASE WHEN i.outcome = 'not_done' THEN 1 ELSE 0 END) AS not_done"),
            DB::raw("SUM(CASE WHEN i.outcome = 'pending' THEN 1 ELSE 0 END) AS pending"),
            DB::raw('COALESCE(SUM(i.estimated_minutes), 0) AS estimated_minutes_total'),
        ];
    }

    /**
     * Distinct {user_id, user_name} per by-task group.
     *
     * @return array<string, array<int, array{user_id:int,user_name:string}>>
     */
    private function usersPerGroup(string $start, string $end, array $userIds, bool $includeOpen, string $groupBy, Collection $rows): array
    {
        if ($rows->isEmpty()) {
            return [];
        }

        $query = $this->itemsWithSessions($start, $end, $userIds, $includeOpen)
            ->distinct()
            ->select('s.user_id');

        if ($groupBy === 'task') {
            $query->addSelect('i.task_id as group_key')
                ->whereIn('i.task_id', $rows->pluck('task_id')->all());
        } else {
            $query->selectRaw('LOWER(TRIM(i.title)) AS group_key')
                ->whereIn(DB::raw('LOWER(TRIM(i.title))'), $rows->pluck('title_key')->all());
        }

        $pairs = $query->get();
        $users = $this->loadUsers($pairs->pluck('user_id')->unique()->all());

        $map = [];
        foreach ($pairs as $pair) {
            $user = $users->get((int) $pair->user_id);
            $map[(string) $pair->group_key][] = [
                'user_id' => (int) $pair->user_id,
                'user_name' => $user?->name ?? 'Unknown',
            ];
        }

        foreach ($map as &$list) {
            usort($list, fn ($a, $b) => strnatcasecmp($a['user_name'], $b['user_name']));
        }
        unset($list);

        return $map;
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /** @return Collection<int, User> keyed by id */
    private function loadUsers(array $ids): Collection
    {
        if ($ids === []) {
            return collect();
        }

        return User::whereIn('id', $ids)->get(['id', 'name', 'email', 'avatar_path'])->keyBy('id');
    }

    /** @return array{0:string,1:string} normalized Y-m-d bounds */
    private function normalizeRange(string $start, string $end): array
    {
        return [
            Carbon::parse($start)->toDateString(),
            Carbon::parse($end)->toDateString(),
        ];
    }

    /** @return array{0:string,1:string} first/last day of the month */
    private function monthRange(int $year, int $month): array
    {
        $first = Carbon::createFromDate($year, $month, 1)->startOfMonth();

        return [$first->toDateString(), $first->copy()->endOfMonth()->toDateString()];
    }

    /** @return int[] distinct positive ints */
    private function normalizeIds(array $ids): array
    {
        return array_values(array_unique(array_filter(array_map('intval', $ids), fn ($id) => $id > 0)));
    }

    /** Dates come back as "Y-m-d" (SQLite/MySQL) or "Y-m-d 00:00:00"; keep only the date. */
    private function dateString(?string $value): ?string
    {
        return $value === null ? null : substr($value, 0, 10);
    }
}
