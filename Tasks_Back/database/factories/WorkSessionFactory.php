<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WorkSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WorkSession> */
class WorkSessionFactory extends Factory
{
    protected $model = WorkSession::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'work_date' => WorkSession::companyToday(),
            'status' => WorkSession::STATUS_OPEN,
            'started_at' => now(),
            'confirmed_at' => null,
            'reopened_at' => null,
            'reopened_by' => null,
            'summary_note' => null,
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn () => [
            'status' => WorkSession::STATUS_CONFIRMED,
            'confirmed_at' => now(),
        ]);
    }

    public function onDate(string $date): static
    {
        return $this->state(fn () => ['work_date' => $date]);
    }
}
