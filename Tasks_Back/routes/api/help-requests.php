<?php

use App\Http\Controllers\HelpRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Help Request Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view help requests'])->group(function () {
        Route::get('help-requests/available', [HelpRequestController::class, 'available'])->name('help-requests.available');
        Route::get('help-requests', [HelpRequestController::class, 'index'])->name('help-requests.index');
        Route::get('help-requests/{id}', [HelpRequestController::class, 'show'])->name('help-requests.show');
        Route::get('users/{userId}/help-requests/requested', [HelpRequestController::class, 'getByRequester'])->name('help-requests.by-requester');
        Route::get('users/{userId}/help-requests/helping', [HelpRequestController::class, 'getByHelper'])->name('help-requests.by-helper');
    });
    
    Route::middleware(['permission:create help requests'])->group(function () {
        Route::post('help-requests', [HelpRequestController::class, 'store'])->name('help-requests.store');
    });
    
    Route::middleware(['permission:edit help requests'])->group(function () {
        Route::put('help-requests/{id}', [HelpRequestController::class, 'update'])->name('help-requests.update');
        Route::post('help-requests/{id}/claim', [HelpRequestController::class, 'claim'])->name('help-requests.claim');
        Route::post('help-requests/{id}/assign/{userId}', [HelpRequestController::class, 'assign'])->name('help-requests.assign');
        Route::post('help-requests/{id}/complete', [HelpRequestController::class, 'complete'])->name('help-requests.complete');
        Route::post('help-requests/{id}/unclaim', [HelpRequestController::class, 'unclaim'])->name('help-requests.unclaim');
    });
    
    Route::middleware(['permission:delete help requests'])->group(function () {
        Route::delete('help-requests/{id}', [HelpRequestController::class, 'destroy'])->name('help-requests.destroy');
    });
});
