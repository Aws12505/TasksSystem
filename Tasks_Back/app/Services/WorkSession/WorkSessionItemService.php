<?php

namespace App\Services\WorkSession;

use App\Events\WorkSessionUpdated;
use App\Exceptions\WorkSessionException;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Item CRUD inside an open session, plus the "assignable tasks" picker.
 */
class WorkSessionItemService
{
    public function __construct(private WorkSessionService $sessions) {}

    public function find(WorkSession $session, int $itemId): ?WorkSessionItem
    {
        return $session->items()->with($this->sessions->taskWith('task'))->find($itemId);
    }

    public function add(WorkSession $session, User $user, array $data): WorkSessionItem
    {
        $this->assertOpen($session);

        if (! empty($data['task_id'])) {
            $this->assertTaskAssignable($user, (int) $data['task_id']);
        }

        $maxSort = $session->items()->max('sort_order');

        $item = $session->items()->create([
            'task_id' => $data['task_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'estimated_minutes' => $data['estimated_minutes'] ?? null,
            'sort_order' => $maxSort === null ? 0 : ((int) $maxSort) + 1,
            'outcome' => WorkSessionItem::OUTCOME_PENDING,
        ]);

        $this->broadcast($session);

        return $item->load($this->sessions->taskWith('task'));
    }

    public function update(WorkSession $session, WorkSessionItem $item, User $user, array $data): WorkSessionItem
    {
        $this->assertOpen($session);

        if (array_key_exists('task_id', $data) && $data['task_id'] !== null) {
            $this->assertTaskAssignable($user, (int) $data['task_id']);
        }

        $item->fill(array_intersect_key($data, array_flip([
            'task_id', 'title', 'description', 'priority', 'estimated_minutes',
        ])));
        $item->save();

        $this->broadcast($session);

        return $item->load($this->sessions->taskWith('task'));
    }

    /** Deletes the item and compacts sort_order (0..n-1) for the rest. */
    public function delete(WorkSession $session, WorkSessionItem $item): void
    {
        $this->assertOpen($session);

        DB::transaction(function () use ($session, $item) {
            $item->delete();

            $session->items()->get()->values()->each(function (WorkSessionItem $i, int $index) {
                if ($i->sort_order !== $index) {
                    $i->sort_order = $index;
                    $i->save();
                }
            });
        });

        $this->broadcast($session);
    }

    /** $itemIds must be exactly the session's item id set, in the desired order. */
    public function reorder(WorkSession $session, array $itemIds): Collection
    {
        $this->assertOpen($session);

        $ids = array_map('intval', $itemIds);
        $existing = $session->items()->pluck('id')->map(fn ($v) => (int) $v)->all();

        $a = $ids;
        $b = $existing;
        sort($a);
        sort($b);
        if ($a !== $b) {
            throw new WorkSessionException('The reorder list must contain every item of the session exactly once.');
        }

        DB::transaction(function () use ($session, $ids) {
            foreach ($ids as $index => $id) {
                $session->items()->where('id', $id)->update(['sort_order' => $index]);
            }
        });

        $this->broadcast($session);

        return $session->items()->with($this->sessions->taskWith('task'))->get();
    }

    /** Quick outcome toggle; completed_at is set for final outcomes, cleared for pending. */
    public function setOutcome(WorkSession $session, WorkSessionItem $item, string $outcome, ?string $note = null): WorkSessionItem
    {
        $this->assertOpen($session);

        $item->outcome = $outcome;
        $item->outcome_note = $note;
        $item->completed_at = $outcome === WorkSessionItem::OUTCOME_PENDING ? null : now();
        $item->save();

        $this->broadcast($session);

        return $item->load($this->sessions->taskWith('task'));
    }

    /**
     * Tasks assigned to $user that are not done/rated, for the item picker.
     *
     * @return array<int, array{id:int,name:string,priority:string,status:string,due_date:?string,project_name:?string}>
     */
    public function assignableTasks(User $user, ?string $search = null): array
    {
        $query = $this->assignableTaskQuery($user)
            ->with([
                'section' => fn ($q) => $q->withoutGlobalScopes()->select('id', 'name', 'project_id'),
                'section.project' => fn ($q) => $q->withoutGlobalScopes()->select('id', 'name'),
            ])
            ->select('tasks.id', 'tasks.name', 'tasks.priority', 'tasks.status', 'tasks.due_date', 'tasks.section_id');

        if ($search !== null && trim($search) !== '') {
            // Escape LIKE wildcards so "%" and "_" in the term match literally (portable ESCAPE char)
            $term = addcslashes(mb_strtolower(trim($search)), '%_!');
            $query->whereRaw("LOWER(tasks.name) LIKE ? ESCAPE '!'", ['%'.$term.'%']);
        }

        return $query->orderBy('tasks.due_date')
            ->orderBy('tasks.id')
            ->limit(200)
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'priority' => $t->priority,
                'status' => $t->status,
                'due_date' => $t->due_date?->format('Y-m-d'),
                'project_name' => $t->section?->project?->name,
            ])
            ->values()
            ->all();
    }

    // ─── Guards ───────────────────────────────────────────────────────

    private function assertOpen(WorkSession $session): void
    {
        $this->sessions->assertOpen($session);
    }

    private function assertTaskAssignable(User $user, int $taskId): void
    {
        $ok = $this->assignableTaskQuery($user)->where('tasks.id', $taskId)->exists();

        if (! $ok) {
            throw new WorkSessionException('The selected task is not assigned to you or is already completed.');
        }
    }

    private function assignableTaskQuery(User $user)
    {
        return Task::withoutGlobalScopes()
            ->whereHas('assignedUsers', fn ($q) => $q->where('users.id', $user->id))
            ->whereNotIn('tasks.status', ['done', 'rated']);
    }

    private function broadcast(WorkSession $session): void
    {
        event(new WorkSessionUpdated($session, 'items_changed'));
    }
}
