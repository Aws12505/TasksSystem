<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    // User CRUD Operations
    public function getAllUsers(int $perPage = 15): LengthAwarePaginator
    {
        return User::with(['roles', 'permissions'])->latest()->paginate($perPage);
    }

    public function getUserById(int $id)
    {
        return User::with(['roles', 'permissions'])->find($id);
    }

    public function createUser(array $data): User
    {
        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user = User::create($data);

        // Assign roles if provided
        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        // Assign permissions if provided
        if (isset($data['permissions'])) {
            $user->syncPermissions($data['permissions']);
        }

        return $user->load(['roles', 'permissions']);
    }

    public function updateUser(int $id, array $data): ?User
    {
        $user = User::find($id);
        
        if (!$user) {
            return null;
        }

        // Hash password if provided
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            // Remove password from data if not provided or empty
            unset($data['password']);
        }

        // Remove roles and permissions from main update data
        $roles = $data['roles'] ?? null;
        $permissions = $data['permissions'] ?? null;
        unset($data['roles'], $data['permissions']);

        $user->update($data);

        // Sync roles if provided
        if ($roles !== null) {
            $user->syncRoles($roles);
        }

        // Sync permissions if provided
        if ($permissions !== null) {
            $user->syncPermissions($permissions);
        }

        return $user->fresh(['roles', 'permissions']);
    }

    public function deleteUser(int $id): bool
    {
        $user = User::find($id);
        
        if (!$user) {
            return false;
        }

        return $user->delete();
    }

    // User Projects (separate method when projects are needed)
    public function getUserProjects(int $userId, int $perPage = 15): ?LengthAwarePaginator
    {
        $user = User::find($userId);
        
        if (!$user) {
            return null;
        }

        return $user->projects()->latest()->paginate($perPage);
    }

    // Get user with projects when specifically needed
    public function getUserWithProjects(int $id)
    {
        return User::with(['roles', 'permissions', 'projects'])->find($id);
    }
}
