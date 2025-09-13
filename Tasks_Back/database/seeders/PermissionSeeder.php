<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Project permissions
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            
            // User management permissions
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // Role management permissions
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign roles',
        ];

        foreach ($permissions as $permission) {
            Permission::create([
                'name' => $permission,
                'guard_name' => 'sanctum'
            ]);
        }

        // Create default roles
        $adminRole = Role::create([
            'name' => 'admin',
            'guard_name' => 'sanctum'
        ]);

        $adminRole->givePermissionTo($permissions);
    }
}
