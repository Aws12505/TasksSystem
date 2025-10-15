<?php

use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Role Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view roles'])->group(function () {
        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('roles/{id}', [RoleController::class, 'show'])->name('roles.show');
    });
    
    Route::middleware(['permission:create roles'])->group(function () {
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    });
    
    Route::middleware(['permission:edit roles'])->group(function () {
        Route::put('roles/{id}', [RoleController::class, 'update'])->name('roles.update');
    });
    
    Route::middleware(['permission:delete roles'])->group(function () {
        Route::delete('roles/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });
});
