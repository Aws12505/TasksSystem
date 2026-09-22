<?php

namespace App\Services\WorkSession;

use App\Events\WorkSessionUpdated;
use App\Exceptions\WorkSessionException;
use App\Models\User;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

/**
 * Session lifecycle: start (with carry-over), list, summary, confirm, reopen.
 */
class WorkSessionService
{
    // ─── Lookups ──────────────────────────────────────────────────────

    public function companyToday(): string
    {
        return WorkSession::companyToday();
    }

    public function findToday(User $user): ?WorkSession
    {
        return WorkSession::forUser($user->id)
            ->where('work_date', $this->companyToday())
            ->with($this->itemsWithTask())
            ->first();
    }

    public function findForUser(User $user, int $id): ?WorkSession
    {
        return WorkSession::forUser($user->id)
            ->with($this->itemsWithTask())
            ->find($id);
    }

    /** Payload for GET /work-sessions/today. */
    public function todayPayload(User $user): array
    {
        $today = $this->companyToday();
        $session = $this->findToday($user);

        return [
            'today' => $today,
            'company_timezone' => config('app.company_timezone', 'UTC'),
            'session' => $session,
            'carry_over_candidates' => $session ? [] : $this->carryOverCandidates($user, $today)->values(),
            'previous_open_sessions' => WorkSession::forUser($user->id)
                ->open()
                ->where('work_date', '<', $today)
                ->orderByDesc('work_date')
                ->get(['id', 'work_date'])
                ->map(fn (WorkSession $s) => [
                    'id' => $s->id,
                    'work_date' => $s->work_date->format('Y-m-d'),
                ])
                ->values(),
        ];
    }

    /**
     * Unfinished items (partial / not_done, plus pending when the source
     * session is still open) from the user's most recent session before $today.
     * Each item carries `source_work_date`.
     */
    public function carryOverCandidates(User $user, string $today): Collection
    {
        $previous = WorkSession::forUser($user->id)
            ->where('work_date', '<', $today)
            ->orderByDesc('work_date')
            ->first();

        if (! $previous) {
            return new Collection;
        }

        $outcomes = [WorkSessionItem::OUTCOME_PARTIAL, WorkSessionItem::OUTCOME_NOT_DONE];
        if ($previous->isOpen()) {
            $outcomes[] = WorkSessionItem::OUTCOME_PENDING;
        }

        return $previous->items()
            ->whereIn('outcome', $outcomes)
            ->with($this->taskWith('task'))
            ->get()
            ->each(function (WorkSessionItem $item) use ($previous) {
                $item->setAttribute('source_work_date', $previous->work_date->format('Y-m-d'));
            });
    }

    // ─── Mutations ────────────────────────────────────────────────────

    /**
     * Open today's session for $user, optionally copying items from earlier
     * sessions (they must belong to the same user).
     */
    public function start(User $user, array $carryOverIds = []): WorkSession
    {
        $today = $this->companyToday();

        if (WorkSession::forUser($user->id)->where('work_date', $today)->exists()) {
            throw new WorkSessionException('A work session for today already exists.');
        }

        $carryOverIds = array_values(array_unique(array_map('intval', $carryOverIds)));

        $sources = new Collection;
        if ($carryOverIds !== []) {
            $sources = WorkSessionItem::whereIn('id', $carryOverIds)
                ->whereHas('session', fn ($q) => $q->withoutGlobalScope('user_scope')->where('user_id', $user->id))
                ->get()
                ->keyBy('id');

            $missing = array_diff($carryOverIds, $sources->keys()->all());
            if ($missing !== []) {
                throw new WorkSessionException('One or more carry-over items do not belong to your sessions.');
            }
        }

        try {
            $session = DB::transaction(function () use ($user, $today, $carryOverIds, $sources) {
                $session = WorkSession::create([
                    'user_id' => $user->id,
                    'work_date' => $today,
                    'status' => WorkSession::STATUS_OPEN,
                    'started_at' => now(),
                ]);

                $order = 0;
                foreach ($carryOverIds as $id) {
                    /** @var WorkSessionItem $src */
                    $src = $sources[$id];
                    $session->items()->create([
                        'task_id' => $src->task_id,
                        'title' => $src->title,
                        'description' => $src->description,
                        'priority' => $src->priority,
                        'estimated_minutes' => $src->estimated_minutes,
                        'sort_order' => $order++,
                        'outcome' => WorkSessionItem::OUTCOME_PENDING,
                        'carried_from_item_id' => $src->id,
                    ]);
                }

                return $session;
            });
        } catch (UniqueConstraintViolationException) {
            // Two concurrent starts raced past the exists() check; the unique
            // (user_id, work_date) index is the source of truth.
            throw new WorkSessionException('A work session for today already exists.');
        }

        $session->load($this->itemsWithTask());

        event(new WorkSessionUpdated($session, 'started'));

        return $session;
    }

