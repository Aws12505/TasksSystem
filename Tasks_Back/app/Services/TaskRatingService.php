<?php

namespace App\Services;

use App\Models\TaskRating;
use App\Models\RatingConfig;
use App\Enums\RatingConfigType;

class TaskRatingService
{
    public function createTaskRating(array $data): TaskRating
    {
        $config = RatingConfig::getActiveByType(RatingConfigType::TASK_RATING);
        
        if (!$config) {
            throw new \Exception('No active task rating configuration found');
        }

        // Calculate final rating based on config
        $finalRating = $this->calculateRating($data['rating_data'], $config);

        return TaskRating::create([
            'task_id' => $data['task_id'],
            'rater_id' => $data['rater_id'],
            'rating_data' => $data['rating_data'],
            'final_rating' => $finalRating,
            'config_snapshot' => $config->config_data,
            'rated_at' => now(),
        ])->load(['task', 'rater']);
    }

    public function updateTaskRating(int $id, array $data): ?TaskRating
    {
        $rating = TaskRating::find($id);
        
        if (!$rating) {
            return null;
        }

        if (isset($data['rating_data'])) {
            // Recalculate using stored config snapshot
            $config = new RatingConfig(['config_data' => $rating->config_snapshot]);
            $data['final_rating'] = $this->calculateRating($data['rating_data'], $config);
        }

        $rating->update($data);
        return $rating->fresh(['task', 'rater']);
    }

    public function getRatingsByTask(int $taskId): \Illuminate\Pagination\LengthAwarePaginator
    {
        return TaskRating::where('task_id', $taskId)
                         ->with('rater')
                         ->latest()
                         ->paginate(15);
    }

    private function calculateRating(array $ratingData, RatingConfig $config): float
    {
        $fields = $config->getFields();
        $totalScore = 0;
        $totalMaxValue = 0;

        foreach ($fields as $field) {
            $fieldName = $field['name'];
            $maxValue = $field['max_value'];
            
            $userRating = $ratingData[$fieldName] ?? 0;
            $totalScore += $userRating;
            $totalMaxValue += $maxValue;
        }

        return $totalMaxValue > 0 ? ($totalScore / $totalMaxValue) * 100 : 0;
    }
}
