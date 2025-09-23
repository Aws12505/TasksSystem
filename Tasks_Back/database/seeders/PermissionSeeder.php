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
            
            // Permission management
            'view permissions',
            
            // Project management permissions
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            
            // Section management permissions
            'view sections',
            'create sections',
            'edit sections',
            'delete sections',
            
            // Task management permissions
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            
            // Subtask management permissions
            'view subtasks',
            'create subtasks',
            'edit subtasks',
            'delete subtasks',
            
            // Help request permissions
            'view help requests',
            'create help requests',
            'edit help requests',
            'delete help requests',
            
            // Ticket permissions
            'view tickets',
            'edit tickets',
            'delete tickets',
            
            // Rating configuration permissions
            'view rating configs',
            'create rating configs',
            'edit rating configs',
            'delete rating configs',
            
            // Rating permissions
            'create task ratings',
            'edit task ratings',
            'create stakeholder ratings',
            'edit stakeholder ratings',
            'view final ratings',
            'calculate final ratings',
            
            // Analytics permissions
            'view analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'sanctum'],
                ['name' => $permission, 'guard_name' => 'sanctum']
            );
        }

        // Create default roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'sanctum'],
            ['name' => 'admin', 'guard_name' => 'sanctum']
        );

        // Admin gets all permissions
        $adminRole->syncPermissions($permissions);


        $this->command->info('Permissions and roles created successfully!');
    }
}
