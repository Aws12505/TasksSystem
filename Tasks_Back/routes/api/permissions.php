<?php

use App\Http\Controllers\PermissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Permission Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'permission:view permissions'])->group(function () {
    Route::get('permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::get('permissions/{id}', [PermissionController::class, 'show'])->name('permissions.show');
});
