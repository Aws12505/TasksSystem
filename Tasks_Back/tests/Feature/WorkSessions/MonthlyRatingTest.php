<?php

namespace Tests\Feature\WorkSessions;

use App\Models\User;
use App\Models\UserMonthlyRating;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;

class MonthlyRatingTest extends WorkSessionTestCase
{
    private const BASE = '/api/work-sessions/admin/ratings';

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

    private function ratingUrl(User $user, int $year, int $month): string
    {
        return self::BASE."/{$user->id}/{$year}/{$month}";
    }

    // ─── Upsert ──────────────────────────────────────────────────────

    public function test_upsert_creates_then_updates_the_same_row(): void
    {
        $this->actingAsUser($this->admin);

        $create = $this->putJson($this->ratingUrl($this->alice, 2026, 9), [
            'score' => 85.5,
            'comment' => 'Solid month',
        ]);

        $create->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user_id', $this->alice->id)
            ->assertJsonPath('data.year', 2026)
            ->assertJsonPath('data.month', 9)
            ->assertJsonPath('data.score', 85.5)
            ->assertJsonPath('data.comment', 'Solid month')
            ->assertJsonPath('data.rated_by', $this->admin->id);

        $ratingId = $create->json('data.id');

        $update = $this->putJson($this->ratingUrl($this->alice, 2026, 9), ['score' => 90]);

        $update->assertOk()
            ->assertJsonPath('data.id', $ratingId)
            ->assertJsonPath('data.comment', null);

        $this->assertEquals(90.0, $update->json('data.score'));

        $this->assertDatabaseCount('user_monthly_ratings', 1);
        $this->assertDatabaseHas('user_monthly_ratings', [
            'user_id' => $this->alice->id, 'year' => 2026, 'month' => 9, 'score' => 90.00,
        ]);
    }

    public function test_upsert_rejects_score_above_100(): void
    {
        $this->actingAsUser($this->admin)
            ->putJson($this->ratingUrl($this->alice, 2026, 9), ['score' => 101])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['score']);

