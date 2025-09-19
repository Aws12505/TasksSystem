<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\ProjectAssignmentController;
use App\Http\Controllers\HelpRequestController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\FinalRatingController;
use App\Http\Controllers\RatingConfigController;
use App\Http\Controllers\TaskRatingController;
use App\Http\Controllers\StakeholderRatingController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\KanbanController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth routes (public)
Route::post('/login', [AuthController::class, 'login']);

// Public routes
Route::post('tickets', [TicketController::class, 'store']);
Route::get('users', [UserController::class, 'index']);
// Protected routes
// routes/api.php (Add to existing protected routes)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // ==================== AUTH ====================
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // ==================== USERS ====================
    Route::apiResource('users', UserController::class)->except(['index']);
    Route::get('users/{id}/with-projects', [UserController::class, 'showWithProjects']);
    Route::get('users/{id}/roles-and-permissions', [UserController::class, 'getRolesAndPermissions']);
    Route::post('users/{id}/sync-roles', [UserController::class, 'syncRoles']);
    Route::post('users/{id}/sync-permissions', [UserController::class, 'syncPermissions']);
    Route::post('users/{id}/sync-roles-and-permissions', [UserController::class, 'syncRolesAndPermissions']);
    Route::get('users/{id}/projects', [UserController::class, 'getProjects']);
    
    // ==================== ROLES ====================
    Route::apiResource('roles', RoleController::class);
    
    // ==================== PERMISSIONS ====================
    Route::get('permissions', [PermissionController::class, 'index']);
    Route::get('permissions/{id}', [PermissionController::class, 'show']);
    
    // ==================== PROJECTS ====================
    Route::apiResource('projects', ProjectController::class);
    Route::get('projects/{projectId}/sections', [SectionController::class, 'getByProject']);
    
    // ==================== SECTIONS ====================
    Route::apiResource('sections', SectionController::class);
    Route::get('sections/{sectionId}/tasks', [TaskController::class, 'getBySection']);
    
    // ==================== TASKS ====================
    Route::apiResource('tasks', TaskController::class);
    Route::post('tasks/{id}/status', [TaskController::class, 'updateStatus']);
    Route::get('tasks/{taskId}/subtasks', [SubtaskController::class, 'getByTask']);
    
    // ==================== SUBTASKS ====================
    Route::apiResource('subtasks', SubtaskController::class);
    Route::post('subtasks/{id}/toggle', [SubtaskController::class, 'toggleCompletion']);

    // Task assignment management
    Route::get('tasks/{id}/with-assignments', [TaskController::class, 'showWithAssignments']);
    Route::post('tasks/{id}/assign-users', [TaskController::class, 'assignUsers']);
    Route::post('tasks/{id}/add-user', [TaskController::class, 'addUser']);
    Route::put('tasks/{id}/users/{userId}/assignment', [TaskController::class, 'updateUserAssignment']);
    Route::delete('tasks/{id}/users/{userId}', [TaskController::class, 'removeUser']);
    
    // User task assignments
    Route::get('users/{id}/task-assignments', [UserController::class, 'getTaskAssignments']);
    
    // Project assignments
    Route::get('projects/{projectId}/assignments', [ProjectAssignmentController::class, 'getProjectAssignments']);
    
    // Section tasks with assignments
    Route::get('sections/{sectionId}/tasks-with-assignments', [ProjectAssignmentController::class, 'getSectionTasksWithAssignments']);

    // ==================== HELP REQUESTS ====================
    Route::get('help-requests/available', [HelpRequestController::class, 'available']);
    Route::apiResource('help-requests', HelpRequestController::class);
    
    // Help request specific actions
    Route::post('help-requests/{id}/claim', [HelpRequestController::class, 'claim']);
    Route::post('help-requests/{id}/assign/{userId}', [HelpRequestController::class, 'assign']);
    Route::post('help-requests/{id}/complete', [HelpRequestController::class, 'complete']);
    Route::post('help-requests/{id}/unclaim', [HelpRequestController::class, 'unclaim']);
    
    // Task help requests
    Route::get('tasks/{taskId}/help-requests', [HelpRequestController::class, 'getByTask']);
    
    // User help requests
    Route::get('users/{userId}/help-requests/requested', [HelpRequestController::class, 'getByRequester']);
    Route::get('users/{userId}/help-requests/helping', [HelpRequestController::class, 'getByHelper']);

        // ==================== TICKETS ====================
    Route::get('tickets/available', [TicketController::class, 'available']);
    Route::apiResource('tickets', TicketController::class)->except(['store']);
    
    // Ticket specific actions
    Route::get('tickets/status/{status}', [TicketController::class, 'getByStatus']);
    Route::get('tickets/type/{type}', [TicketController::class, 'getByType']);
    Route::post('tickets/{id}/claim', [TicketController::class, 'claim']);
    Route::post('tickets/{id}/assign/{userId}', [TicketController::class, 'assign']);
    Route::post('tickets/{id}/complete', [TicketController::class, 'complete']);
    Route::post('tickets/{id}/unassign', [TicketController::class, 'unassign']);
    Route::post('tickets/{id}/status', [TicketController::class, 'updateStatus']);
    
    // User tickets
    Route::get('users/{userId}/tickets/requested', [TicketController::class, 'getByRequester']);
    Route::get('users/{userId}/tickets/assigned', [TicketController::class, 'getByAssignee']);

