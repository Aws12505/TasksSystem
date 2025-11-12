<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Subtask;
use App\Models\TaskRating;
use Illuminate\Support\Facades\DB;
class TaskService
{
    public function getAllTasks(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $q = Task::query()
            ->with([
                'section.project',
                'subtasks',
                // 👇 hydrate assignees once (pivot includes percentage)
                'assignedUsers',
            ])
            ->addSelect([
                'latest_final_rating' => TaskRating::select('final_rating')
                    ->whereColumn('task_ratings.task_id', 'tasks.id')
                    ->latest()
                    ->limit(1),
            ])
            ->latest();

        // ---- Filters ----
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $q->where('status', $filters['status']);
        }

        if (!empty($filters['project_id']) && $filters['project_id'] !== 'all') {
            $projectId = (int) $filters['project_id'];
            $q->whereHas('section', function ($sq) use ($projectId) {
                $sq->where('project_id', $projectId);
            });
        }

        // assignees: ALL selected assignees
        if (!empty($filters['assignees']) && is_array($filters['assignees'])) {
            foreach ($filters['assignees'] as $uid) {
                $uid = (int) $uid;
                $q->whereHas('assignedUsers', function ($sq) use ($uid) {
                    $sq->where('users.id', $uid);
                });
            }
        }

        if (!empty($filters['due_from'])) {
            $q->whereDate('due_date', '>=', $filters['due_from']);
        }
        if (!empty($filters['due_to'])) {
            $q->whereDate('due_date', '<=', $filters['due_to']);
        }

        if (!empty($filters['search'])) {
            $term = trim(strtolower($filters['search']));
            $q->where(function ($sq) use ($term) {
                $sq->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(COALESCE(description, "")) LIKE ?', ["%{$term}%"])
                  ->orWhere(function ($x) use ($term) {
                      $x->whereHas('section.project', function ($pq) use ($term) {
                          $pq->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"]);
                      });
                  })
                  ->orWhere('id', is_numeric($term) ? (int) $term : null);
            });
        }

        if (!empty($filters['per_page']) && (int)$filters['per_page'] > 0) {
            $perPage = (int) $filters['per_page'];
        }

        return $q->paginate($perPage);
    }
    
   public function getTaskById(int $id)
    {
        return Task::query()
            ->with(['section.project', 'subtasks', 'comments.user'])
            ->addSelect([
                'latest_final_rating' => TaskRating::select('final_rating')
                    ->whereColumn('task_ratings.task_id', 'tasks.id')
                    ->latest()
                    ->limit(1),
            ])
            ->find($id);
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
        return Task::query()
            ->with(['section.project', 'subtasks','assignedUsers'])
            ->addSelect([
                'latest_final_rating' => TaskRating::select('final_rating')
                    ->whereColumn('task_ratings.task_id', 'tasks.id')
                    ->latest()
                    ->limit(1),
            ])
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
        if($task->status != 'rated'){
        $task->update(['status' => $status]);
        }
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
