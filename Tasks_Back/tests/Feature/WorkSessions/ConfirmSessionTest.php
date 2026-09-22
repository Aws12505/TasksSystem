<?php

namespace Tests\Feature\WorkSessions;

use App\Events\WorkSessionUpdated;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Support\Facades\Event;

class ConfirmSessionTest extends WorkSessionTestCase
{
    public function test_confirm_with_all_outcomes_locks_session(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        [$a, $b, $c] = WorkSessionItem::factory()->for($session, 'session')->count(3)->create()->all();
        $this->actingAsUser($user);

        $res = $this->postJson("/api/work-sessions/{$session->id}/confirm", [
            'items' => [
                ['id' => $a->id, 'outcome' => 'done'],
                ['id' => $b->id, 'outcome' => 'partial', 'outcome_note' => 'half'],
                ['id' => $c->id, 'outcome' => 'not_done', 'outcome_note' => 'blocked'],
            ],
            'summary_note' => 'Good day',
        ]);

        $res->assertOk()
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.summary_note', 'Good day')
            ->assertJsonCount(3, 'data.items');
        $this->assertNotNull($res->json('data.confirmed_at'));

        $this->assertSame('done', $a->fresh()->outcome);
        $this->assertSame('partial', $b->fresh()->outcome);
        $this->assertSame('half', $b->fresh()->outcome_note);
        $this->assertSame('not_done', $c->fresh()->outcome);
        $this->assertNotNull($a->fresh()->completed_at);

        // Locked: summary + confirm again both 400.
        $this->putJson("/api/work-sessions/{$session->id}", ['summary_note' => 'edit'])->assertStatus(400);
        $this->postJson("/api/work-sessions/{$session->id}/confirm", [
            'items' => [['id' => $a->id, 'outcome' => 'done'], ['id' => $b->id, 'outcome' => 'done'], ['id' => $c->id, 'outcome' => 'done']],
        ])->assertStatus(400);
        $this->assertSame('partial', $b->fresh()->outcome);
    }

    public function test_confirm_dispatches_broadcast_event(): void
    {
        Event::fake([WorkSessionUpdated::class]);

        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $item = WorkSessionItem::factory()->for($session, 'session')->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/confirm", [
            'items' => [['id' => $item->id, 'outcome' => 'done']],
        ])->assertOk();

        Event::assertDispatched(WorkSessionUpdated::class, fn (WorkSessionUpdated $e) => $e->action === 'confirmed');
    }

    public function test_confirm_missing_an_item_returns_400_and_changes_nothing(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        [$a, $b] = WorkSessionItem::factory()->for($session, 'session')->count(2)->create()->all();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/confirm", [
            'items' => [['id' => $a->id, 'outcome' => 'done']],
        ])->assertStatus(400)->assertJsonPath('success', false);

        // Extra foreign id also rejected.
        $this->postJson("/api/work-sessions/{$session->id}/confirm", [
            'items' => [
                ['id' => $a->id, 'outcome' => 'done'],
                ['id' => $b->id, 'outcome' => 'done'],
                ['id' => 999999, 'outcome' => 'done'],
            ],
        ])->assertStatus(400);

        $this->assertSame('open', $session->fresh()->status);
        $this->assertNull($session->fresh()->confirmed_at);
        $this->assertSame('pending', $a->fresh()->outcome);
        $this->assertSame('pending', $b->fresh()->outcome);
    }

    public function test_confirm_validation_rejects_pending_outcome_and_empty_items(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $item = WorkSessionItem::factory()->for($session, 'session')->create();
        $this->actingAsUser($user);

        $this->postJson("/api/work-sessions/{$session->id}/confirm", [
            'items' => [['id' => $item->id, 'outcome' => 'pending']],
        ])->assertStatus(422)->assertJsonValidationErrors(['items.0.outcome']);

        $this->postJson("/api/work-sessions/{$session->id}/confirm", ['items' => []])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
    }

    public function test_confirm_empty_session_returns_400(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        // Validation requires min:1 items, and the service rejects a mismatch anyway.
        $this->postJson("/api/work-sessions/{$session->id}/confirm", [
            'items' => [['id' => 1, 'outcome' => 'done']],
        ])->assertStatus(400);
    }

    public function test_update_summary_on_open_session(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $this->putJson("/api/work-sessions/{$session->id}", ['summary_note' => 'Notes for today'])
            ->assertOk()
            ->assertJsonPath('data.summary_note', 'Notes for today');

        $this->putJson("/api/work-sessions/{$session->id}", ['summary_note' => null])
            ->assertOk()
            ->assertJsonPath('data.summary_note', null);
    }

    public function test_show_returns_items_with_task_and_other_users_session_is_404(): void
    {
        $user = $this->employee();
        $taskId = $this->makeTask($user, 'pending', ['name' => 'Visible task']);
        $session = WorkSession::factory()->for($user)->create();
        WorkSessionItem::factory()->for($session, 'session')->create(['task_id' => $taskId]);

        $foreign = WorkSession::factory()->for($this->employee())->create();
        $this->actingAsUser($user);

        $this->getJson("/api/work-sessions/{$session->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $session->id)
            ->assertJsonPath('data.items.0.task.name', 'Visible task')
            ->assertJsonStructure(['data' => ['items' => [['task' => ['id', 'name', 'status', 'priority']]]]]);

        $this->getJson("/api/work-sessions/{$foreign->id}")
            ->assertStatus(404)
            ->assertExactJson(['success' => false, 'data' => null, 'message' => 'Work session not found']);

        $this->postJson("/api/work-sessions/{$foreign->id}/confirm", [
            'items' => [['id' => 1, 'outcome' => 'done']],
        ])->assertStatus(404);

        $this->putJson("/api/work-sessions/{$foreign->id}", ['summary_note' => 'x'])->assertStatus(404);
    }
}
