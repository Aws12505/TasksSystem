<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Services\TaskService;
use App\Services\TaskAssignmentService;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\AddUserToTaskRequest;
use App\Http\Requests\UpdateUserAssignmentRequest;
use App\Http\Requests\AssignUsersToTaskRequest;
class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService,
        private TaskAssignmentService $taskAssignmentService
    ) {}

    public function index(): JsonResponse
    {
        $tasks = $this->taskService->getAllTasks();

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'total' => $tasks->total(),
                'per_page' => $tasks->perPage(),
                'last_page' => $tasks->lastPage(),
                'from' => $tasks->firstItem(),
                'to' => $tasks->lastItem(),
            ],
            'message' => 'Tasks retrieved successfully',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $task = $this->taskService->getTaskById($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task retrieved successfully',
        ]);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task created successfully',
        ], 201);
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->updateTask($id, $request->validated());

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->taskService->deleteTask($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Task deleted successfully',
        ]);
    }

    public function getBySection(int $sectionId): JsonResponse
    {
        $tasks = $this->taskService->getTasksBySection($sectionId);

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'total' => $tasks->total(),
                'per_page' => $tasks->perPage(),
                'last_page' => $tasks->lastPage(),
                'from' => $tasks->firstItem(),
                'to' => $tasks->lastItem(),
            ],
            'message' => 'Section tasks retrieved successfully',
        ]);
    }

    public function updateStatus(UpdateTaskStatusRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->updateTaskStatus($id, $request->validated()['status']);

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task status updated successfully',
        ]);
    }
    public function showWithAssignments(int $id): JsonResponse
{
    $task = $this->taskAssignmentService->getTaskAssignments($id);

    if (!$task) {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => 'Task not found',
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => $task,
        'message' => 'Task with assignments retrieved successfully',
    ]);
}

// Assign multiple users to task
public function assignUsers(AssignUsersToTaskRequest $request, int $id): JsonResponse
{
    try {
        $task = $this->taskAssignmentService->assignUsersToTask($id, $request->validated()['assignments']);

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Users assigned to task successfully',
        ]);
    } catch (\InvalidArgumentException $e) {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $e->getMessage(),
        ], 422);
    }
}

// Add single user to task
public function addUser(AddUserToTaskRequest $request, int $id): JsonResponse
{
    try {
        $data = $request->validated();
        $task = $this->taskAssignmentService->addUserToTask($id, $data['user_id'], $data['percentage']);

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'User added to task successfully',
        ]);
    } catch (\InvalidArgumentException $e) {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $e->getMessage(),
        ], 422);
    }
}

// Update user assignment
public function updateUserAssignment(UpdateUserAssignmentRequest $request, int $id, int $userId): JsonResponse
{
    try {
        $task = $this->taskAssignmentService->updateUserAssignment($id, $userId, $request->validated()['percentage']);

        if (!$task) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'User assignment updated successfully',
        ]);
    } catch (\InvalidArgumentException $e) {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $e->getMessage(),
        ], 422);
    }
}

// Remove user from task
public function removeUser(int $id, int $userId): JsonResponse
{
    $task = $this->taskAssignmentService->removeUserFromTask($id, $userId);

    if (!$task) {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => 'Task not found',
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => $task,
        'message' => 'User removed from task successfully',
    ]);
}
}
