<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
class Subtask extends Model
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

    protected static function booted()
    {
        static::addGlobalScope('user_scope', function (Builder $builder) {
            $user = Auth::user();

            if ($user && (!isset($user->role) || $user->role !== 'admin')) {
                $builder->whereHas('task', function ($taskQuery) use ($user) {
                    $taskQuery->where(function ($query) use ($user) {
                        $query->whereHas('assignedUsers', function ($assignedQuery) use ($user) {
                            $assignedQuery->where('users.id', $user->id);
                        })
                        ->orWhereHas('section.project', function ($projectQuery) use ($user) {
                            $projectQuery->where('stakeholder_id', $user->id);
                        });
                    });
                });
            }
        });
    }
}
