<?php

namespace App\Services\FinalRating\Components;

use App\Models\User;
use Carbon\Carbon;

abstract class RatingComponent
{
    abstract public function calculate(User $user, Carbon $startDate, Carbon $endDate, array $config): array;

    public function isEnabled(array $config): bool
    {
        return $config['enabled'] ?? false;
    }

    protected function round(float $value): float
    {
        return round($value, 2);
    }
}
