<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStakeholderRatingRequest;
use App\Http\Requests\UpdateStakeholderRatingRequest;
use App\Services\StakeholderRatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class StakeholderRatingController extends Controller
{
    public function __construct(
        private StakeholderRatingService $stakeholderRatingService
    ) {}

    public function store(StoreStakeholderRatingRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['stakeholder_id'] = Auth::id();
            
            $rating = $this->stakeholderRatingService->createStakeholderRating($data);

            return response()->json([
                'success' => true,
                'data' => $rating,
                'message' => 'Stakeholder rating created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function update(UpdateStakeholderRatingRequest $request, int $id): JsonResponse
    {
        $rating = $this->stakeholderRatingService->updateStakeholderRating($id, $request->validated());

        if (!$rating) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Stakeholder rating not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $rating,
            'message' => 'Stakeholder rating updated successfully',
        ]);
    }

    public function getByProject(int $projectId): JsonResponse
    {
        $ratings = $this->stakeholderRatingService->getRatingsByProject($projectId);

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
            'message' => 'Project stakeholder ratings retrieved successfully',
        ]);
    }
}
