<?php

namespace App\Services;

use App\Models\FinalRating;
use App\Models\RatingConfig;
use App\Enums\RatingConfigType;
use Carbon\Carbon;

class FinalRatingService
{
    public function __construct(
        private FormulaEvaluatorService $formulaEvaluator
    ) {}

    public function calculateFinalRating(int $userId, Carbon $periodStart, Carbon $periodEnd): FinalRating
    {
        $config = RatingConfig::getActiveByType(RatingConfigType::FINAL_RATING);
        
        if (!$config) {
            throw new \Exception('No active final rating configuration found');
        }

        // Get formula expression and variables
        $expression = $config->getFormulaExpression();
        $variableDefinitions = $config->getVariableDefinitions();

        // Evaluate the formula with user-scoped data
        $finalRating = $this->formulaEvaluator->evaluate($expression, $variableDefinitions, $userId, $periodStart, $periodEnd);

        // Get calculation details
        $calculationSteps = $this->formulaEvaluator->getCalculationSteps();
        $variablesUsed = $this->formulaEvaluator->getVariables();

        return FinalRating::updateOrCreate(
            [
                'user_id' => $userId,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
            ],
            [
                'final_rating' => min(100, max(0, $finalRating)), // Keep between 0-100%
                'calculation_steps' => $calculationSteps,
                'variables_used' => $variablesUsed,
                'config_snapshot' => $config->config_data,
                'calculated_at' => now(),
            ]
        )->load('user');
    }

    public function getFinalRatingByUser(int $userId, Carbon $periodStart, Carbon $periodEnd): ?FinalRating
    {
        return FinalRating::where('user_id', $userId)
                         ->where('period_start', $periodStart)
                         ->where('period_end', $periodEnd)
                         ->with('user')
                         ->first();
    }

    public function getAllFinalRatings(int $perPage = 15): \Illuminate\Pagination\LengthAwarePaginator
    {
        return FinalRating::with('user')
                         ->latest('calculated_at')
                         ->paginate($perPage);
    }
}
