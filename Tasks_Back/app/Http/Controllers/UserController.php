<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\SyncUserRolesRequest;
use App\Http\Requests\SyncUserPermissionsRequest;
use App\Http\Requests\SyncUserRolesAndPermissionsRequest;
use App\Services\UserService;
use App\Services\RolesAndPermissionsService;
use Illuminate\Http\JsonResponse;
use App\Services\TaskAssignmentService;
use App\Models\User;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService,
        private RolesAndPermissionsService $rolesAndPermissionsService,
        private TaskAssignmentService $taskAssignmentService
    ) {}

    public function index(): JsonResponse
    {
        $users = $this->userService->getAllUsers();

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ],
            'message' => 'Users retrieved successfully',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User retrieved successfully',
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User created successfully',
        ], 201);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->updateUser($id, $request->validated());

        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->userService->deleteUser($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'User deleted successfully',
        ]);
    }

    // User Roles and Permissions Management (Direct calls to RolesAndPermissionsService)
    public function getRolesAndPermissions(int $id): JsonResponse
    {
        $data = $this->rolesAndPermissionsService->getUserRolesAndPermissions($id);

        if (!$data) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'User roles and permissions retrieved successfully',
        ]);
    }

    public function syncRoles(SyncUserRolesRequest $request, int $id): JsonResponse
    {
        $user = $this->rolesAndPermissionsService->syncUserRoles($id, $request->validated()['roles']);

        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User roles synced successfully',
        ]);
    }

    public function syncPermissions(SyncUserPermissionsRequest $request, int $id): JsonResponse
    {
        $user = $this->rolesAndPermissionsService->syncUserPermissions($id, $request->validated()['permissions']);

        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User permissions synced successfully',
        ]);
    }

    public function syncRolesAndPermissions(SyncUserRolesAndPermissionsRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        $user = $this->rolesAndPermissionsService->syncUserRolesAndPermissions(
            $id,
            $data['roles'] ?? [],
            $data['permissions'] ?? []
        );

        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User roles and permissions synced successfully',
        ]);
    }

    // User Projects
    public function getProjects(int $id): JsonResponse
    {
        $projects = $this->userService->getUserProjects($id);

        if ($projects === null) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }

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
            'message' => 'User projects retrieved successfully',
        ]);
    }
    public function getTaskAssignments(int $id): JsonResponse
{
    $assignments = $this->taskAssignmentService->getUserTaskAssignments($id);

    if ($assignments->isEmpty()) {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found',
            ], 404);
        }
    }

    return response()->json([
        'success' => true,
        'data' => $assignments,
        'message' => 'User task assignments retrieved successfully',
    ]);
}
}
