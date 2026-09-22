<?php

namespace Tests\Feature\WorkSessions;

use App\Events\WorkSessionUpdated;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Support\Facades\Event;

class AdminSessionTest extends WorkSessionTestCase
{
    public function test_employee_gets_403_on_admin_routes(): void
    {
        $user = $this->employee();
        $session = WorkSession::factory()->for($user)->confirmed()->create();
        $this->actingAsUser($user);

        $this->getJson('/api/work-sessions/admin/users')->assertStatus(403);
        $this->getJson('/api/work-sessions/admin/sessions')->assertStatus(403);
        $this->getJson("/api/work-sessions/admin/sessions/{$session->id}")->assertStatus(403);
        $this->postJson("/api/work-sessions/admin/sessions/{$session->id}/reopen")->assertStatus(403);

        $this->assertSame('confirmed', $session->fresh()->status);
    }

    public function test_admin_users_lists_everyone_ordered_by_name(): void
    {
        $this->employee(['name' => 'Zed']);
        $this->employee(['name' => 'Amy']);
        $admin = $this->admin(['name' => 'Mid']);
        $this->actingAsUser($admin);

        $res = $this->getJson('/api/work-sessions/admin/users');

        $res->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.name', 'Amy')
            ->assertJsonPath('data.1.name', 'Mid')
            ->assertJsonPath('data.2.name', 'Zed')
            ->assertJsonStructure(['data' => [['id', 'name', 'email', 'avatar_url']]]);
    }

    public function test_admin_index_lists_all_users_sessions_with_filters(): void
    {
        $alice = $this->employee(['name' => 'Alice']);
        $bob = $this->employee(['name' => 'Bob']);

        $a1 = WorkSession::factory()->for($alice)->confirmed()->onDate('2026-09-01')->create();
        WorkSessionItem::factory()->for($a1, 'session')->done()->count(2)->create();
        WorkSessionItem::factory()->for($a1, 'session')->notDone()->create();
        $a2 = WorkSession::factory()->for($alice)->onDate('2026-09-03')->create();
        $b1 = WorkSession::factory()->for($bob)->confirmed()->onDate('2026-09-02')->create();

        $this->actingAsUser($this->admin());

        $res = $this->getJson('/api/work-sessions/admin/sessions');

        $res->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.id', $a2->id)
            ->assertJsonPath('data.1.id', $b1->id)
            ->assertJsonPath('data.2.id', $a1->id)
            ->assertJsonPath('data.2.user.name', 'Alice')
            ->assertJsonPath('data.2.items_count', 3)
            ->assertJsonPath('data.2.done_count', 2)
            ->assertJsonPath('data.2.completion_pct', 66.67)
            ->assertJsonStructure([
                'data' => [['user' => ['id', 'name', 'avatar_url']]],
                'pagination' => ['current_page', 'total', 'per_page', 'last_page', 'from', 'to'],
            ]);

        $this->getJson("/api/work-sessions/admin/sessions?user_ids[]={$bob->id}")
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $b1->id);

        $this->getJson('/api/work-sessions/admin/sessions?status=open')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $a2->id);

        $this->getJson('/api/work-sessions/admin/sessions?start_date=2026-09-01&end_date=2026-09-02')
            ->assertOk()->assertJsonCount(2, 'data');

        $this->getJson('/api/work-sessions/admin/sessions?per_page=2')
            ->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('pagination.total', 3)
            ->assertJsonPath('pagination.last_page', 2);

        $this->getJson('/api/work-sessions/admin/sessions?per_page=500')->assertStatus(422);
    }

    public function test_admin_show_returns_any_users_session_with_task(): void
    {
        $alice = $this->employee(['name' => 'Alice']);
        $taskId = $this->makeTask($alice, 'pending', ['name' => 'Alice task']);
        $session = WorkSession::factory()->for($alice)->create();
        WorkSessionItem::factory()->for($session, 'session')->create(['task_id' => $taskId]);

        $this->actingAsUser($this->admin());

        $this->getJson("/api/work-sessions/admin/sessions/{$session->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $session->id)
            ->assertJsonPath('data.user.name', 'Alice')
            ->assertJsonPath('data.reopened_by', null)
            ->assertJsonPath('data.items.0.task.name', 'Alice task');

        $this->getJson('/api/work-sessions/admin/sessions/999999')
            ->assertStatus(404)
            ->assertExactJson(['success' => false, 'data' => null, 'message' => 'Work session not found']);
    }

    public function test_reopen_confirmed_session(): void
    {
        Event::fake([WorkSessionUpdated::class]);

        $alice = $this->employee();
        $session = WorkSession::factory()->for($alice)->confirmed()->create(['summary_note' => 'done']);
        $item = WorkSessionItem::factory()->for($session, 'session')->done()->create();
        $admin = $this->admin(['name' => 'Boss']);
        $this->actingAsUser($admin);

        $res = $this->postJson("/api/work-sessions/admin/sessions/{$session->id}/reopen");

        // The raw FK stays an integer; the admin who reopened is exposed
        // separately under "reopened_by_user".
        $res->assertOk()
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.confirmed_at', null)
            ->assertJsonPath('data.reopened_by', $admin->id)
            ->assertJsonPath('data.reopened_by_user.id', $admin->id)
            ->assertJsonPath('data.reopened_by_user.name', 'Boss');
        $this->assertNotNull($res->json('data.reopened_at'));

        $fresh = $session->fresh();
        $this->assertSame('open', $fresh->status);
        $this->assertNull($fresh->confirmed_at);
        $this->assertSame($admin->id, $fresh->reopened_by);
        // Outcomes are preserved on reopen.
        $this->assertSame('done', $item->fresh()->outcome);

        Event::assertDispatched(WorkSessionUpdated::class, fn (WorkSessionUpdated $e) => $e->action === 'reopened');

        // Employee can edit again.
        $this->actingAsUser($alice);
        $this->putJson("/api/work-sessions/{$session->id}", ['summary_note' => 'revised'])->assertOk();
    }

    public function test_reopen_open_session_returns_400(): void
    {
        $session = WorkSession::factory()->for($this->employee())->create();
        $this->actingAsUser($this->admin());

        $this->postJson("/api/work-sessions/admin/sessions/{$session->id}/reopen")
            ->assertStatus(400)
            ->assertJsonPath('success', false);

        $this->assertNull($session->fresh()->reopened_at);

        $this->postJson('/api/work-sessions/admin/sessions/999999/reopen')->assertStatus(404);
    }

    public function test_admin_can_only_see_own_sessions_on_employee_routes_but_all_on_admin_routes(): void
    {
        $alice = $this->employee();
        $foreign = WorkSession::factory()->for($alice)->create();
        $admin = $this->admin();
        $this->actingAsUser($admin);

        // Employee-side routes are strictly "mine" regardless of permissions.
        $this->getJson("/api/work-sessions/{$foreign->id}")->assertStatus(404);
        $this->getJson('/api/work-sessions')->assertOk()->assertJsonCount(0, 'data');

        // Admin-side routes see everything.
        $this->getJson("/api/work-sessions/admin/sessions/{$foreign->id}")->assertOk();
    }
}
