<?php

use App\Http\Controllers\TaskController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\HelpRequestController;
use App\Http\Controllers\TaskRatingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskCommentController;

/*
|--------------------------------------------------------------------------
| Task Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view tasks'])->group(function () {
        Route::get('tasks', [TaskController::class, 'index'])->name('tasks.index');
        Route::get('tasks/{id}', [TaskController::class, 'show'])->name('tasks.show');
        Route::get('tasks/{id}/with-assignments', [TaskController::class, 'showWithAssignments'])->name('tasks.with-assignments');
        Route::get('tasks/{taskId}/subtasks', [SubtaskController::class, 'getByTask'])->name('tasks.subtasks');
        Route::get('tasks/{taskId}/help-requests', [HelpRequestController::class, 'getByTask'])->name('tasks.help-requests');
        Route::get('tasks/{taskId}/ratings', [TaskRatingController::class, 'getByTask'])->name('tasks.ratings');
        Route::post('tasks/{id}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
        Route::post('tasks/{taskId}/comments', [TaskCommentController::class, 'store'])->name('tasks.comments.store');
        Route::put('comments/{commentId}', [TaskCommentController::class, 'update'])->name('comments.update');
        Route::delete('comments/{commentId}', [TaskCommentController::class, 'destroy'])->name('comments.destroy');
    });
    
    Route::middleware(['permission:create tasks'])->group(function () {
        Route::post('tasks/comprehensive', [TaskController::class, 'storeComprehensive'])->name('tasks.comprehensive');
        Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    });
    
    Route::middleware(['permission:edit tasks'])->group(function () {
        Route::put('tasks/{id}', [TaskController::class, 'update'])->name('tasks.update');
        Route::post('tasks/{id}/assign-users', [TaskController::class, 'assignUsers'])->name('tasks.assign-users');
        Route::post('tasks/{id}/add-user', [TaskController::class, 'addUser'])->name('tasks.add-user');
        Route::put('tasks/{id}/users/{userId}/assignment', [TaskController::class, 'updateUserAssignment'])->name('tasks.update-assignment');
        Route::delete('tasks/{id}/users/{userId}', [TaskController::class, 'removeUser'])->name('tasks.remove-user');
    });
    
    Route::middleware(['permission:delete tasks'])->group(function () {
        Route::delete('tasks/{id}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    });
});
