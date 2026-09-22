<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Permissions for the Work Sessions module. Additive: creates the permissions
 * on the "sanctum" guard and grants them to the existing "admin" role without
 * touching any other grant (givePermissionTo, not syncPermissions).
 */
class WorkSessionPermissionSeeder extends Seeder
{
    public const PERMISSIONS = [
        'view all work sessions',      // admin list/show, live channel, users picker
        'manage work sessions',        // reopen a confirmed session
        'rate work sessions',          // monthly ratings CRUD + averages
        'view work session reports',   // overview + by-task reports
        'export work session reports', // PDF/zip export
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'sanctum'],
                ['name' => $permission, 'guard_name' => 'sanctum']
            );
        }

        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'sanctum'],
            ['name' => 'admin', 'guard_name' => 'sanctum']
        );

        $adminRole->givePermissionTo(self::PERMISSIONS);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        if ($this->command) {
            $this->command->info('Work session permissions created and granted to admin.');
        }
    }
}
