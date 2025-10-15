<?php

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\ProjectAssignmentController;
use App\Http\Controllers\StakeholderRatingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Project Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view projects'])->group(function () {
        Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
        Route::get('projects/{id}', [ProjectController::class, 'show'])->name('projects.show');
        Route::get('projects/{projectId}/sections', [SectionController::class, 'getByProject'])->name('projects.sections');
        Route::get('projects/{projectId}/assignments', [ProjectAssignmentController::class, 'getProjectAssignments'])->name('projects.assignments');
        Route::get('projects/{projectId}/stakeholder-ratings', [StakeholderRatingController::class, 'getByProject'])->name('projects.stakeholder-ratings');
    });
    
    Route::middleware(['permission:create projects'])->group(function () {
        Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    });
    
    Route::middleware(['permission:edit projects'])->group(function () {
        Route::put('projects/{id}', [ProjectController::class, 'update'])->name('projects.update');
    });
    
    Route::middleware(['permission:delete projects'])->group(function () {
        Route::delete('projects/{id}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    });
});
