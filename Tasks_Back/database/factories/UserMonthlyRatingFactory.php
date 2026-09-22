<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserMonthlyRating;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<UserMonthlyRating> */
class UserMonthlyRatingFactory extends Factory
{
    protected $model = UserMonthlyRating::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'year' => (int) now()->format('Y'),
            'month' => (int) now()->format('n'),
            'score' => fake()->randomFloat(2, 0, 100),
            'comment' => null,
            'rated_by' => null,
        ];
    }
}
