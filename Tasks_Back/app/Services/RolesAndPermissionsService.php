<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class RolesAndPermissionsService
{
    // Role CRUD Operations
    public function getAllRoles(int $perPage = 15): LengthAwarePaginator
    {
        return Role::with('permissions')->latest()->paginate($perPage);
    }

    public function getRoleById(int $id): ?Role
    {
        return Role::with('permissions')->find($id);
    }

    public function createRole(array $data): Role
    {
        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'sanctum'
        ]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->load('permissions');
    }

    public function updateRole(int $id, array $data): ?Role
    {
        $role = Role::find($id);
        
        if (!$role) {
            return null;
        }

        $role->update(['name' => $data['name']]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->fresh(['permissions']);
    }

    public function deleteRole(int $id): bool
    {
        $role = Role::find($id);
        
        if (!$role) {
            return false;
        }

        return $role->delete();
    }

    // Permission Operations (Read Only)
    public function getAllPermissions(): Collection
    {
        return Permission::all();
    }

    public function getPermissionById(int $id): ?Permission
    {
        return Permission::find($id);
    }

    // User Role and Permission Sync Operations (for use in User controller)
    public function syncUserRoles(int $userId, array $roles): ?User
    {
        $user = User::find($userId);
        
        if (!$user) {
            return null;
        }

        $user->syncRoles($roles);
        return $user->fresh(['roles']);
    }

    public function syncUserPermissions(int $userId, array $permissions): ?User
    {
        $user = User::find($userId);
        
        if (!$user) {
            return null;
        }

        $user->syncPermissions($permissions);
        return $user->fresh(['permissions']);
    }

    public function syncUserRolesAndPermissions(int $userId, array $roles = [], array $permissions = []): ?User
    {
        $user = User::find($userId);
        
        if (!$user) {
            return null;
        }

        $user->syncRoles($roles);
        $user->syncPermissions($permissions);
        
        return $user->fresh(['roles', 'permissions']);
    }

    // Get User's Roles and Permissions (for use in User controller)
    public function getUserRolesAndPermissions(int $userId): ?array
    {
        $user = User::with(['roles', 'permissions'])->find($userId);
        
        if (!$user) {
            return null;
        }

        return [
            'user' => $user,
            'roles' => $user->roles,
            'direct_permissions' => $user->permissions,
            'all_permissions' => $user->getAllPermissions(),
        ];
    }
}
