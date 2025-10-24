<?php

use App\Http\Controllers\FinalRatingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Final Rating System Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'permission:calculate final ratings'])->group(function () {
    Route::prefix('final-ratings')->name('final-ratings.')->group(function () {
        
        // Calculation
        Route::post('/calculate', [FinalRatingController::class, 'calculate'])->name('calculate');
        Route::post('/export-pdf', [FinalRatingController::class, 'exportPdf'])->name('export-pdf');
        
        // Configs
        Route::get('/configs', [FinalRatingController::class, 'index'])->name('configs.index');
        Route::get('/configs/active', [FinalRatingController::class, 'getActive'])->name('configs.active');
        Route::get('/configs/default-structure', [FinalRatingController::class, 'getDefaultStructure'])->name('configs.default');
        Route::get('/configs/{id}', [FinalRatingController::class, 'show'])->name('configs.show');
        Route::post('/configs', [FinalRatingController::class, 'store'])->name('configs.store');
        Route::put('/configs/{id}', [FinalRatingController::class, 'update'])->name('configs.update');
        Route::delete('/configs/{id}', [FinalRatingController::class, 'destroy'])->name('configs.destroy');
        Route::post('/configs/{id}/activate', [FinalRatingController::class, 'activate'])->name('configs.activate');
    
        Route::post('/calculate-weighted-ratings-sos', [FinalRatingController::class, 'calculateWeightedRatingsSOS'])->name('calculate-weighted-ratings-sos');
    });
});
