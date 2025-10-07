<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
class Subtask extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'due_date',
        'priority',
        'is_complete',
        'task_id',
    ];

    protected $casts = [
        'due_date' => 'date',
        'is_complete' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    // Boot method to handle task status updates
    protected static function boot()
    {
        parent::boot();
        
        static::saved(function ($subtask) {
            
            // Update parent task status
            $subtask->task->updateTaskStatus();
        });
        
        static::deleted(function ($subtask) {
            // Update parent task status
            $subtask->task->updateTaskStatus();
        });
    }

 protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            $user = Auth::user();
            if (!$user) return;
            if ($user->hasRole('admin', 'sanctum')) return;

            $uid = $user->id;

            // Subtask is visible if its parent task is assigned to the user
            // OR if the user is stakeholder of the parent task's project
            $q->whereExists(function ($sub) use ($uid) {
                $sub->select(DB::raw(1))
                    ->from('tasks')
                    ->whereColumn('tasks.id', 'subtasks.task_id')
                    ->where(function ($inner) use ($uid) {
                        $inner->whereExists(function ($x) use ($uid) {
                            $x->select(DB::raw(1))
                              ->from('task_user')
                              ->whereColumn('task_user.task_id', 'tasks.id')
                              ->where('task_user.user_id', $uid);
                        })
                        ->orWhereExists(function ($x) use ($uid) {
                            $x->select(DB::raw(1))
                              ->from('sections')
                              ->join('projects', 'projects.id', '=', 'sections.project_id')
                              ->whereColumn('sections.id', 'tasks.section_id')
                              ->where('projects.stakeholder_id', $uid);
                        });
                    });
            });
        });
    }
}
