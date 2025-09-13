<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    public function index(): JsonResponse
    {
        $projects = $this->projectService->getAllProjects();

        return response()->json([
            'success' => true,
            'data' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
                'last_page' => $projects->lastPage(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
            ],
            'message' => 'Projects retrieved successfully',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $project = $this->projectService->getProjectById($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Project not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project retrieved successfully',
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['stakeholder_id'] = Auth::id(); // Set current user as stakeholder
        
        $project = $this->projectService->createProject($data);

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project created successfully',
        ], 201);
    }

    public function update(UpdateProjectRequest $request, int $id): JsonResponse
    {
        $project = $this->projectService->updateProject($id, $request->validated());

        if (!$project) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Project not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->projectService->deleteProject($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Project not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Project deleted successfully',
        ]);
    }
}
