<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;

class KanbanService
{
    public function getProjectKanban(int $projectId): ?array
    {
        $project = Project::with([
            'sections.tasks' => function ($query) {
                $query->with(['assignedUsers', 'subtasks'])
                      ->orderBy('priority')
                      ->orderBy('due_date');
            }
        ])->find($projectId);

        if (!$project) {
            return null;
        }

        // Group tasks by status for each section
        $kanbanData = [
            'project' => $project,
            'sections' => [],
        ];

        foreach ($project->sections as $section) {
            $tasksByStatus = [
                'pending' => [],
                'in_progress' => [],
                'done' => [],
                'rated' => [],
            ];

            foreach ($section->tasks as $task) {
                $tasksByStatus[$task->status][] = $task;
            }

            $kanbanData['sections'][] = [
                'section' => $section,
                'tasks_by_status' => $tasksByStatus,
            ];
        }

        return $kanbanData;
    }

    public function moveTaskToSection(int $taskId, int $sectionId): ?Task
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return null;
        }

        $task->update(['section_id' => $sectionId]);
        return $task->fresh(['section', 'assignedUsers', 'subtasks']);
    }

    public function moveTaskStatus(int $taskId, string $status): ?Task
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return null;
        }

        $task->update(['status' => $status]);
        return $task->fresh(['section', 'assignedUsers', 'subtasks']);
    }

    public function getSortedTasksForSection(int $sectionId): array
    {
        $tasks = Task::where('section_id', $sectionId)
                    ->with(['assignedUsers', 'subtasks'])
                    ->orderByRaw("FIELD(priority, 'critical', 'high', 'medium', 'low')")
                    ->orderBy('due_date')
                    ->get()
                    ->groupBy('status');

        $tasksByStatus = [
            'pending' => $tasks->get('pending', collect())->values()->all(),
            'in_progress' => $tasks->get('in_progress', collect())->values()->all(),
            'done' => $tasks->get('done', collect())->values()->all(),
            'rated' => $tasks->get('rated', collect())->values()->all(),
        ];

        return $tasksByStatus;
    }
}
