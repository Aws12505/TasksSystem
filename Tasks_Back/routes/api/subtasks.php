<?php

use App\Http\Controllers\SubtaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Subtask Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view subtasks'])->group(function () {
        Route::get('subtasks', [SubtaskController::class, 'index'])->name('subtasks.index');
        Route::get('subtasks/{id}', [SubtaskController::class, 'show'])->name('subtasks.show');
        Route::post('subtasks/{id}/toggle', [SubtaskController::class, 'toggleCompletion'])->name('subtasks.toggle');
    });
    
    Route::middleware(['permission:create subtasks'])->group(function () {
        Route::post('subtasks', [SubtaskController::class, 'store'])->name('subtasks.store');
    });
    
    Route::middleware(['permission:edit subtasks'])->group(function () {
        Route::put('subtasks/{id}', [SubtaskController::class, 'update'])->name('subtasks.update');
    });
    
    Route::middleware(['permission:delete subtasks'])->group(function () {
        Route::delete('subtasks/{id}', [SubtaskController::class, 'destroy'])->name('subtasks.destroy');
    });
});
