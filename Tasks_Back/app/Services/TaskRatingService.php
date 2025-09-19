<?php

namespace App\Services;

use App\Models\TaskRating;
use App\Models\RatingConfig;
use App\Enums\RatingConfigType;

class TaskRatingService
{
    public function createTaskRating(array $data): TaskRating
    {
        // Use the config sent by the client (no FK persisted)
        $config = RatingConfig::find($data['rating_config_id'] ?? null);
        if (!$config) {
            throw new \Exception('Rating configuration not found');
        }

        // Optional guard: ensure type is task_rating (enum or string)
        $type = is_object($config->type) ? $config->type->value : $config->type;
        if ($type !== RatingConfigType::TASK_RATING && $type !== RatingConfigType::TASK_RATING->value) {
            throw new \Exception('Provided rating configuration is not a task rating config');
        }

        // Calculate final rating using the provided config
        $finalRating = $this->calculateRating($data['rating_data'], $config);

        // 🔁 Upsert by (task_id, rater_id) to avoid duplicate-key errors
        $rating = TaskRating::updateOrCreate(
            [
                'task_id'  => $data['task_id'],
                'rater_id' => $data['rater_id'],
            ],
            [
                'rating_data'     => $data['rating_data'],
                'final_rating'    => $finalRating,
                'config_snapshot' => $config->config_data, // snapshot only
                'rated_at'        => now(),
            ]
        );

        return $rating->load(['task', 'rater']);
    }

    public function updateTaskRating(int $id, array $data): ?TaskRating
    {
        $rating = TaskRating::find($id);
        if (!$rating) {
            return null;
        }

        // If a new config is provided, use it and refresh snapshot
        if (array_key_exists('rating_config_id', $data) && $data['rating_config_id']) {
            $config = RatingConfig::find($data['rating_config_id']);
            if (!$config) {
                throw new \Exception('Rating configuration not found');
            }
            $type = is_object($config->type) ? $config->type->value : $config->type;
            if ($type !== RatingConfigType::TASK_RATING && $type !== RatingConfigType::TASK_RATING->value) {
                throw new \Exception('Provided rating configuration is not a task rating config');
            }
            // refresh snapshot to reflect the config used now
            $rating->config_snapshot = $config->config_data;
        } else {
            // reconstruct a config-like object from snapshot for calculation
            $config = new RatingConfig([
                'config_data' => $rating->config_snapshot,
                'type' => RatingConfigType::TASK_RATING
            ]);
        }

        if (isset($data['rating_data'])) {
            $data['final_rating'] = $this->calculateRating($data['rating_data'], $config);
        }

        // do NOT persist rating_config_id; only snapshot is stored
        unset($data['rating_config_id']);

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
