<?php

namespace App\Services\FinalRating\Components;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskRating;
use Carbon\Carbon;

class TaskRatingComponent extends RatingComponent
{
    public function calculate(User $user, Carbon $startDate, Carbon $endDate, array $config): array
    {
        if (!$this->isEnabled($config)) {
            return ['enabled' => false, 'value' => 0, 'tasks_included' => 0, 'details' => []];
        }

        $includeWeight = $config['include_task_weight'] ?? true;
        $includePercentage = $config['include_user_percentage'] ?? true;
        $aggregation = $config['aggregation'] ?? 'sum';

        $tasks = Task::whereHas('assignedUsers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereBetween('due_date', [$startDate, $endDate])
            ->with(['assignedUsers' => function($q) use ($user) { $q->where('user_id', $user->id); }])
            ->get();

        $details = [];
        $total = 0;

        foreach ($tasks as $task) {
            $latestRating = TaskRating::where('task_id', $task->id)
                ->orderBy('rated_at', 'desc')->first();

            if (!$latestRating) {
                continue;
            }

            $rating = (float) $latestRating->final_rating;
            $weight = $includeWeight ? (float) $task->weight : 100;
            $percentage = $includePercentage ? (float) $task->assignedUsers->first()->pivot->percentage : 100;

            $contribution = ($rating * $weight * $percentage) / 10000;
            $total += $contribution;

            $details[] = [
                'task_id' => $task->id,
                'task_name' => $task->name,
                'task_rating' => $this->round($rating),
                'task_weight' => $includeWeight ? $this->round($weight) : null,
                'user_percentage' => $includePercentage ? $this->round($percentage) : null,
                'calculation' => $this->buildCalcString($rating, $weight, $percentage, $includeWeight, $includePercentage),
                'contribution' => $this->round($contribution)
            ];
        }

        if ($aggregation === 'average' && count($details) > 0) {
            $total /= count($details);
        }

        return ['enabled' => true, 'value' => $this->round($total), 'tasks_included' => count($details), 'aggregation' => $aggregation, 'details' => $details];
    }

    private function buildCalcString(float $rating, float $weight, float $percentage, bool $includeWeight, bool $includePercentage): string
    {
        if ($includeWeight && $includePercentage) {
            return "({$rating} × {$weight} × {$percentage}) / 10000";
        } elseif ($includeWeight) {
            return "({$rating} × {$weight}) / 100";
        } elseif ($includePercentage) {
            return "({$rating} × {$percentage}) / 100";
        } else {
            return (string) $rating;
        }
    }
}
