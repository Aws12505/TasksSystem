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

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // ==================== AUTH ====================
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // ==================== USERS ====================
    Route::middleware(['permission:view users'])->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::get('users/{id}/with-projects', [UserController::class, 'showWithProjects']);
        Route::get('users/{id}/roles-and-permissions', [UserController::class, 'getRolesAndPermissions']);
        Route::get('users/{id}/projects', [UserController::class, 'getProjects']);
        Route::get('users/{id}/task-assignments', [UserController::class, 'getTaskAssignments']);
    });
    
    Route::middleware(['permission:create users'])->group(function () {
        Route::post('users', [UserController::class, 'store']);
    });
    
    Route::middleware(['permission:edit users'])->group(function () {
        Route::put('users/{id}', [UserController::class, 'update']);
        Route::post('users/{id}/sync-roles', [UserController::class, 'syncRoles']);
        Route::post('users/{id}/sync-permissions', [UserController::class, 'syncPermissions']);
        Route::post('users/{id}/sync-roles-and-permissions', [UserController::class, 'syncRolesAndPermissions']);
    });
    
    Route::middleware(['permission:delete users'])->group(function () {
        Route::delete('users/{id}', [UserController::class, 'destroy']);
    });
    
    // ==================== ROLES ====================
    Route::middleware(['permission:view roles'])->group(function () {
        Route::get('roles', [RoleController::class, 'index']);
        Route::get('roles/{id}', [RoleController::class, 'show']);
    });
    
    Route::middleware(['permission:create roles'])->group(function () {
        Route::post('roles', [RoleController::class, 'store']);
    });
    
    Route::middleware(['permission:edit roles'])->group(function () {
        Route::put('roles/{id}', [RoleController::class, 'update']);
    });
    
    Route::middleware(['permission:delete roles'])->group(function () {
        Route::delete('roles/{id}', [RoleController::class, 'destroy']);
    });
    
    // ==================== PERMISSIONS ====================
    Route::middleware(['permission:view permissions'])->group(function () {
        Route::get('permissions', [PermissionController::class, 'index']);
        Route::get('permissions/{id}', [PermissionController::class, 'show']);
    });
    
    // ==================== PROJECTS ====================
    Route::middleware(['permission:view projects'])->group(function () {
        Route::get('projects', [ProjectController::class, 'index']);
        Route::get('projects/{id}', [ProjectController::class, 'show']);
        Route::get('projects/{projectId}/sections', [SectionController::class, 'getByProject']);
        Route::get('projects/{projectId}/assignments', [ProjectAssignmentController::class, 'getProjectAssignments']);
        Route::get('projects/{projectId}/stakeholder-ratings', [StakeholderRatingController::class, 'getByProject']);
    });
    
    Route::middleware(['permission:create projects'])->group(function () {
        Route::post('projects', [ProjectController::class, 'store']);
    });
    
    Route::middleware(['permission:edit projects'])->group(function () {
        Route::put('projects/{id}', [ProjectController::class, 'update']);
    });
    
    Route::middleware(['permission:delete projects'])->group(function () {
        Route::delete('projects/{id}', [ProjectController::class, 'destroy']);
    });
    
    // ==================== SECTIONS ====================
    Route::middleware(['permission:view sections'])->group(function () {
        Route::get('sections', [SectionController::class, 'index']);
        Route::get('sections/{id}', [SectionController::class, 'show']);
        Route::get('sections/{sectionId}/tasks', [TaskController::class, 'getBySection']);
        Route::get('sections/{sectionId}/tasks-with-assignments', [ProjectAssignmentController::class, 'getSectionTasksWithAssignments']);
    });
    
    Route::middleware(['permission:create sections'])->group(function () {
        Route::post('sections', [SectionController::class, 'store']);
    });
    
    Route::middleware(['permission:edit sections'])->group(function () {
        Route::put('sections/{id}', [SectionController::class, 'update']);
    });
    
    Route::middleware(['permission:delete sections'])->group(function () {
        Route::delete('sections/{id}', [SectionController::class, 'destroy']);
    });
    
    // ==================== TASKS ====================
    Route::middleware(['permission:view tasks'])->group(function () {
        Route::get('tasks', [TaskController::class, 'index']);
        Route::get('tasks/{id}', [TaskController::class, 'show']);
        Route::post('tasks/{id}/status', [TaskController::class, 'updateStatus']);
        Route::get('tasks/{id}/with-assignments', [TaskController::class, 'showWithAssignments']);
        Route::get('tasks/{taskId}/subtasks', [SubtaskController::class, 'getByTask']);
        Route::get('tasks/{taskId}/help-requests', [HelpRequestController::class, 'getByTask']);
        Route::get('tasks/{taskId}/ratings', [TaskRatingController::class, 'getByTask']);
    });
    
    Route::middleware(['permission:create tasks'])->group(function () {
        Route::post('tasks/comprehensive', [TaskController::class, 'storeComprehensive']);
        Route::post('tasks', [TaskController::class, 'store']);
    });
    
    Route::middleware(['permission:edit tasks'])->group(function () {
        Route::put('tasks/{id}', [TaskController::class, 'update']);
        Route::post('tasks/{id}/assign-users', [TaskController::class, 'assignUsers']);
        Route::post('tasks/{id}/add-user', [TaskController::class, 'addUser']);
        Route::put('tasks/{id}/users/{userId}/assignment', [TaskController::class, 'updateUserAssignment']);
        Route::delete('tasks/{id}/users/{userId}', [TaskController::class, 'removeUser']);
    });
    
    Route::middleware(['permission:delete tasks'])->group(function () {
        Route::delete('tasks/{id}', [TaskController::class, 'destroy']);
    });
    
    // ==================== SUBTASKS ====================
    Route::middleware(['permission:view subtasks'])->group(function () {
        Route::get('subtasks', [SubtaskController::class, 'index']);
        Route::get('subtasks/{id}', [SubtaskController::class, 'show']);
        Route::post('subtasks/{id}/toggle', [SubtaskController::class, 'toggleCompletion']);
    });
    
    Route::middleware(['permission:create subtasks'])->group(function () {
        Route::post('subtasks', [SubtaskController::class, 'store']);
    });
    
    Route::middleware(['permission:edit subtasks'])->group(function () {
        Route::put('subtasks/{id}', [SubtaskController::class, 'update']);
    });
    
    Route::middleware(['permission:delete subtasks'])->group(function () {
        Route::delete('subtasks/{id}', [SubtaskController::class, 'destroy']);
    });
    
    // ==================== HELP REQUESTS ====================
    Route::middleware(['permission:view help requests'])->group(function () {
        Route::get('help-requests/available', [HelpRequestController::class, 'available']);
        Route::get('help-requests', [HelpRequestController::class, 'index']);
        Route::get('help-requests/{id}', [HelpRequestController::class, 'show']);
        Route::get('users/{userId}/help-requests/requested', [HelpRequestController::class, 'getByRequester']);
        Route::get('users/{userId}/help-requests/helping', [HelpRequestController::class, 'getByHelper']);
    });
    
    Route::middleware(['permission:create help requests'])->group(function () {
        Route::post('help-requests', [HelpRequestController::class, 'store']);
    });
    
    Route::middleware(['permission:edit help requests'])->group(function () {
        Route::put('help-requests/{id}', [HelpRequestController::class, 'update']);
        Route::post('help-requests/{id}/claim', [HelpRequestController::class, 'claim']);
        Route::post('help-requests/{id}/assign/{userId}', [HelpRequestController::class, 'assign']);
        Route::post('help-requests/{id}/complete', [HelpRequestController::class, 'complete']);
        Route::post('help-requests/{id}/unclaim', [HelpRequestController::class, 'unclaim']);
    });
    
    Route::middleware(['permission:delete help requests'])->group(function () {
        Route::delete('help-requests/{id}', [HelpRequestController::class, 'destroy']);
    });
    
    // ==================== TICKETS ====================
    Route::middleware(['permission:view tickets'])->group(function () {
        Route::get('tickets/available', [TicketController::class, 'available']);
        Route::get('tickets', [TicketController::class, 'index']);
        Route::get('tickets/{id}', [TicketController::class, 'show']);
        Route::get('tickets/status/{status}', [TicketController::class, 'getByStatus']);
        Route::get('tickets/type/{type}', [TicketController::class, 'getByType']);
        Route::get('users/{userId}/tickets/requested', [TicketController::class, 'getByRequester']);
        Route::get('users/{userId}/tickets/assigned', [TicketController::class, 'getByAssignee']);
    });
    
    Route::middleware(['permission:edit tickets'])->group(function () {
        Route::put('tickets/{id}', [TicketController::class, 'update']);
        Route::post('tickets/{id}/claim', [TicketController::class, 'claim']);
        Route::post('tickets/{id}/assign/{userId}', [TicketController::class, 'assign']);
        Route::post('tickets/{id}/complete', [TicketController::class, 'complete']);
        Route::post('tickets/{id}/unassign', [TicketController::class, 'unassign']);
        Route::post('tickets/{id}/status', [TicketController::class, 'updateStatus']);
    });
    
    Route::middleware(['permission:delete tickets'])->group(function () {
        Route::delete('tickets/{id}', [TicketController::class, 'destroy']);
    });
    
    // ==================== RATING CONFIGS ====================
    Route::middleware(['permission:view rating configs'])->group(function () {
        Route::get('rating-configs', [RatingConfigController::class, 'index']);
        Route::get('rating-configs/{id}', [RatingConfigController::class, 'show']);
        Route::get('rating-configs/type/{type}', [RatingConfigController::class, 'getByType']);
        Route::get('rating-configs/type/{type}/active', [RatingConfigController::class, 'getActiveByType']);
    });
    
    Route::middleware(['permission:create rating configs'])->group(function () {
        Route::post('rating-configs', [RatingConfigController::class, 'store']);
    });
    
    Route::middleware(['permission:edit rating configs'])->group(function () {
        Route::put('rating-configs/{id}', [RatingConfigController::class, 'update']);
        Route::post('rating-configs/{id}/activate', [RatingConfigController::class, 'activate']);
    });
    
    Route::middleware(['permission:delete rating configs'])->group(function () {
        Route::delete('rating-configs/{id}', [RatingConfigController::class, 'destroy']);
    });
    
    // ==================== TASK RATINGS ====================
    Route::middleware(['permission:create task ratings'])->group(function () {
        Route::post('task-ratings', [TaskRatingController::class, 'store']);
    });
    
    Route::middleware(['permission:edit task ratings'])->group(function () {
        Route::put('task-ratings/{id}', [TaskRatingController::class, 'update']);
    });
    
    // ==================== STAKEHOLDER RATINGS ====================
    Route::middleware(['permission:create stakeholder ratings'])->group(function () {
        Route::post('stakeholder-ratings', [StakeholderRatingController::class, 'store']);
    });
    
    Route::middleware(['permission:edit stakeholder ratings'])->group(function () {
        Route::put('stakeholder-ratings/{id}', [StakeholderRatingController::class, 'update']);
    });
    
    // ==================== FINAL RATINGS ====================
    Route::middleware(['permission:view final ratings'])->group(function () {
        Route::get('final-ratings', [FinalRatingController::class, 'index']);
        Route::get('users/{userId}/final-rating/{periodStart}/{periodEnd}', [FinalRatingController::class, 'getUserRating']);
    });
    
    Route::middleware(['permission:calculate final ratings'])->group(function () {
        Route::post('users/{userId}/calculate-final-rating', [FinalRatingController::class, 'calculateForUser']);
    });
    
    // ==================== ANALYTICS ====================
    Route::prefix('analytics')->middleware(['permission:view analytics'])->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('/report', [AnalyticsController::class, 'report']);
        Route::get('/export', [AnalyticsController::class, 'exportReport']);
        Route::get('/users/{userId}', [AnalyticsController::class, 'userAnalytics']);
        Route::get('/top-performers', [AnalyticsController::class, 'topPerformers']);
        Route::get('/projects/{projectId}', [AnalyticsController::class, 'projectAnalytics']);
        Route::get('/system', [AnalyticsController::class, 'systemStats']);
    });
    
    // ==================== KANBAN ====================
    Route::middleware(['permission:view projects'])->group(function () {
        Route::get('projects/{project}/kanban', [KanbanController::class, 'getProjectKanban']);
    });
    
    Route::middleware(['permission:edit tasks'])->group(function () {
        Route::post('tasks/{task}/move-section', [KanbanController::class, 'moveTaskToSection']);
        Route::post('tasks/{task}/move-status', [KanbanController::class, 'moveTaskStatus']);
    });
});
