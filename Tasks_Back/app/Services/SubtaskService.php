<?php

namespace App\Services;

use App\Models\Subtask;
use Illuminate\Pagination\LengthAwarePaginator;

class SubtaskService
{
    public function getAllSubtasks(int $perPage = 15): LengthAwarePaginator
    {
        return Subtask::with('task')->latest()->paginate($perPage);
    }

    public function getSubtaskById(int $id)
    {
        return Subtask::with('task')->find($id);
    }

    public function createSubtask(array $data): Subtask
    {
        return Subtask::create($data)->load('task');
    }

    public function updateSubtask(int $id, array $data): ?Subtask
    {
        $subtask = Subtask::find($id);
        
        if (!$subtask) {
            return null;
        }

        $subtask->update($data);
        return $subtask->fresh(['task']);
    }

    public function deleteSubtask(int $id): bool
    {
        $subtask = Subtask::find($id);
        
        if (!$subtask) {
            return false;
        }

        return $subtask->delete();
    }

    // Get subtasks by task
    public function getSubtasksByTask(int $taskId, int $perPage = 15): LengthAwarePaginator
    {
        return Subtask::with('task')
            ->where('task_id', $taskId)
            ->latest()
            ->paginate($perPage);
    }

    // Toggle subtask completion
    public function toggleSubtaskCompletion(int $id): ?Subtask
    {
        $subtask = Subtask::find($id);
        
        if (!$subtask) {
            return null;
        }

        $subtask->update(['is_complete' => !$subtask->is_complete]);
        return $subtask->fresh(['task']);
    }
}
