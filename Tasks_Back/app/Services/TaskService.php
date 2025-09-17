<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Subtask;
use Illuminate\Support\Facades\DB;
class TaskService
{
    public function getAllTasks(int $perPage = 15): LengthAwarePaginator
    {
        return Task::with(['section', 'subtasks'])->latest()->paginate($perPage);
    }

    public function getTaskById(int $id)
    {
        return Task::with(['section', 'subtasks'])->find($id);
    }

    public function createTask(array $data): Task
    {
        return Task::create($data)->load(['section', 'subtasks']);
    }

    public function updateTask(int $id, array $data): ?Task
    {
        $task = Task::find($id);
        
        if (!$task) {
            return null;
        }

        $task->update($data);
        
        // If status is manually changed, update it
        if (isset($data['status'])) {
            $task->updateTaskStatus();
        }
        
        return $task->fresh(['section', 'subtasks']);
    }

    public function deleteTask(int $id): bool
    {
        $task = Task::find($id);
        
        if (!$task) {
            return false;
        }

        return $task->delete();
    }

    // Get tasks by section
    public function getTasksBySection(int $sectionId, int $perPage = 15): LengthAwarePaginator
    {
        return Task::with(['section', 'subtasks'])
            ->where('section_id', $sectionId)
            ->latest()
            ->paginate($perPage);
    }

    // Update task status manually
    public function updateTaskStatus(int $id, string $status): ?Task
    {
        $task = Task::find($id);
        
        if (!$task) {
            return null;
        }

        $task->update(['status' => $status]);
        return $task->fresh(['section', 'subtasks']);
    }

    /**
 * Create task with subtasks and assignments comprehensively
 */
public function createTaskComprehensive(array $data): Task
{
    return DB::transaction(function () use ($data) {
        $subtasksData = $data['subtasks'] ?? [];
        $assignmentsData = $data['assignments'] ?? [];
        
        $taskData = array_diff_key($data, ['subtasks' => '', 'assignments' => '']);
        
        $task = Task::create($taskData);
        
        if (!empty($subtasksData)) {
            foreach ($subtasksData as $subtaskData) {
                $subtaskData['task_id'] = $task->id;
                Subtask::create($subtaskData);
            }
        }
        
        if (!empty($assignmentsData)) {
            $syncData = [];
            foreach ($assignmentsData as $assignment) {
                $syncData[$assignment['user_id']] = ['percentage' => $assignment['percentage']];
            }
            $task->assignedUsers()->sync($syncData);
        }
        
        return $task->fresh(['section', 'subtasks', 'assignedUsers']);
    });
}

}