    /** Own sessions, newest first, with counts + completion_pct. */
    public function listForUser(User $user, array $filters): LengthAwarePaginator
    {
        $query = WorkSession::forUser($user->id)
            ->between($filters['start_date'] ?? null, $filters['end_date'] ?? null);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = (int) ($filters['per_page'] ?? 15);
        $perPage = max(1, min(100, $perPage));

        $paginator = $this->withCounts($query)
            ->orderByDesc('work_date')
            ->orderByDesc('id')
            ->paginate($perPage);

        $paginator->setCollection($this->decorateCounts($paginator->getCollection()));

        return $paginator;
    }

    public function updateSummary(WorkSession $session, ?string $note): WorkSession
    {
        $this->assertOpen($session);

        $session->summary_note = $note;
        $session->save();

        return $session->load($this->itemsWithTask());
    }

    /**
     * End-of-day confirmation. $items = [['id'=>, 'outcome'=>, 'outcome_note'=>?], ...]
     * and must cover exactly the session's items.
     */
    public function confirm(WorkSession $session, array $items, ?string $summaryNote = null): WorkSession
    {
        $this->assertOpen($session);

        $existingIds = $session->items()->pluck('id')->map(fn ($v) => (int) $v)->sort()->values()->all();
        $postedIds = collect($items)->pluck('id')->map(fn ($v) => (int) $v)->unique()->sort()->values()->all();

        if ($existingIds === [] || $existingIds !== $postedIds) {
            throw new WorkSessionException('Every item in the session must be reviewed exactly once before confirming.');
        }

        DB::transaction(function () use ($session, $items, $summaryNote) {
            $now = now();

            foreach ($items as $row) {
                $session->items()
                    ->where('id', (int) $row['id'])
                    ->update([
                        'outcome' => $row['outcome'],
                        'outcome_note' => $row['outcome_note'] ?? null,
                        'completed_at' => $now,
                        'updated_at' => $now,
                    ]);
            }

            $session->status = WorkSession::STATUS_CONFIRMED;
            $session->confirmed_at = $now;
            if ($summaryNote !== null) {
                $session->summary_note = $summaryNote;
            }
            $session->save();
        });

        $session->refresh()->load($this->itemsWithTask());

        event(new WorkSessionUpdated($session, 'confirmed'));

        return $session;
    }

    /** Admin: unlock a confirmed session so the employee can edit it again. */
    public function reopen(WorkSession $session, User $admin): WorkSession
    {
        if (! $session->isConfirmed()) {
            throw new WorkSessionException('Only confirmed work sessions can be reopened.');
        }

        $session->status = WorkSession::STATUS_OPEN;
        $session->confirmed_at = null;
        $session->reopened_at = now();
        $session->reopened_by = $admin->id;
        $session->save();

        $session->refresh();

        event(new WorkSessionUpdated($session, 'reopened'));

        return $session;
    }

    // ─── Counts ───────────────────────────────────────────────────────

    /** Adds items_count / done_count / partial_count / not_done_count / pending_count. */
    public function withCounts(Builder $query): Builder
    {
        return $query->withCount([
            'items',
            'items as done_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_DONE),
            'items as partial_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_PARTIAL),
            'items as not_done_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_NOT_DONE),
            'items as pending_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_PENDING),
        ]);
    }

    /** Sets `completion_pct` on each session loaded through withCounts(). */
    public function decorateCounts(Collection $sessions): Collection
    {
        return $sessions->each(function (WorkSession $s) {
            $s->setAttribute('completion_pct', WorkSession::completionPct(
                (int) $s->done_count,
                (int) $s->partial_count,
                (int) $s->items_count
            ));
        });
    }

    // ─── Guards / helpers ─────────────────────────────────────────────

    public function assertOpen(WorkSession $session): void
    {
        if (! $session->isOpen()) {
            throw new WorkSessionException('This work session is confirmed and locked.');
        }
    }

    /**
     * Eager-load spec: items with their task, bypassing Task's user_scope and
     * selecting only the columns the UI needs.
     */
    public function itemsWithTask(): array
    {
        return $this->taskWith('items.task');
    }

    public function taskWith(string $relation): array
    {
        return [
            $relation => fn ($q) => $q->withoutGlobalScopes()->select('id', 'name', 'status', 'priority'),
        ];
    }
}
