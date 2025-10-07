<?php

namespace App\Services\FinalRating;

use App\Models\FinalRatingConfig;
use App\Models\User;
use App\Models\Task;
use Carbon\Carbon;
use App\Services\FinalRating\Components\TaskRatingComponent;
use App\Services\FinalRating\Components\StakeholderRatingComponent;
use App\Services\FinalRating\Components\HelpRequestComponent;
use App\Services\FinalRating\Components\TicketComponent;

class FinalRatingCalculator
{
    private TaskRatingComponent $taskComp;
    private StakeholderRatingComponent $stakeholderComp;
    private HelpRequestComponent $helpRequestComp;
    private TicketComponent $ticketComp;

    public function __construct()
    {
        $this->taskComp = new TaskRatingComponent();
        $this->stakeholderComp = new StakeholderRatingComponent();
        $this->helpRequestComp = new HelpRequestComponent();
        $this->ticketComp = new TicketComponent();
    }

    public function calculate(
        Carbon $startDate, 
        Carbon $endDate, 
        float $maxPoints, 
        ?FinalRatingConfig $config = null, 
        ?array $userIds = null
    ): array {
        if (!$config) {
            $config = FinalRatingConfig::getActive();
            if (!$config) {
                throw new \Exception("No active final rating configuration exists");
            }
        }

        $configData = $config->config;
        $users = $this->getUsersToCalculate($startDate, $endDate, null);

        $results = [];

        foreach ($users as $user) {
            $task = $this->taskComp->calculate($user, $startDate, $endDate, $configData['task_ratings'] ?? []);
            $stakeholder = $this->stakeholderComp->calculate($user, $startDate, $endDate, $configData['stakeholder_ratings'] ?? []);
            $help = $this->helpRequestComp->calculate($user, $startDate, $endDate, $configData);
            $ticket = $this->ticketComp->calculate($user, $startDate, $endDate, $configData['tickets_resolved'] ?? []);

            $totalPoints = 0;
            $totalPoints += $task['value'] ?? 0;
            $totalPoints += $stakeholder['value'] ?? 0;
            $totalPoints += $help['helper']['value'] ?? 0;
            $totalPoints += $help['requester']['value'] ?? 0;
            $totalPoints += $ticket['value'] ?? 0;

            $percentage = min(($totalPoints / max($maxPoints, 1)) * 100, 100);

            $results[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'avatar_url' => $user->avatar_url, // Added avatar
                'breakdown' => [
                    'task_ratings' => $task,
                    'stakeholder_ratings' => $stakeholder,
                    'help_requests' => $help,
                    'tickets_resolved' => $ticket,
                ],
                'total_points' => round($totalPoints, 2),
                'max_points' => $maxPoints,
                'final_percentage' => round(max(0, $percentage), 2),
            ];
        }

        return [
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'config' => [
                'id' => $config->id,
                'name' => $config->name,
            ],
            'max_points_for_100_percent' => $maxPoints,
            'calculated_at' => now()->toIso8601String(),
            'users' => $results,
        ];
    }

    private function getUsersToCalculate(Carbon $startDate, Carbon $endDate, ?array $userIds)
    {
        $query = User::whereHas('assignedTasks', function($q) use ($startDate, $endDate) {
            $q->whereBetween('due_date', [$startDate, $endDate]);
        });

        return $query->get();
    }
}
