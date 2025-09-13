<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubtaskRequest;
use App\Http\Requests\UpdateSubtaskRequest;
use App\Services\SubtaskService;
use Illuminate\Http\JsonResponse;

class SubtaskController extends Controller
{
    public function __construct(
        private SubtaskService $subtaskService
    ) {}

    public function index(): JsonResponse
    {
        $subtasks = $this->subtaskService->getAllSubtasks();

        return response()->json([
            'success' => true,
            'data' => $subtasks->items(),
            'pagination' => [
                'current_page' => $subtasks->currentPage(),
                'total' => $subtasks->total(),
                'per_page' => $subtasks->perPage(),
                'last_page' => $subtasks->lastPage(),
                'from' => $subtasks->firstItem(),
                'to' => $subtasks->lastItem(),
            ],
            'message' => 'Subtasks retrieved successfully',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $subtask = $this->subtaskService->getSubtaskById($id);

        if (!$subtask) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Subtask not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subtask,
            'message' => 'Subtask retrieved successfully',
        ]);
    }

    public function store(StoreSubtaskRequest $request): JsonResponse
    {
        $subtask = $this->subtaskService->createSubtask($request->validated());

        return response()->json([
            'success' => true,
            'data' => $subtask,
            'message' => 'Subtask created successfully',
        ], 201);
    }

    public function update(UpdateSubtaskRequest $request, int $id): JsonResponse
    {
        $subtask = $this->subtaskService->updateSubtask($id, $request->validated());

        if (!$subtask) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Subtask not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subtask,
            'message' => 'Subtask updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->subtaskService->deleteSubtask($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Subtask not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Subtask deleted successfully',
        ]);
    }

    public function getByTask(int $taskId): JsonResponse
    {
        $subtasks = $this->subtaskService->getSubtasksByTask($taskId);

        return response()->json([
            'success' => true,
            'data' => $subtasks->items(),
            'pagination' => [
                'current_page' => $subtasks->currentPage(),
                'total' => $subtasks->total(),
                'per_page' => $subtasks->perPage(),
                'last_page' => $subtasks->lastPage(),
                'from' => $subtasks->firstItem(),
                'to' => $subtasks->lastItem(),
            ],
            'message' => 'Task subtasks retrieved successfully',
        ]);
    }

    public function toggleCompletion(int $id): JsonResponse
    {
        $subtask = $this->subtaskService->toggleSubtaskCompletion($id);

        if (!$subtask) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Subtask not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subtask,
            'message' => 'Subtask completion toggled successfully',
        ]);
    }
}
