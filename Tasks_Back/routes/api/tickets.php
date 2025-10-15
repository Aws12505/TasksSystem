<?php

use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Ticket Management Routes
|--------------------------------------------------------------------------
*/

// Public route for ticket creation
Route::post('tickets', [TicketController::class, 'store'])->name('tickets.store.public');

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::middleware(['permission:view tickets'])->group(function () {
        Route::get('tickets/available', [TicketController::class, 'available'])->name('tickets.available');
        Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/{id}', [TicketController::class, 'show'])->name('tickets.show');
        Route::get('tickets/status/{status}', [TicketController::class, 'getByStatus'])->name('tickets.by-status');
        Route::get('tickets/type/{type}', [TicketController::class, 'getByType'])->name('tickets.by-type');
        Route::get('users/{userId}/tickets/requested', [TicketController::class, 'getByRequester'])->name('tickets.by-requester');
        Route::get('users/{userId}/tickets/assigned', [TicketController::class, 'getByAssignee'])->name('tickets.by-assignee');
    });
    
    // Ticket actions (available to authorized users)
    Route::post('tickets/{id}/complete', [TicketController::class, 'complete'])->name('tickets.complete');
    Route::post('tickets/{id}/unassign', [TicketController::class, 'unassign'])->name('tickets.unassign');
    Route::post('tickets/{id}/status', [TicketController::class, 'updateStatus'])->name('tickets.status');
    Route::post('tickets/{id}/claim', [TicketController::class, 'claim'])->name('tickets.claim');
    
    Route::middleware(['permission:edit tickets'])->group(function () {
        Route::put('tickets/{id}', [TicketController::class, 'update'])->name('tickets.update');
        Route::post('tickets/{id}/assign/{userId}', [TicketController::class, 'assign'])->name('tickets.assign');
    });
    
    Route::middleware(['permission:delete tickets'])->group(function () {
        Route::delete('tickets/{id}', [TicketController::class, 'destroy'])->name('tickets.destroy');
    });
});
