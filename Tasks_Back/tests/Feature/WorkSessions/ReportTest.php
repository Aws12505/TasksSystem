<?php

namespace Tests\Feature\WorkSessions;

use App\Models\User;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;

class ReportTest extends WorkSessionTestCase
{
    private const OVERVIEW = '/api/work-sessions/admin/reports/overview';

    private const BY_TASK = '/api/work-sessions/admin/reports/by-task';

    private User $admin;

    private User $alice;

    private User $bob;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->admin(['name' => 'Admin']);
        $this->alice = $this->employee(['name' => 'Alice']);
        $this->bob = $this->employee(['name' => 'Bob']);
    }

    // ─── Fixtures ────────────────────────────────────────────────────

    /**
     * Alice: 2026-09-10 confirmed (3 done, 2 partial, 1 not_done), 2026-09-11 confirmed (1 done).
     * Bob:   2026-09-10 confirmed (1 done, 1 not_done), 2026-09-12 OPEN (1 pending).
     *
     * @return array<string, WorkSession>
     */
    private function seedOverviewData(): array
    {
        $aliceDay1 = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->alice->id]);
        WorkSessionItem::factory()->count(3)->done()->create(['work_session_id' => $aliceDay1->id, 'estimated_minutes' => 30]);
        WorkSessionItem::factory()->count(2)->partial()->create(['work_session_id' => $aliceDay1->id, 'estimated_minutes' => 30]);
        WorkSessionItem::factory()->notDone()->create(['work_session_id' => $aliceDay1->id, 'estimated_minutes' => 30]);

        $aliceDay2 = WorkSession::factory()->confirmed()->onDate('2026-09-11')->create(['user_id' => $this->alice->id]);
        WorkSessionItem::factory()->done()->create(['work_session_id' => $aliceDay2->id, 'estimated_minutes' => 60]);

        $bobDay1 = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->bob->id]);
        WorkSessionItem::factory()->done()->create(['work_session_id' => $bobDay1->id, 'estimated_minutes' => 10]);
        WorkSessionItem::factory()->notDone()->create(['work_session_id' => $bobDay1->id, 'estimated_minutes' => 10]);

        $bobOpen = WorkSession::factory()->onDate('2026-09-12')->create(['user_id' => $this->bob->id]);
        WorkSessionItem::factory()->create(['work_session_id' => $bobOpen->id, 'estimated_minutes' => 45]);

        return compact('aliceDay1', 'aliceDay2', 'bobDay1', 'bobOpen');
    }

    // ─── Overview ────────────────────────────────────────────────────

    public function test_overview_completion_math_and_totals(): void
    {
        $this->seedOverviewData();

        $response = $this->actingAsUser($this->admin)
            ->getJson(self::OVERVIEW.'?start_date=2026-09-01&end_date=2026-09-30');

        $response->assertOk()->assertJsonPath('success', true);

        $data = $response->json('data');

        // Confirmed sessions only: Alice 2 + Bob 1
        $this->assertSame([
            'users' => 2,
            'sessions' => 3,
            'confirmed_sessions' => 3,
            'items_total' => 9,
            'done' => 5,
            'partial' => 2,
            'not_done' => 2,
            'pending' => 0,
            'completion_pct' => 66.67, // (5 + 0.5*2) / 9
            'estimated_minutes_total' => 260,
        ], $data['totals']);

        $this->assertSame(['start' => '2026-09-01', 'end' => '2026-09-30'], [
            'start' => $data['period']['start'],
            'end' => $data['period']['end'],
        ]);

        // Per user, ordered by name
        $this->assertCount(2, $data['per_user']);

        $alice = $data['per_user'][0];
        $this->assertSame($this->alice->id, $alice['user_id']);
        $this->assertSame('Alice', $alice['user_name']);
        $this->assertArrayHasKey('avatar_url', $alice);
        $this->assertSame(2, $alice['sessions_count']);
        $this->assertSame(7, $alice['items_total']);
        $this->assertSame(4, $alice['done']);
        $this->assertSame(2, $alice['partial']);
        $this->assertSame(1, $alice['not_done']);
        $this->assertSame(0, $alice['pending']);
        $this->assertSame(71.43, $alice['completion_pct']); // (4 + 1) / 7
        $this->assertSame(240, $alice['estimated_minutes_total']);
        $this->assertSame('2026-09-11', $alice['last_work_date']);

        $bob = $data['per_user'][1];
        $this->assertSame('Bob', $bob['user_name']);
        $this->assertSame(1, $bob['sessions_count']);
        $this->assertEquals(50.0, $bob['completion_pct']);
        $this->assertSame('2026-09-10', $bob['last_work_date']);
    }

    public function test_overview_single_session_math_done3_partial2_notdone1_is_66_67(): void
    {
        $session = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->alice->id]);
        WorkSessionItem::factory()->count(3)->done()->create(['work_session_id' => $session->id]);
        WorkSessionItem::factory()->count(2)->partial()->create(['work_session_id' => $session->id]);
        WorkSessionItem::factory()->notDone()->create(['work_session_id' => $session->id]);

        $response = $this->actingAsUser($this->admin)
            ->getJson(self::OVERVIEW.'?start_date=2026-09-10&end_date=2026-09-10');

        $response->assertOk()
            ->assertJsonPath('data.totals.completion_pct', 66.67)
            ->assertJsonPath('data.per_user.0.completion_pct', 66.67)
            ->assertJsonPath('data.daily.0.completion_pct', 66.67);
    }

    public function test_overview_daily_series(): void
    {
        $this->seedOverviewData();

        $daily = $this->actingAsUser($this->admin)
            ->getJson(self::OVERVIEW.'?start_date=2026-09-01&end_date=2026-09-30')
            ->assertOk()
            ->json('data.daily');

        $this->assertSame(['2026-09-10', '2026-09-11'], array_column($daily, 'date'));

        $this->assertSame([
            'date' => '2026-09-10',
            'sessions_count' => 2,
            'items_total' => 8,
            'done' => 4,
            'partial' => 2,
            'not_done' => 2,
            'pending' => 0,
            'completion_pct' => 62.5, // (4 + 1) / 8
        ], $daily[0]);

        $this->assertSame(1, $daily[1]['sessions_count']);
        $this->assertEquals(100.0, $daily[1]['completion_pct']);
    }

    public function test_overview_excludes_open_sessions_unless_include_open(): void
    {
        $this->seedOverviewData();
        $this->actingAsUser($this->admin);

        $default = $this->getJson(self::OVERVIEW.'?start_date=2026-09-01&end_date=2026-09-30')
            ->assertOk()->json('data');

        $this->assertSame(3, $default['totals']['sessions']);
        $this->assertSame(0, $default['totals']['pending']);
        $this->assertNotContains('2026-09-12', array_column($default['daily'], 'date'));

        $withOpen = $this->getJson(self::OVERVIEW.'?start_date=2026-09-01&end_date=2026-09-30&include_open=1')
            ->assertOk()->json('data');

        $this->assertSame(4, $withOpen['totals']['sessions']);
        $this->assertSame(3, $withOpen['totals']['confirmed_sessions']);
        $this->assertSame(10, $withOpen['totals']['items_total']);
        $this->assertSame(1, $withOpen['totals']['pending']);
        $this->assertEquals(60.0, $withOpen['totals']['completion_pct']); // (5 + 1) / 10
        $this->assertContains('2026-09-12', array_column($withOpen['daily'], 'date'));
        $this->assertTrue($withOpen['period']['include_open']);
    }

    public function test_overview_filters_by_user_ids(): void
    {
        $this->seedOverviewData();

        $data = $this->actingAsUser($this->admin)
            ->getJson(self::OVERVIEW.'?start_date=2026-09-01&end_date=2026-09-30&user_ids[]='.$this->alice->id)
            ->assertOk()->json('data');

        $this->assertSame(1, $data['totals']['users']);
        $this->assertSame(2, $data['totals']['sessions']);
        $this->assertSame(7, $data['totals']['items_total']);
        $this->assertCount(1, $data['per_user']);
        $this->assertSame($this->alice->id, $data['per_user'][0]['user_id']);
    }

    public function test_overview_counts_sessions_with_zero_items(): void
    {
        WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->alice->id]);

        $data = $this->actingAsUser($this->admin)
            ->getJson(self::OVERVIEW.'?start_date=2026-09-10&end_date=2026-09-10')
            ->assertOk()->json('data');

        $this->assertSame(1, $data['totals']['sessions']);
        $this->assertSame(0, $data['totals']['items_total']);
        $this->assertNull($data['totals']['completion_pct']);
        $this->assertNull($data['per_user'][0]['completion_pct']);
    }

    public function test_overview_validates_date_range(): void
    {
        $this->actingAsUser($this->admin);

        $this->getJson(self::OVERVIEW)->assertStatus(422)
            ->assertJsonValidationErrors(['start_date', 'end_date']);

        $this->getJson(self::OVERVIEW.'?start_date=2026-09-10&end_date=2026-09-01')
            ->assertStatus(422)->assertJsonValidationErrors(['end_date']);
    }

    // ─── By task ─────────────────────────────────────────────────────

    public function test_by_task_groups_by_task_id(): void
    {
        $taskId = $this->makeTask($this->alice, 'pending', ['name' => 'Build report', 'project_name' => 'Apollo']);
        $otherTaskId = $this->makeTask($this->bob, 'pending', ['name' => 'Write docs']);

        $day1 = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->alice->id]);
        $day2 = WorkSession::factory()->confirmed()->onDate('2026-09-11')->create(['user_id' => $this->alice->id]);
        $bobDay = WorkSession::factory()->confirmed()->onDate('2026-09-11')->create(['user_id' => $this->bob->id]);

        $first = WorkSessionItem::factory()->partial()->create([
            'work_session_id' => $day1->id, 'task_id' => $taskId, 'title' => 'Report v1', 'estimated_minutes' => 60,
        ]);
        WorkSessionItem::factory()->done()->create([
            'work_session_id' => $day2->id, 'task_id' => $taskId, 'title' => 'Report v2',
            'estimated_minutes' => 30, 'carried_from_item_id' => $first->id,
        ]);
        WorkSessionItem::factory()->done()->create([
            'work_session_id' => $bobDay->id, 'task_id' => $taskId, 'title' => 'Help with report', 'estimated_minutes' => 15,
        ]);
        WorkSessionItem::factory()->notDone()->create([
            'work_session_id' => $bobDay->id, 'task_id' => $otherTaskId, 'title' => 'Docs',
        ]);
        // Unlinked item: must NOT appear when grouping by task
        WorkSessionItem::factory()->done()->create(['work_session_id' => $bobDay->id, 'task_id' => null, 'title' => 'Standup']);

        $data = $this->actingAsUser($this->admin)
            ->getJson(self::BY_TASK.'?start_date=2026-09-01&end_date=2026-09-30')
            ->assertOk()->json('data');

        $this->assertSame('task', $data['group_by']);
        $this->assertCount(2, $data['rows']);

        // Ordered by occurrences desc
        $row = $data['rows'][0];
        $this->assertSame($taskId, $row['task_id']);
        $this->assertSame('Build report', $row['task_name']);
        $this->assertSame('Apollo', $row['project_name']);
        $this->assertSame(3, $row['occurrences']);
        $this->assertSame(3, $row['sessions_count']);
        $this->assertSame(
            [['user_id' => $this->alice->id, 'user_name' => 'Alice'], ['user_id' => $this->bob->id, 'user_name' => 'Bob']],
            $row['users']
        );
        $this->assertSame(2, $row['done']);
        $this->assertSame(1, $row['partial']);
        $this->assertSame(0, $row['not_done']);
        $this->assertSame(0, $row['pending']);
        $this->assertSame(83.33, $row['completion_pct']); // (2 + 0.5) / 3
        $this->assertSame(105, $row['estimated_minutes_total']);
        $this->assertSame('2026-09-10', $row['first_date']);
        $this->assertSame('2026-09-11', $row['last_date']);
        $this->assertSame(1, $row['carried_over_count']);

        $this->assertSame($otherTaskId, $data['rows'][1]['task_id']);
        $this->assertSame(1, $data['rows'][1]['occurrences']);
    }

    public function test_by_task_groups_by_normalized_title(): void
    {
        $day1 = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->alice->id]);
        $day2 = WorkSession::factory()->confirmed()->onDate('2026-09-11')->create(['user_id' => $this->bob->id]);

        WorkSessionItem::factory()->done()->create(['work_session_id' => $day1->id, 'title' => 'Fix bug']);
        WorkSessionItem::factory()->notDone()->create(['work_session_id' => $day2->id, 'title' => '  fix BUG  ']);
        WorkSessionItem::factory()->done()->create(['work_session_id' => $day2->id, 'title' => 'Standup']);

        $data = $this->actingAsUser($this->admin)
            ->getJson(self::BY_TASK.'?start_date=2026-09-01&end_date=2026-09-30&group_by=title')
            ->assertOk()->json('data');

        $this->assertSame('title', $data['group_by']);
        $this->assertCount(2, $data['rows']);

        $row = $data['rows'][0];
        $this->assertSame('fix bug', $row['title']);
        $this->assertNull($row['task_id']);
        $this->assertSame(2, $row['occurrences']);
        $this->assertSame(2, $row['sessions_count']);
        $this->assertCount(2, $row['users']);
        $this->assertSame(1, $row['done']);
        $this->assertSame(1, $row['not_done']);
        $this->assertEquals(50.0, $row['completion_pct']);

        $this->assertSame('standup', $data['rows'][1]['title']);
    }

    public function test_by_task_excludes_open_sessions_unless_include_open(): void
    {
        $taskId = $this->makeTask($this->alice);

        $confirmed = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->alice->id]);
        $open = WorkSession::factory()->onDate('2026-09-11')->create(['user_id' => $this->alice->id]);
        WorkSessionItem::factory()->done()->create(['work_session_id' => $confirmed->id, 'task_id' => $taskId]);
        WorkSessionItem::factory()->create(['work_session_id' => $open->id, 'task_id' => $taskId]);

        $this->actingAsUser($this->admin);

        $this->getJson(self::BY_TASK.'?start_date=2026-09-01&end_date=2026-09-30')
            ->assertOk()
            ->assertJsonPath('data.rows.0.occurrences', 1)
            ->assertJsonPath('data.rows.0.pending', 0);

        $this->getJson(self::BY_TASK.'?start_date=2026-09-01&end_date=2026-09-30&include_open=1')
            ->assertOk()
            ->assertJsonPath('data.rows.0.occurrences', 2)
            ->assertJsonPath('data.rows.0.pending', 1)
            ->assertJsonPath('data.rows.0.completion_pct', 50);
    }

    public function test_by_task_rejects_unknown_group_by(): void
    {
        $this->actingAsUser($this->admin)
            ->getJson(self::BY_TASK.'?start_date=2026-09-01&end_date=2026-09-30&group_by=user')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['group_by']);
    }

    // ─── Authorization ───────────────────────────────────────────────

    public function test_employee_is_forbidden(): void
    {
        $this->actingAsUser($this->alice);

        $this->getJson(self::OVERVIEW.'?start_date=2026-09-01&end_date=2026-09-30')->assertForbidden();
        $this->getJson(self::BY_TASK.'?start_date=2026-09-01&end_date=2026-09-30')->assertForbidden();
    }

    public function test_guest_is_unauthorized(): void
    {
        $this->getJson(self::OVERVIEW.'?start_date=2026-09-01&end_date=2026-09-30')->assertUnauthorized();
    }
}
