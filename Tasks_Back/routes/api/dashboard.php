<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/employee', [DashboardController::class, 'getEmployeeDashboard'])->name('dashboard.employee');
    Route::get('/dashboard/analytics', [DashboardController::class, 'getManagerAnalytics'])->name('dashboard.analytics');
});
