<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Services\WorkspaceService;
use App\Http\Requests\WorkspaceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class WorkspaceController extends Controller
{
    protected WorkspaceService $workspaceService;

    public function __construct(WorkspaceService $workspaceService)
    {
        $this->workspaceService = $workspaceService;
    }

    public function index(): JsonResponse
    {
        try {

            $workspaces = $this->workspaceService->getAll();

            return response()->json([
                'success' => true,
                'data' => $workspaces
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch workspaces'
            ], 500);
        }
    }
    public function all(): JsonResponse
    {
        try {

            $workspaces = $this->workspaceService->getAllWorkspaces();

            return response()->json([
                'success' => true,
                'data' => $workspaces
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch workspaces'
            ], 500);
        }
    }

    

    public function store(WorkspaceRequest $request): JsonResponse
    {
        try {

            $workspace = $this->workspaceService->create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Workspace created successfully',
                'data' => $workspace
            ], 201);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to create workspace'
            ], 500);
        }
    }

    public function show(Workspace $workspace): JsonResponse
    {
        try {

            $this->ensureUserBelongsToWorkspace($workspace);

            return response()->json([
                'success' => true,
                'data' => $workspace
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        }
    }

    public function update(WorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        try {

            $this->ensureOwner($workspace);

            $workspace = $this->workspaceService->update($workspace, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Workspace updated successfully',
                'data' => $workspace
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        }
    }

    public function destroy(Workspace $workspace): JsonResponse
    {
        try {

            $this->ensureOwner($workspace);

            $this->workspaceService->delete($workspace);

            return response()->json([
                'success' => true,
                'message' => 'Workspace deleted successfully'
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    private function ensureUserBelongsToWorkspace(Workspace $workspace): void
    {
        $exists = Auth::user()
            ->workspaces()
            ->where('workspace_id', $workspace->id)
            ->exists();

        if (!$exists) {
            throw new \Exception('Unauthorized access to this workspace');
        }
    }

    private function ensureOwner(Workspace $workspace): void
    {
        $role = Auth::user()
            ->workspaces()
            ->where('workspace_id', $workspace->id)
            ->first()
            ?->pivot
            ?->role;

        if ($role !== 'owner') {
            throw new \Exception('Only owner can perform this action');
        }
    }
}
