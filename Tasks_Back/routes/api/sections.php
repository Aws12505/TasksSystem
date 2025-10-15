<?php

use App\Http\Controllers\SectionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectAssignmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Section Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view sections'])->group(function () {
        Route::get('sections', [SectionController::class, 'index'])->name('sections.index');
        Route::get('sections/{id}', [SectionController::class, 'show'])->name('sections.show');
        Route::get('sections/{sectionId}/tasks', [TaskController::class, 'getBySection'])->name('sections.tasks');
        Route::get('sections/{sectionId}/tasks-with-assignments', [ProjectAssignmentController::class, 'getSectionTasksWithAssignments'])->name('sections.tasks-assignments');
    });
    
    Route::middleware(['permission:create sections'])->group(function () {
        Route::post('sections', [SectionController::class, 'store'])->name('sections.store');
    });
    
    Route::middleware(['permission:edit sections'])->group(function () {
        Route::put('sections/{id}', [SectionController::class, 'update'])->name('sections.update');
    });
    
    Route::middleware(['permission:delete sections'])->group(function () {
        Route::delete('sections/{id}', [SectionController::class, 'destroy'])->name('sections.destroy');
    });
});
