<?php

namespace Tests\Feature\WorkSessions;

use App\Events\WorkSessionUpdated;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Support\Facades\Event;

class StartSessionTest extends WorkSessionTestCase
{
    public function test_start_creates_todays_session(): void
    {
        $user = $this->employee();
        $this->actingAsUser($user);

        $res = $this->postJson('/api/work-sessions');

        $res->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user_id', $user->id)
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.work_date', WorkSession::companyToday())
            ->assertJsonPath('data.items', []);

        $this->assertDatabaseHas('work_sessions', [
            'user_id' => $user->id,
            'work_date' => WorkSession::companyToday(),
            'status' => 'open',
        ]);
    }

    public function test_start_dispatches_broadcast_event(): void
    {
        Event::fake([WorkSessionUpdated::class]);

        $this->actingAsUser($this->employee());
        $this->postJson('/api/work-sessions')->assertStatus(201);

        Event::assertDispatched(WorkSessionUpdated::class, fn (WorkSessionUpdated $e) => $e->action === 'started');
    }

    public function test_starting_twice_returns_400(): void
    {
        $user = $this->employee();
        WorkSession::factory()->for($user)->create();
        $this->actingAsUser($user);

        $this->postJson('/api/work-sessions')
            ->assertStatus(400)
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null);

        $this->assertSame(1, WorkSession::forUser($user->id)->count());
    }

    public function test_carry_over_copies_items_and_links_source(): void
    {
        $user = $this->employee();
        $taskId = $this->makeTask($user);

        $yesterday = WorkSession::factory()->for($user)->confirmed()
            ->onDate(now('UTC')->subDay()->toDateString())->create();

        $partial = WorkSessionItem::factory()->for($yesterday, 'session')->partial()->create([
            'title' => 'Finish report',
            'description' => 'Half done',
            'priority' => 'high',
            'estimated_minutes' => 90,
            'task_id' => $taskId,
            'outcome_note' => 'ran out of time',
        ]);
        $notDone = WorkSessionItem::factory()->for($yesterday, 'session')->notDone()->create(['title' => 'Call client']);
        WorkSessionItem::factory()->for($yesterday, 'session')->done()->create(['title' => 'Already done']);

        $this->actingAsUser($user);

        $res = $this->postJson('/api/work-sessions', [
            'carry_over_item_ids' => [$partial->id, $notDone->id],
        ]);

        $res->assertStatus(201)->assertJsonCount(2, 'data.items');

        $items = $res->json('data.items');

        $this->assertSame('Finish report', $items[0]['title']);
        $this->assertSame('Half done', $items[0]['description']);
        $this->assertSame('high', $items[0]['priority']);
        $this->assertSame(90, $items[0]['estimated_minutes']);
        $this->assertSame($taskId, $items[0]['task_id']);
        $this->assertSame('pending', $items[0]['outcome']);
        $this->assertNull($items[0]['outcome_note']);
        $this->assertSame($partial->id, $items[0]['carried_from_item_id']);
        $this->assertSame(0, $items[0]['sort_order']);

        $this->assertSame('Call client', $items[1]['title']);
        $this->assertSame($notDone->id, $items[1]['carried_from_item_id']);
        $this->assertSame(1, $items[1]['sort_order']);

        // Source items untouched.
        $this->assertSame('partial', $partial->fresh()->outcome);
    }

    public function test_carry_over_rejects_items_from_another_user(): void
    {
        $user = $this->employee();
        $other = $this->employee();

        $otherSession = WorkSession::factory()->for($other)->confirmed()
            ->onDate(now('UTC')->subDay()->toDateString())->create();
        $foreign = WorkSessionItem::factory()->for($otherSession, 'session')->notDone()->create();

        $this->actingAsUser($user);

        $this->postJson('/api/work-sessions', ['carry_over_item_ids' => [$foreign->id]])
            ->assertStatus(400)
            ->assertJsonPath('success', false);

        $this->assertSame(0, WorkSession::forUser($user->id)->count());
    }

    public function test_carry_over_with_unknown_id_fails_validation(): void
    {
        $this->actingAsUser($this->employee());

        $this->postJson('/api/work-sessions', ['carry_over_item_ids' => [999999]])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['carry_over_item_ids.0']);
    }

    public function test_today_without_session_lists_candidates_and_open_sessions(): void
    {
        $user = $this->employee();
        $date = now('UTC')->subDays(2)->toDateString();

        $previous = WorkSession::factory()->for($user)->onDate($date)->create(); // still open
        $pending = WorkSessionItem::factory()->for($previous, 'session')->create(['title' => 'Pending one']);
        $partial = WorkSessionItem::factory()->for($previous, 'session')->partial()->create(['title' => 'Partial one']);
        WorkSessionItem::factory()->for($previous, 'session')->done()->create(['title' => 'Done one']);

        // Another user's data must never leak in.
        $otherSession = WorkSession::factory()->for($this->employee())->onDate($date)->create();
        WorkSessionItem::factory()->for($otherSession, 'session')->notDone()->create();

        $this->actingAsUser($user);

        $res = $this->getJson('/api/work-sessions/today');

        $res->assertOk()
            ->assertJsonPath('data.today', WorkSession::companyToday())
            ->assertJsonPath('data.company_timezone', 'UTC')
            ->assertJsonPath('data.session', null)
            ->assertJsonCount(2, 'data.carry_over_candidates')
            ->assertJsonCount(1, 'data.previous_open_sessions')
            ->assertJsonPath('data.previous_open_sessions.0.id', $previous->id)
            ->assertJsonPath('data.previous_open_sessions.0.work_date', $date);

        $candidateIds = collect($res->json('data.carry_over_candidates'))->pluck('id')->sort()->values()->all();
        $this->assertSame(collect([$pending->id, $partial->id])->sort()->values()->all(), $candidateIds);
        $this->assertSame($date, $res->json('data.carry_over_candidates.0.source_work_date'));
    }

    public function test_today_with_session_returns_it_with_items(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->create();
        WorkSessionItem::factory()->for($session, 'session')->count(2)->create();

        $this->actingAsUser($user);

        $this->getJson('/api/work-sessions/today')
            ->assertOk()
            ->assertJsonPath('data.session.id', $session->id)
            ->assertJsonCount(2, 'data.session.items')
            ->assertJsonPath('data.carry_over_candidates', [])
            ->assertJsonPath('data.previous_open_sessions', []);
    }

    public function test_index_lists_own_sessions_with_counts_and_pagination(): void
    {
        $user = $this->employee();
        $s1 = WorkSession::factory()->for($user)->confirmed()->onDate('2026-09-01')->create();
        WorkSessionItem::factory()->for($s1, 'session')->done()->count(3)->create();
        WorkSessionItem::factory()->for($s1, 'session')->partial()->count(2)->create();
        WorkSessionItem::factory()->for($s1, 'session')->notDone()->create();
        $s2 = WorkSession::factory()->for($user)->onDate('2026-09-02')->create();
        WorkSession::factory()->for($this->employee())->onDate('2026-09-03')->create(); // other user

        $this->actingAsUser($user);

        $res = $this->getJson('/api/work-sessions?per_page=10');

        $res->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $s2->id)
            ->assertJsonPath('data.1.id', $s1->id)
            ->assertJsonPath('data.1.items_count', 6)
            ->assertJsonPath('data.1.done_count', 3)
            ->assertJsonPath('data.1.partial_count', 2)
            ->assertJsonPath('data.1.not_done_count', 1)
            ->assertJsonPath('data.1.pending_count', 0)
            ->assertJsonPath('data.1.completion_pct', 66.67)
            ->assertJsonPath('data.0.completion_pct', null)
            ->assertJsonPath('pagination.total', 2)
            ->assertJsonPath('pagination.per_page', 10)
            ->assertJsonStructure(['pagination' => ['current_page', 'total', 'per_page', 'last_page', 'from', 'to']]);

        $this->getJson('/api/work-sessions?status=confirmed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $s1->id);

        $this->getJson('/api/work-sessions?start_date=2026-09-02&end_date=2026-09-02')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $s2->id);
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson('/api/work-sessions/today')->assertStatus(401);
        $this->postJson('/api/work-sessions')->assertStatus(401);
    }
}
