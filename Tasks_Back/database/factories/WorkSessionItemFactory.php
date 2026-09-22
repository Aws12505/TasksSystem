<?php

namespace Database\Factories;

use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WorkSessionItem> */
class WorkSessionItemFactory extends Factory
{
    protected $model = WorkSessionItem::class;

    public function definition(): array
    {
        return [
            'work_session_id' => WorkSession::factory(),
            'task_id' => null,
            'title' => fake()->sentence(3),
            'description' => null,
            'priority' => 'medium',
            'estimated_minutes' => fake()->numberBetween(15, 240),
            'sort_order' => 0,
            'outcome' => WorkSessionItem::OUTCOME_PENDING,
            'outcome_note' => null,
            'completed_at' => null,
            'carried_from_item_id' => null,
        ];
    }

    public function done(): static
    {
        return $this->state(fn () => ['outcome' => WorkSessionItem::OUTCOME_DONE, 'completed_at' => now()]);
    }

    public function partial(): static
    {
        return $this->state(fn () => ['outcome' => WorkSessionItem::OUTCOME_PARTIAL, 'completed_at' => now()]);
    }

    public function notDone(): static
    {
        return $this->state(fn () => ['outcome' => WorkSessionItem::OUTCOME_NOT_DONE, 'completed_at' => now()]);
    }
}
