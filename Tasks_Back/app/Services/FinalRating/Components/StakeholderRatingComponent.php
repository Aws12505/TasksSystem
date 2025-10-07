<?php

namespace App\Services\FinalRating\Components;

use App\Models\User;
use App\Models\Project;
use App\Models\StakeholderRating;
use App\Models\Task;
use Carbon\Carbon;

class StakeholderRatingComponent extends RatingComponent
{
    public function calculate(User $user, Carbon $startDate, Carbon $endDate, array $config): array
    {
        if (!$this->isEnabled($config)) {
            return ['enabled' => false, 'value' => 0, 'projects_included' => 0, 'details' => []];
        }

        $includeProjectPercentage = $config['include_project_percentage'] ?? true;
        $includeTaskWeight = $config['include_task_weight'] ?? true;
        $aggregation = $config['aggregation'] ?? 'sum';

        $projectIds = Task::whereHas('assignedUsers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereBetween('due_date', [$startDate, $endDate])
            ->with('section.project')
            ->get()
            ->pluck('section.project.id')
            ->unique();

        $details = [];
        $total = 0;

        foreach ($projectIds as $projectId) {
            $project = Project::find($projectId);
            if (!$project) continue;

            $latestRating = StakeholderRating::where('project_id', $projectId)
                ->orderBy('rated_at', 'desc')
                ->first();
            if (!$latestRating) continue;

            $stakeholderRating = (float) $latestRating->final_rating;

            $userProjectPercentage = $this->calculateUserProjectPercentage($user, $project, $startDate, $endDate, $includeTaskWeight);

            $contribution = $includeProjectPercentage
                ? ($stakeholderRating * $userProjectPercentage) / 100
                : $stakeholderRating;

            $total += $contribution;

            $details[] = [
                'project_id' => $project->id,
                'project_name' => $project->name,
                'stakeholder_rating' => round($stakeholderRating, 2),
                'user_project_percentage' => $includeProjectPercentage ? round($userProjectPercentage, 2) : null,
                'calculation' => $includeProjectPercentage
                    ? "({$stakeholderRating} × {$userProjectPercentage}) / 100"
                    : (string) $stakeholderRating,
                'contribution' => round($contribution, 2)
            ];
        }

        if ($aggregation === 'average' && count($details) > 0) {
            $total /= count($details);
        }

        return ['enabled' => true, 'value' => round($total, 2), 'projects_included' => count($details), 'aggregation' => $aggregation, 'details' => $details];
    }

    private function calculateUserProjectPercentage(User $user, Project $project, Carbon $startDate, Carbon $endDate, bool $includeWeight): float
    {
        $tasks = Task::whereHas('section', function ($q) use ($project) {
                $q->where('project_id', $project->id);
            })
            ->whereBetween('due_date', [$startDate, $endDate])
            ->with(['assignedUsers' => function ($q) {
                $q->select('users.id', 'task_user.percentage');
            }])
            ->get();

        if ($tasks->isEmpty()) return 0;

        $totalWeight = 0;
        $userWeightedSum = 0;

        foreach ($tasks as $task) {
            $weight = $includeWeight ? (float) $task->weight : 100;
            $totalWeight += $weight;

            $userAssignment = $task->assignedUsers->firstWhere('id', $user->id);
            if ($userAssignment) {
                $userWeightedSum += ($weight * (float) $userAssignment->pivot->percentage) / 100;
            }
        }

        if ($totalWeight === 0) return 0;
        return ($userWeightedSum / $totalWeight) * 100;
    }
}
