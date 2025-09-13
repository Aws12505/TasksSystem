<?php

namespace App\Http\Controllers;

use App\Http\Requests\CalculateFinalRatingRequest;
use App\Services\FinalRatingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class FinalRatingController extends Controller
{
    public function __construct(
        private FinalRatingService $finalRatingService
    ) {}

    public function index(): JsonResponse
    {
        $ratings = $this->finalRatingService->getAllFinalRatings();

        return response()->json([
            'success' => true,
            'data' => $ratings->items(),
            'pagination' => [
                'current_page' => $ratings->currentPage(),
                'total' => $ratings->total(),
                'per_page' => $ratings->perPage(),
                'last_page' => $ratings->lastPage(),
                'from' => $ratings->firstItem(),
                'to' => $ratings->lastItem(),
            ],
            'message' => 'Final ratings retrieved successfully',
        ]);
    }

    public function calculateForUser(CalculateFinalRatingRequest $request, int $userId): JsonResponse
    {
        try {
            $data = $request->validated();
            
            $rating = $this->finalRatingService->calculateFinalRating(
                $userId,
                Carbon::parse($data['period_start']),
                Carbon::parse($data['period_end'])
            );

            return response()->json([
                'success' => true,
                'data' => $rating,
                'message' => 'Final rating calculated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getUserRating(int $userId, string $periodStart, string $periodEnd): JsonResponse
    {
        $rating = $this->finalRatingService->getFinalRatingByUser(
            $userId,
            Carbon::parse($periodStart),
            Carbon::parse($periodEnd)
        );

        if (!$rating) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Final rating not found for this user and period',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $rating,
            'message' => 'Final rating retrieved successfully',
        ]);
    }
}
