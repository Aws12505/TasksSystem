<?php

namespace App\Services\FinalRating\Components;

use App\Models\User;
use App\Models\Ticket;
use Carbon\Carbon;
use App\Enums\TicketStatus;

class TicketComponent extends RatingComponent
{
    public function calculate(User $user, Carbon $startDate, Carbon $endDate, array $config): array
    {
        if (!($config['enabled'] ?? false)) {
            return ['enabled' => false, 'value' => 0, 'count' => 0];
        }

        $count = Ticket::where('assigned_to', $user->id)
            ->where('status', TicketStatus::RESOLVED)
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->count();

        $pointsPerTicket = $config['points_per_ticket'] ?? 3;
        $maxPoints = $config['max_points'] ?? 15;

        $value = min($count * $pointsPerTicket, $maxPoints);

        return [
            'enabled' => true,
            'value' => round($value, 2),
            'count' => $count,
            'points_per_ticket' => $pointsPerTicket,
            'max_points' => $maxPoints,
            'capped' => ($count * $pointsPerTicket > $maxPoints)
        ];
    }
}
