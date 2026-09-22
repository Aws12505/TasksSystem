<?php

namespace Tests\Feature\WorkSessions;

use App\Events\WorkSessionUpdated;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Support\Facades\Event;

class SessionItemsTest extends WorkSessionTestCase
{
    public function test_add_item_returns_201_and_increments_sort_order(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $first = $this->postJson("/api/work-sessions/{$session->id}/items", [
            'title' => 'Write tests',
            'description' => 'Feature tests for sessions',
            'priority' => 'high',
            'estimated_minutes' => 120,
        ]);

        $first->assertStatus(201)
            ->assertJsonPath('data.title', 'Write tests')
            ->assertJsonPath('data.priority', 'high')
            ->assertJsonPath('data.estimated_minutes', 120)
            ->assertJsonPath('data.outcome', 'pending')
            ->assertJsonPath('data.sort_order', 0)
            ->assertJsonPath('data.task_id', null);

        $this->postJson("/api/work-sessions/{$session->id}/items", ['title' => 'Second'])
            ->assertStatus(201)
            ->assertJsonPath('data.sort_order', 1)
            ->assertJsonPath('data.priority', 'medium');
    }

    public function test_add_item_validation(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/items", [
            'priority' => 'urgent',
            'estimated_minutes' => 0,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'priority', 'estimated_minutes']);
    }

    public function test_add_item_with_assigned_task_links_it(): void
    {
        $user = $this->employee();
        $taskId = $this->makeTask($user, 'in_progress', ['name' => 'Linked task']);
        $session = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/items", [
            'title' => 'Work on linked task',
            'task_id' => $taskId,
        ])->assertStatus(201)
            ->assertJsonPath('data.task_id', $taskId)
            ->assertJsonPath('data.task.id', $taskId)
            ->assertJsonPath('data.task.name', 'Linked task');
    }

    public function test_add_item_with_unassigned_task_returns_400(): void
    {
        $user = $this->employee();
        $someoneElsesTask = $this->makeTask($this->employee());
        $myDoneTask = $this->makeTask($user, 'done');
        $session = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/items", [
            'title' => 'Nope',
            'task_id' => $someoneElsesTask,
        ])->assertStatus(400)->assertJsonPath('success', false);

        $this->postJson("/api/work-sessions/{$session->id}/items", [
            'title' => 'Nope',
            'task_id' => $myDoneTask,
        ])->assertStatus(400);

        $this->assertSame(0, $session->items()->count());
    }

    public function test_update_item(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $item = WorkSessionItem::factory()->for($session, 'session')->create(['title' => 'Old', 'priority' => 'low']);
        $this->actingAsUser($user);

        $this->putJson("/api/work-sessions/{$session->id}/items/{$item->id}", [
            'title' => 'New title',
            'priority' => 'critical',
            'estimated_minutes' => null,
        ])->assertOk()
            ->assertJsonPath('data.id', $item->id)
            ->assertJsonPath('data.title', 'New title')
            ->assertJsonPath('data.priority', 'critical')
            ->assertJsonPath('data.estimated_minutes', null);

        $this->putJson("/api/work-sessions/{$session->id}/items/{$item->id}", [
            'task_id' => $this->makeTask($this->employee()),
        ])->assertStatus(400);
    }

    public function test_delete_item_compacts_sort_order(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $a = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 0]);
        $b = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 1]);
        $c = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 2]);
        $this->actingAsUser($user);

        $this->deleteJson("/api/work-sessions/{$session->id}/items/{$b->id}")
            ->assertOk()
            ->assertJsonPath('data', null);

        $this->assertDatabaseMissing('work_session_items', ['id' => $b->id]);
        $this->assertSame(0, $a->fresh()->sort_order);
        $this->assertSame(1, $c->fresh()->sort_order);
    }

    public function test_reorder_items(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $a = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 0]);
        $b = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 1]);
        $c = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 2]);
        $this->actingAsUser($user);

        $res = $this->putJson("/api/work-sessions/{$session->id}/items/reorder", [
            'item_ids' => [$c->id, $a->id, $b->id],
        ]);

        $res->assertOk()
            ->assertJsonPath('data.0.id', $c->id)
            ->assertJsonPath('data.1.id', $a->id)
            ->assertJsonPath('data.2.id', $b->id);

        $this->assertSame(0, $c->fresh()->sort_order);
        $this->assertSame(1, $a->fresh()->sort_order);
        $this->assertSame(2, $b->fresh()->sort_order);
    }

    public function test_reorder_with_mismatched_set_returns_400(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $a = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 0]);
        $b = WorkSessionItem::factory()->for($session, 'session')->create(['sort_order' => 1]);
        $this->actingAsUser($user);

        // Missing one
        $this->putJson("/api/work-sessions/{$session->id}/items/reorder", ['item_ids' => [$b->id]])
            ->assertStatus(400);

        // Extra foreign id
        $this->putJson("/api/work-sessions/{$session->id}/items/reorder", ['item_ids' => [$b->id, $a->id, 999999]])
            ->assertStatus(400);

        $this->assertSame(0, $a->fresh()->sort_order);
        $this->assertSame(1, $b->fresh()->sort_order);
    }

    public function test_set_outcome_sets_and_clears_completed_at(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $item = WorkSessionItem::factory()->for($session, 'session')->create();
        $this->actingAsUser($user);

        $this->putJson("/api/work-sessions/{$session->id}/items/{$item->id}/outcome", [
            'outcome' => 'done',
            'outcome_note' => 'shipped',
        ])->assertOk()
            ->assertJsonPath('data.outcome', 'done')
            ->assertJsonPath('data.outcome_note', 'shipped');
        $this->assertNotNull($item->fresh()->completed_at);

        $this->putJson("/api/work-sessions/{$session->id}/items/{$item->id}/outcome", ['outcome' => 'pending'])
            ->assertOk()
            ->assertJsonPath('data.outcome', 'pending');
        $this->assertNull($item->fresh()->completed_at);

        $this->putJson("/api/work-sessions/{$session->id}/items/{$item->id}/outcome", ['outcome' => 'bogus'])
            ->assertStatus(422);
    }

    public function test_item_mutations_on_confirmed_session_return_400(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->confirmed()->create();
        $item = WorkSessionItem::factory()->for($session, 'session')->done()->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/items", ['title' => 'x'])->assertStatus(400);
        $this->putJson("/api/work-sessions/{$session->id}/items/{$item->id}", ['title' => 'x'])->assertStatus(400);
        $this->deleteJson("/api/work-sessions/{$session->id}/items/{$item->id}")->assertStatus(400);
        $this->putJson("/api/work-sessions/{$session->id}/items/reorder", ['item_ids' => [$item->id]])->assertStatus(400);
        $this->putJson("/api/work-sessions/{$session->id}/items/{$item->id}/outcome", ['outcome' => 'pending'])->assertStatus(400);

        $this->assertSame('done', $item->fresh()->outcome);
    }

    public function test_other_users_session_or_item_returns_404(): void
    {
        $user = $this->employee();
        $other = $this->employee();
        $foreign = WorkSession::factory()->for($other)->create();
        $foreignItem = WorkSessionItem::factory()->for($foreign, 'session')->create();
        $mine = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$foreign->id}/items", ['title' => 'x'])->assertStatus(404)
            ->assertJsonPath('message', 'Work session not found');
        // Item from another session, even with my session id in the URL.
        $this->putJson("/api/work-sessions/{$mine->id}/items/{$foreignItem->id}", ['title' => 'x'])->assertStatus(404);
        $this->deleteJson("/api/work-sessions/{$mine->id}/items/{$foreignItem->id}")->assertStatus(404);
    }

    public function test_item_mutations_broadcast_items_changed(): void
    {
        Event::fake([WorkSessionUpdated::class]);

        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/items", ['title' => 'x'])->assertStatus(201);

        Event::assertDispatched(WorkSessionUpdated::class, fn (WorkSessionUpdated $e) => $e->action === 'items_changed');
    }

    public function test_assignable_tasks_excludes_done_rated_and_other_users(): void
    {
        $user = $this->employee();
        $pending = $this->makeTask($user, 'pending', ['name' => 'Alpha pending', 'due_date' => '2026-10-02', 'project_name' => 'Proj A']);
        $inProgress = $this->makeTask($user, 'in_progress', ['name' => 'Beta progress', 'due_date' => '2026-10-01']);
        $this->makeTask($user, 'done', ['name' => 'Gamma done']);
        $this->makeTask($user, 'rated', ['name' => 'Delta rated']);
        $this->makeTask($this->employee(), 'pending', ['name' => 'Epsilon other']);
        $this->actingAsUser($user);

        $res = $this->getJson('/api/work-sessions/assignable-tasks');

        $res->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $inProgress)     // earlier due date first
            ->assertJsonPath('data.1.id', $pending)
            ->assertJsonPath('data.1.project_name', 'Proj A')
            ->assertJsonPath('data.1.due_date', '2026-10-02')
            ->assertJsonStructure(['data' => [['id', 'name', 'priority', 'status', 'due_date', 'project_name']]]);

        $this->getJson('/api/work-sessions/assignable-tasks?search=ALPHA')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Alpha pending');
    }
}