        $this->assertDatabaseCount('user_monthly_ratings', 0);
    }

    public function test_upsert_rejects_negative_or_missing_score(): void
    {
        $this->actingAsUser($this->admin);

        $this->putJson($this->ratingUrl($this->alice, 2026, 9), ['score' => -1])
            ->assertStatus(422)->assertJsonValidationErrors(['score']);

        $this->putJson($this->ratingUrl($this->alice, 2026, 9), ['comment' => 'no score'])
            ->assertStatus(422)->assertJsonValidationErrors(['score']);
    }

    public function test_upsert_returns_404_for_unknown_user(): void
    {
        $this->actingAsUser($this->admin)
            ->putJson(self::BASE.'/999999/2026/9', ['score' => 50])
            ->assertNotFound()
            ->assertExactJson(['success' => false, 'data' => null, 'message' => 'User not found']);
    }

    public function test_upsert_returns_400_for_invalid_month_or_year(): void
    {
        $this->actingAsUser($this->admin);

        $this->putJson($this->ratingUrl($this->alice, 2026, 13), ['score' => 50])
            ->assertStatus(400)->assertJsonPath('success', false);

        $this->putJson($this->ratingUrl($this->alice, 2019, 1), ['score' => 50])
            ->assertStatus(400)->assertJsonPath('success', false);
    }

    // ─── Delete ──────────────────────────────────────────────────────

    public function test_delete_removes_rating_then_404(): void
    {
        UserMonthlyRating::factory()->create(['user_id' => $this->alice->id, 'year' => 2026, 'month' => 9, 'score' => 70]);

        $this->actingAsUser($this->admin);

        $this->deleteJson($this->ratingUrl($this->alice, 2026, 9))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', null);

        $this->assertDatabaseCount('user_monthly_ratings', 0);

        $this->deleteJson($this->ratingUrl($this->alice, 2026, 9))
            ->assertNotFound()
            ->assertExactJson(['success' => false, 'data' => null, 'message' => 'Rating not found']);
    }

    // ─── Index ───────────────────────────────────────────────────────

    public function test_index_lists_all_users_with_null_rating_and_stats(): void
    {
        $session = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create(['user_id' => $this->alice->id]);
        WorkSessionItem::factory()->count(3)->done()->create(['work_session_id' => $session->id]);
        WorkSessionItem::factory()->notDone()->create(['work_session_id' => $session->id]);

        UserMonthlyRating::factory()->create([
            'user_id' => $this->bob->id, 'year' => 2026, 'month' => 9, 'score' => 64.25, 'rated_by' => $this->admin->id,
        ]);
        // A rating for another month must not leak in
        UserMonthlyRating::factory()->create(['user_id' => $this->alice->id, 'year' => 2026, 'month' => 8, 'score' => 10]);

        $response = $this->actingAsUser($this->admin)->getJson(self::BASE.'?year=2026&month=9');

        $response->assertOk()->assertJsonPath('success', true);

        $rows = collect($response->json('data'));

        $this->assertCount(User::count(), $rows);
        $this->assertSame(['Admin', 'Alice', 'Bob'], $rows->pluck('user.name')->all());

        $alice = $rows->firstWhere('user.id', $this->alice->id);
        $this->assertNull($alice['rating']);
        $this->assertArrayHasKey('avatar_url', $alice['user']);
        $this->assertEquals([
            'sessions_count' => 1,
            'items_total' => 4,
            'done' => 3,
            'partial' => 0,
            'not_done' => 1,
            'completion_pct' => 75.0,
        ], $alice['stats']);

        $bob = $rows->firstWhere('user.id', $this->bob->id);
        $this->assertSame(64.25, $bob['rating']['score']);
        $this->assertSame($this->admin->id, $bob['rating']['rated_by']);
        $this->assertArrayHasKey('updated_at', $bob['rating']);
        $this->assertSame(0, $bob['stats']['sessions_count']);
        $this->assertNull($bob['stats']['completion_pct']);

        $admin = $rows->firstWhere('user.id', $this->admin->id);
        $this->assertNull($admin['rating']);
    }

    public function test_index_requires_year_and_month(): void
    {
        $this->actingAsUser($this->admin);

        $this->getJson(self::BASE)->assertStatus(422)->assertJsonValidationErrors(['year', 'month']);
        $this->getJson(self::BASE.'?year=2026&month=13')->assertStatus(422)->assertJsonValidationErrors(['month']);
    }

    // ─── Average ─────────────────────────────────────────────────────

    public function test_average_over_range_with_missing_month(): void
    {
        $carol = $this->employee(['name' => 'Carol']);

        // Alice: Jul 80, Sep 90 (Aug missing) -> 85 over rated months only
        UserMonthlyRating::factory()->create(['user_id' => $this->alice->id, 'year' => 2026, 'month' => 7, 'score' => 80]);
        UserMonthlyRating::factory()->create(['user_id' => $this->alice->id, 'year' => 2026, 'month' => 9, 'score' => 90]);
        // Bob: Aug 70 only
        UserMonthlyRating::factory()->create(['user_id' => $this->bob->id, 'year' => 2026, 'month' => 8, 'score' => 70]);
        // Out of range ratings must be ignored
        UserMonthlyRating::factory()->create(['user_id' => $this->alice->id, 'year' => 2026, 'month' => 6, 'score' => 0]);
        UserMonthlyRating::factory()->create(['user_id' => $this->bob->id, 'year' => 2026, 'month' => 10, 'score' => 0]);
        // Carol: never rated

        $response = $this->actingAsUser($this->admin)->postJson(self::BASE.'/average', [
            'user_ids' => [$this->alice->id, $this->bob->id, $carol->id],
            'from' => ['year' => 2026, 'month' => 7],
            'to' => ['year' => 2026, 'month' => 9],
        ]);

        $response->assertOk()->assertJsonPath('success', true);

        $data = $response->json('data');

        $this->assertSame(['from' => '2026-07', 'to' => '2026-09', 'months_in_range' => 3], $data['range']);
        $this->assertSame(77.5, $data['overall_average']); // mean(85, 70)
        $this->assertSame(2, $data['users_with_ratings']);

        $this->assertSame(['Alice', 'Bob', 'Carol'], array_column($data['per_user'], 'user_name'));

        $alice = $data['per_user'][0];
        $this->assertSame($this->alice->id, $alice['user_id']);
        $this->assertArrayHasKey('avatar_url', $alice);
        $this->assertSame(2, $alice['months_rated']);
        $this->assertEquals(85.0, $alice['average_score']);
        $this->assertEquals([
            ['year' => 2026, 'month' => 7, 'score' => 80.0],
            ['year' => 2026, 'month' => 9, 'score' => 90.0],
        ], $alice['ratings']);

        $bob = $data['per_user'][1];
        $this->assertSame(1, $bob['months_rated']);
        $this->assertEquals(70.0, $bob['average_score']);

        $carol = $data['per_user'][2];
        $this->assertSame(0, $carol['months_rated']);
        $this->assertNull($carol['average_score']);
        $this->assertSame([], $carol['ratings']);
    }

    public function test_average_across_year_boundary(): void
    {
        UserMonthlyRating::factory()->create(['user_id' => $this->alice->id, 'year' => 2025, 'month' => 12, 'score' => 40]);
        UserMonthlyRating::factory()->create(['user_id' => $this->alice->id, 'year' => 2026, 'month' => 1, 'score' => 60]);

        $data = $this->actingAsUser($this->admin)->postJson(self::BASE.'/average', [
            'user_ids' => [$this->alice->id],
            'from' => ['year' => 2025, 'month' => 11],
            'to' => ['year' => 2026, 'month' => 2],
        ])->assertOk()->json('data');

        $this->assertSame(4, $data['range']['months_in_range']);
        $this->assertEquals(50.0, $data['per_user'][0]['average_score']);
        $this->assertEquals(50.0, $data['overall_average']);
    }

    public function test_average_with_no_ratings_returns_null_overall(): void
    {
        $data = $this->actingAsUser($this->admin)->postJson(self::BASE.'/average', [
            'user_ids' => [$this->alice->id],
            'from' => ['year' => 2026, 'month' => 1],
            'to' => ['year' => 2026, 'month' => 3],
        ])->assertOk()->json('data');

        $this->assertNull($data['overall_average']);
        $this->assertSame(0, $data['users_with_ratings']);
        $this->assertNull($data['per_user'][0]['average_score']);
    }

    public function test_average_validates_range(): void
    {
        $this->actingAsUser($this->admin);

        // to before from
        $this->postJson(self::BASE.'/average', [
            'user_ids' => [$this->alice->id],
            'from' => ['year' => 2026, 'month' => 9],
            'to' => ['year' => 2026, 'month' => 8],
        ])->assertStatus(422)->assertJsonValidationErrors(['to']);

        // span > 60 months
        $this->postJson(self::BASE.'/average', [
            'user_ids' => [$this->alice->id],
            'from' => ['year' => 2020, 'month' => 1],
            'to' => ['year' => 2025, 'month' => 1],
        ])->assertStatus(422)->assertJsonValidationErrors(['to']);

        // exactly 60 months is fine
        $this->postJson(self::BASE.'/average', [
            'user_ids' => [$this->alice->id],
            'from' => ['year' => 2020, 'month' => 1],
            'to' => ['year' => 2024, 'month' => 12],
        ])->assertOk()->assertJsonPath('data.range.months_in_range', 60);

        // user_ids required
        $this->postJson(self::BASE.'/average', [
            'from' => ['year' => 2026, 'month' => 1],
            'to' => ['year' => 2026, 'month' => 2],
        ])->assertStatus(422)->assertJsonValidationErrors(['user_ids']);
    }

    // ─── Authorization ───────────────────────────────────────────────

    public function test_employee_is_forbidden(): void
    {
        $this->actingAsUser($this->alice);

        $this->getJson(self::BASE.'?year=2026&month=9')->assertForbidden();
        $this->putJson($this->ratingUrl($this->bob, 2026, 9), ['score' => 50])->assertForbidden();
        $this->deleteJson($this->ratingUrl($this->bob, 2026, 9))->assertForbidden();
        $this->postJson(self::BASE.'/average', [
            'user_ids' => [$this->bob->id],
            'from' => ['year' => 2026, 'month' => 1],
            'to' => ['year' => 2026, 'month' => 2],
        ])->assertForbidden();

        $this->assertDatabaseCount('user_monthly_ratings', 0);
    }
}
