<?php

namespace App\Http\Controllers;

use App\Services\RolesAndPermissionsService;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function __construct(
        private RolesAndPermissionsService $rolesAndPermissionsService
    ) {}

    public function index(): JsonResponse
    {
        $permissions = $this->rolesAndPermissionsService->getAllPermissions();

        return response()->json([
            'success' => true,
            'data' => $permissions,
            'message' => 'Permissions retrieved successfully',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $permission = $this->rolesAndPermissionsService->getPermissionById($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Permission not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $permission,
            'message' => 'Permission retrieved successfully',
        ]);
    }
}
