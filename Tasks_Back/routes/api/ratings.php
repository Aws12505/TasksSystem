<?php

use App\Http\Controllers\RatingConfigController;
use App\Http\Controllers\TaskRatingController;
use App\Http\Controllers\StakeholderRatingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rating System Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    // Rating Configs
    Route::middleware(['permission:view rating configs'])->group(function () {
        Route::get('rating-configs', [RatingConfigController::class, 'index'])->name('rating-configs.index');
        Route::get('rating-configs/{id}', [RatingConfigController::class, 'show'])->name('rating-configs.show');
        Route::get('rating-configs/type/{type}', [RatingConfigController::class, 'getByType'])->name('rating-configs.by-type');
        Route::get('rating-configs/type/{type}/active', [RatingConfigController::class, 'getActiveByType'])->name('rating-configs.active-by-type');
    });
    
    Route::middleware(['permission:create rating configs'])->group(function () {
        Route::post('rating-configs', [RatingConfigController::class, 'store'])->name('rating-configs.store');
    });
    
    Route::middleware(['permission:edit rating configs'])->group(function () {
        Route::put('rating-configs/{id}', [RatingConfigController::class, 'update'])->name('rating-configs.update');
        Route::post('rating-configs/{id}/activate', [RatingConfigController::class, 'activate'])->name('rating-configs.activate');
    });
    
    Route::middleware(['permission:delete rating configs'])->group(function () {
        Route::delete('rating-configs/{id}', [RatingConfigController::class, 'destroy'])->name('rating-configs.destroy');
    });
    
    // Task Ratings
    Route::middleware(['permission:create task ratings'])->group(function () {
        Route::post('task-ratings', [TaskRatingController::class, 'store'])->name('task-ratings.store');
    });
    
    Route::middleware(['permission:edit task ratings'])->group(function () {
        Route::put('task-ratings/{id}', [TaskRatingController::class, 'update'])->name('task-ratings.update');
    });
    
    // Stakeholder Ratings
    Route::middleware(['permission:create stakeholder ratings'])->group(function () {
        Route::post('stakeholder-ratings', [StakeholderRatingController::class, 'store'])->name('stakeholder-ratings.store');
    });
    
    Route::middleware(['permission:edit stakeholder ratings'])->group(function () {
        Route::put('stakeholder-ratings/{id}', [StakeholderRatingController::class, 'update'])->name('stakeholder-ratings.update');
    });
});
