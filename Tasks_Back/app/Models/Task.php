<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'weight',
        'due_date',
        'priority',
        'status',
        'section_id',
    ];

    protected $casts = [
        'due_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['project_id'];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Subtask::class);
    }

    // Auto-update status based on subtasks
    public function updateTaskStatus(): void
    {
        $subtasks = $this->subtasks;
        
        if ($subtasks->isEmpty()) {
            // No subtasks, status remains as set manually
            return;
        }
         if ($this->status === 'rated') {
        return;
    }

        $completedSubtasks = $subtasks->where('is_complete', true);
        
        if ($completedSubtasks->isEmpty()) {
            // No completed subtasks, keep pending or rated status
            if ($this->status !== 'rated') {
                $this->update(['status' => 'pending']);
            }
        } elseif ($completedSubtasks->count() < $subtasks->count()) {
            // Some subtasks completed, task is in progress
            $this->update(['status' => 'in_progress']);
        } else {
            // All subtasks completed, task is done
            $this->update(['status' => 'done']);
        }
    }

    // Boot method to handle subtask changes
    protected static function boot()
    {
        parent::boot();
        
        static::saved(function ($task) {
            // Update project status and progress when task is saved
            $task->section->project->updateProjectStatusAndProgress();
        });
        
        static::deleted(function ($task) {
            // Update project status and progress when task is deleted
            $task->section->project->updateProjectStatusAndProgress();
        });
    }

    public function assignedUsers(): BelongsToMany
{
    return $this->belongsToMany(User::class)
                ->withPivot('percentage')
                ->withTimestamps();
}

// Add method to get total assigned percentage
public function getTotalAssignedPercentage(): float
{
    return $this->assignedUsers()->sum('percentage');
}

// Add method to check if task is fully assigned
public function isFullyAssigned(): bool
{
    return $this->getTotalAssignedPercentage() >= 100.00;
}
public function helpRequests(): HasMany
{
    return $this->hasMany(HelpRequest::class);
}

// Get active help requests for this task
public function activeHelpRequests(): HasMany
{
    return $this->helpRequests()->where('is_completed', false);
}


 protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            $user = Auth::user();
            if (!$user) return;
            if ($user->hasRole('admin', 'sanctum')) return;

            $uid = $user->id;

            // Task is visible if assigned to the user OR user is stakeholder of the task's project
            $q->where(function ($q) use ($uid) {
                // assigned
                $q->whereExists(function ($sub) use ($uid) {
                    $sub->select(DB::raw(1))
                        ->from('task_user')
                        ->whereColumn('task_user.task_id', 'tasks.id')
                        ->where('task_user.user_id', $uid);
                })
                // stakeholder
                ->orWhereExists(function ($sub) use ($uid) {
                    $sub->select(DB::raw(1))
                        ->from('sections')
                        ->join('projects', 'projects.id', '=', 'sections.project_id')
                        ->whereColumn('sections.id', 'tasks.section_id')
                        ->where('projects.stakeholder_id', $uid);
                });
            });
        });
    }

public function getProjectIdAttribute(): ?int
{
    return $this->section?->project_id;
}
}
