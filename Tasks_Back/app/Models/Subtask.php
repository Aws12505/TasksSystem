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
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (!$user) return;

        if ($user->hasRole('admin', 'sanctum')) {
            return;
        }

        $builder->whereHas('task', function ($tq) use ($user) {
            $tq->whereRelation('assignedUsers', 'users.id', $user->id)
               ->orWhereRelation('section.project', 'stakeholder_id', $user->id);
        });
    });
}


}
