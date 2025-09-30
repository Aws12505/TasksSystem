<?php

namespace App\Http\Controllers;

use App\Http\Requests\CalculateFinalRatingRequest;
use App\Services\FinalRatingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\TaskRating;
use App\Models\User;
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

    public function calculateWeightedRatings(Request $request): JsonResponse
{
    $validated = $request->validate([
        'user_ids' => 'required|array',
        'user_ids.*' => 'required|integer|exists:users,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    $userIds = $validated['user_ids'];
    $startDate = Carbon::parse($validated['start_date'])->startOfDay();
    $endDate = Carbon::parse($validated['end_date'])->endOfDay();

    // Get latest rating for each task in date range
    $latestRatings = TaskRating::select('task_ratings.*')
        ->whereBetween('task_ratings.created_at', [$startDate, $endDate])
        ->whereIn('task_ratings.id', function ($query) use ($startDate, $endDate) {
            $query->select(DB::raw('MAX(id)'))
                ->from('task_ratings')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('task_id');
        })
        ->get();

    $results = [];

    foreach ($userIds as $userId) {
        $totalWeightedRating = 0;
        $totalPercentage = 0;

        foreach ($latestRatings as $rating) {
            $taskUserPivot = DB::table('task_user')
                ->where('task_id', $rating->task_id)
                ->where('user_id', $userId)
                ->first();

            if ($taskUserPivot && $taskUserPivot->percentage > 0) {
                $percentage = $taskUserPivot->percentage;
                // Rating is already out of 100, so just weight it by percentage
                $totalWeightedRating += ($rating->final_rating * $percentage);
                $totalPercentage += $percentage;
            }
        }

        // Calculate weighted average - ALREADY out of 100
        $ratingOutOf100 = null;
        if ($totalPercentage > 0) {
            $ratingOutOf100 = round($totalWeightedRating / $totalPercentage, 2);
        }

        $user = User::find($userId);

        $results[] = [
            'user_name' => $user->name,
            'rating' => $ratingOutOf100
        ];
    }

    return response()->json($results);
}
}
