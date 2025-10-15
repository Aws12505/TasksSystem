<?php

use App\Http\Controllers\KanbanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Kanban Board Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view projects'])->group(function () {
        Route::get('projects/{project}/kanban', [KanbanController::class, 'getProjectKanban'])->name('kanban.project');
    });
    
    Route::middleware(['permission:edit tasks'])->group(function () {
        Route::post('tasks/{task}/move-section', [KanbanController::class, 'moveTaskToSection'])->name('kanban.move-section');
        Route::post('tasks/{task}/move-status', [KanbanController::class, 'moveTaskStatus'])->name('kanban.move-status');
    });
});
