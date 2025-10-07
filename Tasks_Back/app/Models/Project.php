<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
class Project extends BaseModel
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
            'progress_percentage' => 0.00,
        ]);
        return;
    }

    // $pendingCount    = $tasks->where('status', 'pending')->count();
    $inProgressCount = $tasks->where('status', 'in_progress')->count();
    $doneCount       = $tasks->where('status', 'done')->count();
    $ratedCount      = $tasks->where('status', 'rated')->count();
    $totalTasks      = $tasks->count();

    $status = match (true) {
        $ratedCount === $totalTasks                        => 'rated',
        ($doneCount + $ratedCount) === $totalTasks         => 'done',
        ($inProgressCount || $doneCount || $ratedCount)    => 'in_progress',
        default                                            => 'pending',
    };

    $totalWeight       = (float) $tasks->sum('weight');
    $completedWeight   = (float) $tasks->whereIn('status', ['done', 'rated'])->sum('weight');
    $inProgressWeight  = (float) $tasks->where('status', 'in_progress')->sum('weight') * 0.5;

    $progressPercentage = $totalWeight > 0
        ? (($completedWeight + $inProgressWeight) / $totalWeight) * 100
        : 0;

    $this->update([
        'status' => $status,
        'progress_percentage' => round($progressPercentage, 2),
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

protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            $user = Auth::user();
            if (!$user) return;
            if ($user->hasRole('admin', 'sanctum')) return;

            $uid = $user->id;

            $q->where(function ($q) use ($uid) {
                // Stakeholder of the project
                $q->where('projects.stakeholder_id', $uid)
                  // OR has any task assigned in this project
                  ->orWhereExists(function ($sub) use ($uid) {
                      $sub->select(DB::raw(1))
                          ->from('sections')
                          ->join('tasks', 'tasks.section_id', '=', 'sections.id')
                          ->join('task_user', 'task_user.task_id', '=', 'tasks.id')
                          ->whereColumn('sections.project_id', 'projects.id')
                          ->where('task_user.user_id', $uid);
                  });
            });
        });
    }


}
