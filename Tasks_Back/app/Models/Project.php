<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;
class Project extends Model
{
      use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'stakeholder_will_rate',
        'stakeholder_id',
        'status',
        'progress_percentage',
    ];

    protected $casts = [
        'stakeholder_will_rate' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function updateProjectStatusAndProgress(): void
{
    $tasks = $this->sections()->with('tasks')->get()->flatMap->tasks;
    
    if ($tasks->isEmpty()) {
        $this->update([
            'status' => 'pending',
            'progress_percentage' => 0.00
        ]);
        return;
    }

    // Calculate status
    $taskStatuses = $tasks->pluck('status');
    $pendingCount = $taskStatuses->where('status', 'pending')->count();
    $inProgressCount = $taskStatuses->where('status', 'in_progress')->count();
    $doneCount = $taskStatuses->where('status', 'done')->count();
    $ratedCount = $taskStatuses->where('status', 'rated')->count();
    $totalTasks = $tasks->count();

    if ($ratedCount === $totalTasks) {
        $status = 'rated';
    } elseif ($doneCount + $ratedCount === $totalTasks) {
        $status = 'done';
    } elseif ($inProgressCount > 0 || $doneCount > 0 || $ratedCount > 0) {
        $status = 'in_progress';
    } else {
        $status = 'pending';
    }

    // Calculate progress percentage based on task weights
    $totalWeight = $tasks->sum('weight');
    $completedWeight = $tasks->whereIn('status', ['done', 'rated'])->sum('weight');
    $inProgressWeight = $tasks->where('status', 'in_progress')->sum('weight') * 0.5; // 50% for in progress
    
    $progressPercentage = $totalWeight > 0 
        ? (($completedWeight + $inProgressWeight) / $totalWeight) * 100 
        : 0;

    $this->update([
        'status' => $status,
        'progress_percentage' => round($progressPercentage, 2)
    ]);
}

// Update the sections relationship to include tasks for calculations
public function sections(): HasMany
{
    return $this->hasMany(Section::class);
}

// Add method to get all project tasks
public function getAllTasks()
{
    return Task::whereHas('section', function ($query) {
        $query->where('project_id', $this->id);
    });
}

    public function stakeholder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'stakeholder_id');
    }
public function assignedUsers(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'task_user')
                ->join('tasks', 'task_user.task_id', '=', 'tasks.id')
                ->join('sections', 'tasks.section_id', '=', 'sections.id')
                ->where('sections.project_id', $this->id)
                ->withPivot('percentage')
                ->withTimestamps()
                ->distinct();
}

// Get users with their task assignments for this project
public function getUsersWithTaskAssignments()
{
    $users = User::whereHas('assignedTasks', function (Builder $query) {
        $query->whereHas('section', function (Builder $sectionQuery) {
            $sectionQuery->where('project_id', $this->id);
        });
    })->with(['assignedTasks' => function (BelongsToMany $taskQuery) {
        $taskQuery->whereHas('section', function (Builder $sectionQuery) {
            $sectionQuery->where('project_id', $this->id);
        })->withPivot('percentage');
    }])->get();

    return $users;
}

protected static function booted()
    {
        static::addGlobalScope('user_scope', function (Builder $builder) {
            $user = Auth::user();

            if ($user && (!isset($user->role) || $user->role !== 'admin')) {
                $builder->where(function ($query) use ($user) {
                    $query->where('stakeholder_id', $user->id)
                          ->orWhereHas('sections.tasks.assignedUsers', function ($taskQuery) use ($user) {
                              $taskQuery->where('users.id', $user->id);
                          });
                });
            }
        });
    }

}
