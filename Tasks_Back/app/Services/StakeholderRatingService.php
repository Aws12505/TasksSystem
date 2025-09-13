<?php

namespace App\Services;

use App\Models\StakeholderRating;
use App\Models\RatingConfig;
use App\Enums\RatingConfigType;

class StakeholderRatingService
{
    public function createStakeholderRating(array $data): StakeholderRating
    {
        $config = RatingConfig::getActiveByType(RatingConfigType::STAKEHOLDER_RATING);
        
        if (!$config) {
            throw new \Exception('No active stakeholder rating configuration found');
        }

        // Calculate final rating based on config
        $finalRating = $this->calculateRating($data['rating_data'], $config);

        return StakeholderRating::create([
            'project_id' => $data['project_id'],
            'stakeholder_id' => $data['stakeholder_id'],
            'rating_data' => $data['rating_data'],
            'final_rating' => $finalRating,
            'config_snapshot' => $config->config_data,
            'rated_at' => now(),
        ])->load(['project', 'stakeholder']);
    }

    public function updateStakeholderRating(int $id, array $data): ?StakeholderRating
    {
        $rating = StakeholderRating::find($id);
        
        if (!$rating) {
            return null;
        }

        if (isset($data['rating_data'])) {
            // Recalculate using stored config snapshot
            $config = new RatingConfig(['config_data' => $rating->config_snapshot]);
            $data['final_rating'] = $this->calculateRating($data['rating_data'], $config);
        }

        $rating->update($data);
        return $rating->fresh(['project', 'stakeholder']);
    }

    public function getRatingsByProject(int $projectId): \Illuminate\Pagination\LengthAwarePaginator
    {
        return StakeholderRating::where('project_id', $projectId)
                               ->with('stakeholder')
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