// ==================== RATING CONFIGS ====================
    Route::apiResource('rating-configs', RatingConfigController::class);
    Route::get('rating-configs/type/{type}', [RatingConfigController::class, 'getByType']);
    Route::post('rating-configs/{id}/activate', [RatingConfigController::class, 'activate']);
    Route::get('rating-configs/type/{type}/active', [RatingConfigController::class, 'getActiveByType']);
    // ==================== TASK RATINGS ====================
    Route::post('task-ratings', [TaskRatingController::class, 'store']);
    Route::put('task-ratings/{id}', [TaskRatingController::class, 'update']);
    Route::get('tasks/{taskId}/ratings', [TaskRatingController::class, 'getByTask']);
    
    // ==================== STAKEHOLDER RATINGS ====================
    Route::post('stakeholder-ratings', [StakeholderRatingController::class, 'store']);
    Route::put('stakeholder-ratings/{id}', [StakeholderRatingController::class, 'update']);
    Route::get('projects/{projectId}/stakeholder-ratings', [StakeholderRatingController::class, 'getByProject']);
    
    // ==================== FINAL RATINGS ====================
    Route::get('final-ratings', [FinalRatingController::class, 'index']);
    Route::post('users/{userId}/calculate-final-rating', [FinalRatingController::class, 'calculateForUser']);
    Route::get('users/{userId}/final-rating/{periodStart}/{periodEnd}', [FinalRatingController::class, 'getUserRating']);

    // ==================== ANALYTICS ====================
    Route::prefix('analytics')->group(function () {
        // Dashboard and overview
        Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('/report', [AnalyticsController::class, 'report']);
        Route::get('/export', [AnalyticsController::class, 'exportReport']);
        
        // User analytics
        Route::get('/users/{userId}', [AnalyticsController::class, 'userAnalytics']);
        Route::get('/top-performers', [AnalyticsController::class, 'topPerformers']);
        
        // Project analytics
        Route::get('/projects/{projectId}', [AnalyticsController::class, 'projectAnalytics']);
        
        // System analytics
        Route::get('/system', [AnalyticsController::class, 'systemStats']);
    });

    // Kanban routes
Route::prefix('projects/{project}')->group(function () {
    Route::get('kanban', [KanbanController::class, 'getProjectKanban']);
});

Route::prefix('tasks/{task}')->group(function () {
    Route::post('move-section', [KanbanController::class, 'moveTaskToSection']);
    Route::post('move-status', [KanbanController::class, 'moveTaskStatus']);
});

});
