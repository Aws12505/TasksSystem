<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;

class TaskAssignmentService
{
    // Assign users to task with percentages
    public function assignUsersToTask(int $taskId, array $assignments): ?Task
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return null;
        }

        // Validate total percentage doesn't exceed 100%
        $totalPercentage = array_sum(array_column($assignments, 'percentage'));
        if ($totalPercentage > 100.00) {
            throw new \InvalidArgumentException('Total assignment percentage cannot exceed 100%');
        }

        // Format assignments for sync
        $syncData = [];
        foreach ($assignments as $assignment) {
            $syncData[$assignment['user_id']] = [
                'percentage' => $assignment['percentage']
            ];
        }

        $task->assignedUsers()->sync($syncData);
        return $task->fresh(['assignedUsers', 'section']);
    }

    // Add single user assignment to task
    public function addUserToTask(int $taskId, int $userId, float $percentage): ?Task
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return null;
        }

        // Check if adding this percentage would exceed 100%
        $currentTotal = $task->getTotalAssignedPercentage();
        if (($currentTotal + $percentage) > 100.00) {
            throw new \InvalidArgumentException('Adding this assignment would exceed 100% total');
        }

        $task->assignedUsers()->attach($userId, ['percentage' => $percentage]);
        return $task->fresh(['assignedUsers', 'section']);
    }

    // Update user assignment percentage
    public function updateUserAssignment(int $taskId, int $userId, float $percentage): ?Task
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return null;
        }

        // Check if updating this percentage would exceed 100%
        $currentTotal = $task->getTotalAssignedPercentage();
        $currentUserPercentage = $task->assignedUsers()->wherePivot('user_id', $userId)->first()?->pivot?->percentage ?? 0;
        $newTotal = ($currentTotal - $currentUserPercentage) + $percentage;
        
        if ($newTotal > 100.00) {
            throw new \InvalidArgumentException('Updating this assignment would exceed 100% total');
        }

        $task->assignedUsers()->updateExistingPivot($userId, ['percentage' => $percentage]);
        return $task->fresh(['assignedUsers', 'section']);
    }

    // Remove user from task
    public function removeUserFromTask(int $taskId, int $userId): ?Task
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return null;
        }

        $task->assignedUsers()->detach($userId);
        return $task->fresh(['assignedUsers', 'section']);
    }

    // Get task assignments
    public function getTaskAssignments(int $taskId)
    {
        return Task::with(['assignedUsers', 'section'])->find($taskId);
    }

    // Get user's task assignments
    public function getUserTaskAssignments(int $userId): Collection
    {
        $user = User::find($userId);
        
        if (!$user) {
            return collect();
        }

        return $user->assignedTasks()->with(['section.project'])->get();
    }

    // Get project assignments (users assigned to project tasks)
    public function getProjectAssignments(int $projectId): ?array
    {
        $project = Project::find($projectId);
        
        if (!$project) {
            return null;
        }

        $users = $project->getUsersWithTaskAssignments();
        
        return [
            'project' => $project,
            'assigned_users' => $users,
            'total_assigned_users' => $users->count(),
        ];
    }

    // Get tasks for section with assignments
    public function getSectionTasksWithAssignments(int $sectionId): Collection
    {
        return Task::where('section_id', $sectionId)
                   ->with(['assignedUsers', 'section'])
                   ->get();
    }
}
