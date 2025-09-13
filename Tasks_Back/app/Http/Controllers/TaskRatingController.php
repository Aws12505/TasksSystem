<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRatingRequest;
use App\Http\Requests\UpdateTaskRatingRequest;
use App\Services\TaskRatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class TaskRatingController extends Controller
{
    public function __construct(
        private TaskRatingService $taskRatingService
    ) {}

    public function store(StoreTaskRatingRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['rater_id'] = Auth::id();

            $rating = $this->taskRatingService->createTaskRating($data);

            return response()->json([
                'success' => true,
                'data' => $rating,
                'message' => 'Task rating created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function update(UpdateTaskRatingRequest $request, int $id): JsonResponse
    {
        $rating = $this->taskRatingService->updateTaskRating($id, $request->validated());

        if (!$rating) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task rating not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $rating,
            'message' => 'Task rating updated successfully',
        ]);
    }

    public function getByTask(int $taskId): JsonResponse
    {
        $ratings = $this->taskRatingService->getRatingsByTask($taskId);

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
            'message' => 'Task ratings retrieved successfully',
        ]);
    }
}
