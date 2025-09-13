<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Services\RolesAndPermissionsService;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function __construct(
        private RolesAndPermissionsService $rolesAndPermissionsService
    ) {}

    public function index(): JsonResponse
    {
        $roles = $this->rolesAndPermissionsService->getAllRoles();

        return response()->json([
            'success' => true,
            'data' => $roles->items(),
            'pagination' => [
                'current_page' => $roles->currentPage(),
                'total' => $roles->total(),
                'per_page' => $roles->perPage(),
                'last_page' => $roles->lastPage(),
                'from' => $roles->firstItem(),
                'to' => $roles->lastItem(),
            ],
            'message' => 'Roles retrieved successfully',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $role = $this->rolesAndPermissionsService->getRoleById($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Role not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $role,
            'message' => 'Role retrieved successfully',
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->rolesAndPermissionsService->createRole($request->validated());

        return response()->json([
            'success' => true,
            'data' => $role,
            'message' => 'Role created successfully',
        ], 201);
    }

    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $role = $this->rolesAndPermissionsService->updateRole($id, $request->validated());

        if (!$role) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Role not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $role,
            'message' => 'Role updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->rolesAndPermissionsService->deleteRole($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Role not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Role deleted successfully',
        ]);
    }
}
