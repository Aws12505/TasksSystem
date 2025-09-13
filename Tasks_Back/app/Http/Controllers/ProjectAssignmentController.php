<?php

namespace App\Http\Controllers;

use App\Services\TaskAssignmentService;
use Illuminate\Http\JsonResponse;

class ProjectAssignmentController extends Controller
{
    public function __construct(
        private TaskAssignmentService $taskAssignmentService
    ) {}

    public function getProjectAssignments(int $projectId): JsonResponse
    {
        $assignments = $this->taskAssignmentService->getProjectAssignments($projectId);

        if (!$assignments) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Project not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $assignments,
            'message' => 'Project assignments retrieved successfully',
        ]);
    }

    public function getSectionTasksWithAssignments(int $sectionId): JsonResponse
    {
        $tasks = $this->taskAssignmentService->getSectionTasksWithAssignments($sectionId);

        return response()->json([
            'success' => true,
            'data' => $tasks,
            'message' => 'Section tasks with assignments retrieved successfully',
        ]);
    }
}
