<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveTaskRequest;
use App\Services\KanbanService;
use Illuminate\Http\JsonResponse;

class KanbanController extends Controller
{
    public function __construct(
        private KanbanService $kanbanService
    ) {}

    public function getProjectKanban(int $projectId): JsonResponse
    {
        $kanban = $this->kanbanService->getProjectKanban($projectId);

        if (!$kanban) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Project not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $kanban,
            'message' => 'Project kanban retrieved successfully',
        ]);
    }

    public function moveTaskToSection(MoveTaskRequest $request, int $taskId): JsonResponse
    {
        $data = $request->validated();
        $task = $this->kanbanService->moveTaskToSection($taskId, $data['section_id']);

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task moved to section successfully',
        ]);
    }

    public function moveTaskStatus(MoveTaskRequest $request, int $taskId): JsonResponse
    {
        $data = $request->validated();
        $task = $this->kanbanService->moveTaskStatus($taskId, $data['status']);

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task status updated successfully',
        ]);
    }
}
