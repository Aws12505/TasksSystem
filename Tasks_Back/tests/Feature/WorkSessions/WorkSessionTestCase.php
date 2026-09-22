<?php

namespace Tests\Feature\WorkSessions;

use App\Models\User;
use Database\Seeders\WorkSessionPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

/**
 * Shared fixture for the Work Sessions feature tests.
 *
 * - Seeds the module permissions and the "admin" role.
 * - Pins the company timezone to UTC and disables broadcasting.
 * - Provides helpers to build users and assignable tasks without firing the
 *   Task model events (project progress recalculation).
 */
abstract class WorkSessionTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'app.company_timezone' => 'UTC',
            'broadcasting.default' => 'null',
        ]);

        $this->seed(WorkSessionPermissionSeeder::class);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /** A regular user with no module permissions. */
    protected function employee(array $attributes = []): User
    {
        return User::factory()->create($attributes);
    }

    /** A user holding the "admin" role (all work-session permissions). */
    protected function admin(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole('admin');
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $user->fresh();
    }

    /** Authenticate the given user for subsequent requests via Sanctum. */
    protected function actingAsUser(User $user): static
    {
        Sanctum::actingAs($user, ['*']);

        return $this;
    }

    /**
     * Insert a project/section/task chain and assign the task to $assignee.
     * Uses the query builder so Task::saved / Project recalculation never run.
     *
     * @return int the new task id
     */
    protected function makeTask(User $assignee, string $status = 'pending', array $overrides = []): int
    {
        $now = now();

        $projectId = DB::table('projects')->insertGetId([
            'name' => $overrides['project_name'] ?? 'Project '.fake()->unique()->word(),
            'description' => null,
            'stakeholder_will_rate' => false,
            'stakeholder_id' => $assignee->id,
            'status' => 'pending',
            'progress_percentage' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $sectionId = DB::table('sections')->insertGetId([
            'name' => 'Section',
            'description' => null,
            'project_id' => $projectId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $taskId = DB::table('tasks')->insertGetId([
            'name' => $overrides['name'] ?? 'Task '.fake()->unique()->word(),
            'description' => null,
            'weight' => 1,
            'due_date' => $overrides['due_date'] ?? $now->toDateString(),
            'priority' => $overrides['priority'] ?? 'medium',
            'status' => $status,
            'section_id' => $sectionId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('task_user')->insert([
            'task_id' => $taskId,
            'user_id' => $assignee->id,
            'percentage' => 100,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return $taskId;
    }
}
