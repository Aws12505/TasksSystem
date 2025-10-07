<?php

namespace App\Services\FinalRating\Components;

use App\Models\User;
use App\Models\HelpRequest;
use Carbon\Carbon;

class HelpRequestComponent extends RatingComponent
{
    public function calculate(User $user, Carbon $startDate, Carbon $endDate, array $config): array
    {
        $helperConfig = $config['help_requests_helper'] ?? [];
        $requesterConfig = $config['help_requests_requester'] ?? [];

        $result = [
            'helper' => ['enabled' => false, 'value' => 0, 'count' => 0],
            'requester' => ['enabled' => false, 'value' => 0, 'breakdown' => []],
        ];

        if (($helperConfig['enabled'] ?? false) === true) {
            $count = HelpRequest::where('helper_id', $user->id)
                ->where('is_completed', true)
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->count();

            $pointsPerHelp = $helperConfig['points_per_help'] ?? 5;
            $maxPoints = $helperConfig['max_points'] ?? 20;

            $value = min($count * $pointsPerHelp, $maxPoints);

            $result['helper'] = [
                'enabled' => true,
                'value' => round($value, 2),
                'count' => $count,
                'points_per_help' => $pointsPerHelp,
                'max_points' => $maxPoints,
                'capped' => $count * $pointsPerHelp > $maxPoints,
            ];
        }

        if (($requesterConfig['enabled'] ?? false) === true) {
            $requests = HelpRequest::where('requester_id', $user->id)
                ->where('is_completed', true)
                ->whereNotNull('rating')
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->get();

            $penalties = $requesterConfig['penalties'] ?? [
                'basic_skill_gap' => -2,
                'fixing_own_mistakes' => -5,
                'clarification' => -1,
                'other' => -3,
            ];

            $breakdown = [];
            $totalPenalty = 0;

            foreach ($requests as $request) {
                $ratingValue = $request->rating->value ?? 'other';
                $penalty = $penalties[$ratingValue] ?? 0;
                $totalPenalty += $penalty;

                if (!isset($breakdown[$ratingValue])) {
                    $breakdown[$ratingValue] = ['count' => 0, 'penalty_per_request' => $penalty, 'total' => 0];
                }

                $breakdown[$ratingValue]['count']++;
                $breakdown[$ratingValue]['total'] += $penalty;
            }

            $result['requester'] = [
                'enabled' => true,
                'value' => round($totalPenalty, 2),
                'total_requests' => $requests->count(),
                'breakdown' => $breakdown,
            ];
        }

        return $result;
    }
}
