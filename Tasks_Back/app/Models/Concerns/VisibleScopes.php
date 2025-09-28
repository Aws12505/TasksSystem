<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait VisibleScopes
{
    /** Tasks visible to a (non-admin) user */
    public function scopeTasksVisibleTo(Builder $q, int $userId): Builder
    {
        return $q->where(function ($q) use ($userId) {
            // Assigned to the user
            $q->whereExists(function ($sub) use ($userId) {
                $sub->select(DB::raw(1))
                    ->from('task_user')
                    ->whereColumn('task_user.task_id', 'tasks.id')
                    ->where('task_user.user_id', $userId);
            })
            // OR Stakeholder of the project the task belongs to
            ->orWhereExists(function ($sub) use ($userId) {
                $sub->select(DB::raw(1))
                    ->from('sections')
                    ->join('projects', 'projects.id', '=', 'sections.project_id')
                    ->whereColumn('sections.id', 'tasks.section_id')
                    ->where('projects.stakeholder_id', $userId);
            });
        });
    }

    /** Projects visible to a (non-admin) user */
    public function scopeProjectsVisibleTo(Builder $q, int $userId): Builder
    {
        return $q->where(function ($q) use ($userId) {
            // Stakeholder of the project
            $q->where('projects.stakeholder_id', $userId)
            // OR has at least one task assigned to the user
            ->orWhereExists(function ($sub) use ($userId) {
                $sub->select(DB::raw(1))
                    ->from('sections')
                    ->join('tasks', 'tasks.section_id', '=', 'sections.id')
                    ->join('task_user', 'task_user.task_id', '=', 'tasks.id')
                    ->whereColumn('sections.project_id', 'projects.id')
                    ->where('task_user.user_id', $userId);
            });
        });
    }

    /** Sections visible to a (non-admin) user (via their project visibility) */
    public function scopeSectionsVisibleTo(Builder $q, int $userId): Builder
    {
        return $q->whereExists(function ($sub) use ($userId) {
            $sub->select(DB::raw(1))
                ->from('projects')
                ->whereColumn('projects.id', 'sections.project_id')
                ->where(function ($inner) use ($userId) {
                    $inner->where('projects.stakeholder_id', $userId)
                        ->orWhereExists(function ($sub2) use ($userId) {
                            $sub2->select(DB::raw(1))
                                ->from('sections as s2')
                                ->join('tasks', 'tasks.section_id', '=', 's2.id')
                                ->join('task_user', 'task_user.task_id', '=', 'tasks.id')
                                ->whereColumn('s2.project_id', 'projects.id')
                                ->where('task_user.user_id', $userId);
                        });
                });
        });
    }

    /** Subtasks visible to a (non-admin) user (via parent task visibility) */
    public function scopeSubtasksVisibleTo(Builder $q, int $userId): Builder
    {
        return $q->whereExists(function ($sub) use ($userId) {
            $sub->select(DB::raw(1))
                ->from('tasks')
                ->whereColumn('tasks.id', 'subtasks.task_id')
                ->where(function ($inner) use ($userId) {
                    $inner->whereExists(function ($x) use ($userId) {
                        $x->select(DB::raw(1))
                          ->from('task_user')
                          ->whereColumn('task_user.task_id', 'tasks.id')
                          ->where('task_user.user_id', $userId);
                    })
                    ->orWhereExists(function ($x) use ($userId) {
                        $x->select(DB::raw(1))
                          ->from('sections')
                          ->join('projects', 'projects.id', '=', 'sections.project_id')
                          ->whereColumn('sections.id', 'tasks.section_id')
                          ->where('projects.stakeholder_id', $userId);
                    });
                });
        });
    }

    /** Task ratings visible to a (non-admin) user (via task visibility) */
    public function scopeTaskRatingsVisibleTo(Builder $q, int $userId): Builder
    {
        return $q->whereExists(function ($sub) use ($userId) {
            $sub->select(DB::raw(1))
                ->from('tasks')
                ->whereColumn('tasks.id', 'task_ratings.task_id')
                ->where(function ($inner) use ($userId) {
                    $inner->whereExists(function ($x) use ($userId) {
                        $x->select(DB::raw(1))
                          ->from('task_user')
                          ->whereColumn('task_user.task_id', 'tasks.id')
                          ->where('task_user.user_id', $userId);
                    })
                    ->orWhereExists(function ($x) use ($userId) {
                        $x->select(DB::raw(1))
                          ->from('sections')
                          ->join('projects', 'projects.id', '=', 'sections.project_id')
                          ->whereColumn('sections.id', 'tasks.section_id')
                          ->where('projects.stakeholder_id', $userId);
                    });
                });
        });
    }

    /** Stakeholder ratings mirror the project visibility */
    public function scopeStakeholderRatingsVisibleTo(Builder $q, int $userId): Builder
    {
        return $q->whereExists(function ($sub) use ($userId) {
            $sub->select(DB::raw(1))
                ->from('projects')
                ->whereColumn('projects.id', 'stakeholder_ratings.project_id')
                ->where(function ($inner) use ($userId) {
                    $inner->where('projects.stakeholder_id', $userId)
                        ->orWhereExists(function ($x) use ($userId) {
                            $x->select(DB::raw(1))
                              ->from('sections')
                              ->join('tasks', 'tasks.section_id', '=', 'sections.id')
                              ->join('task_user', 'task_user.task_id', '=', 'tasks.id')
                              ->whereColumn('sections.project_id', 'projects.id')
                              ->where('task_user.user_id', $userId);
                        });
                });
        });
    }
}
