<?php
// routes/api/work-sessions.php
//
// Daily Work Sessions module.
//   Employee endpoints: auth only (users manage their own session; the
//   WorkSession "user_scope" global scope restricts visibility).
//   Admin endpoints: gated by spatie permissions seeded in
//   WorkSessionPermissionSeeder (all granted to the "admin" role).
//
// Literal segments are declared before {id} routes and ids are constrained
// with whereNumber() so "/today", "/assignable-tasks", "/admin/*" and
// "/items/reorder" never collide with parameterised routes.

use App\Http\Controllers\WorkSession\MonthlyRatingController;
use App\Http\Controllers\WorkSession\WorkSessionAdminController;
use App\Http\Controllers\WorkSession\WorkSessionController;
use App\Http\Controllers\WorkSession\WorkSessionItemController;
use App\Http\Controllers\WorkSession\WorkSessionReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('work-sessions')->group(function () {
    // ========================================
    // ADMIN ENDPOINTS
    // ========================================
    Route::prefix('admin')->group(function () {
        Route::middleware('permission:view all work sessions')->group(function () {
            Route::get('/users', [WorkSessionAdminController::class, 'users']);
            Route::get('/sessions', [WorkSessionAdminController::class, 'index']);
            Route::get('/sessions/{workSession}', [WorkSessionAdminController::class, 'show'])
                ->whereNumber('workSession');
        });

        Route::middleware('permission:manage work sessions')->group(function () {
            Route::post('/sessions/{workSession}/reopen', [WorkSessionAdminController::class, 'reopen'])
                ->whereNumber('workSession');
        });

        Route::middleware('permission:view work session reports')->group(function () {
            Route::get('/reports/overview', [WorkSessionReportController::class, 'overview']);
            Route::get('/reports/by-task', [WorkSessionReportController::class, 'byTask']);
        });

        Route::middleware('permission:export work session reports')->group(function () {
            Route::post('/reports/export-pdf', [WorkSessionReportController::class, 'exportPdf']);
        });

        Route::middleware('permission:rate work sessions')->group(function () {
            Route::get('/ratings', [MonthlyRatingController::class, 'index']);
            Route::post('/ratings/average', [MonthlyRatingController::class, 'average']);
            Route::put('/ratings/{user}/{year}/{month}', [MonthlyRatingController::class, 'upsert'])
                ->whereNumber('user')->whereNumber('year')->whereNumber('month');
            Route::delete('/ratings/{user}/{year}/{month}', [MonthlyRatingController::class, 'destroy'])
                ->whereNumber('user')->whereNumber('year')->whereNumber('month');
        });
    });

    // ========================================
    // EMPLOYEE ENDPOINTS
    // ========================================
    Route::get('/today', [WorkSessionController::class, 'today']);
    Route::get('/assignable-tasks', [WorkSessionController::class, 'assignableTasks']);
    Route::get('/', [WorkSessionController::class, 'index']);
    Route::post('/', [WorkSessionController::class, 'start']);

    Route::get('/{workSession}', [WorkSessionController::class, 'show'])
        ->whereNumber('workSession');
    Route::put('/{workSession}', [WorkSessionController::class, 'updateSummary'])
        ->whereNumber('workSession');
    Route::post('/{workSession}/confirm', [WorkSessionController::class, 'confirm'])
        ->whereNumber('workSession');

    // Items
    Route::post('/{workSession}/items', [WorkSessionItemController::class, 'store'])
        ->whereNumber('workSession');
    Route::put('/{workSession}/items/reorder', [WorkSessionItemController::class, 'reorder'])
        ->whereNumber('workSession');
    Route::put('/{workSession}/items/{item}', [WorkSessionItemController::class, 'update'])
        ->whereNumber('workSession')->whereNumber('item');
    Route::put('/{workSession}/items/{item}/outcome', [WorkSessionItemController::class, 'setOutcome'])
        ->whereNumber('workSession')->whereNumber('item');
    Route::delete('/{workSession}/items/{item}', [WorkSessionItemController::class, 'destroy'])
        ->whereNumber('workSession')->whereNumber('item');
});
