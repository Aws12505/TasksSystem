<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
class TaskRating extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'rater_id',
        'rating_data',
        'final_rating',
        'config_snapshot',
        'rated_at',
    ];

    protected $casts = [
        'rating_data' => 'array',
        'final_rating' => 'decimal:2',
        'config_snapshot' => 'array',
        'rated_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function rater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rater_id');
    }
    protected static function boot()
{
    parent::boot();

    static::saved(function (TaskRating $taskRating) {
        if (!$taskRating->task_id) {
            return;
        }

        // Skip global scopes in case visibility would block the update
        \App\Models\Task::withoutGlobalScopes()
            ->whereKey($taskRating->task_id)
            ->update(['status' => 'rated']);
    });
}

protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            $user = Auth::user();
            if (!$user) return;
            if ($user->hasRole('admin', 'sanctum')) return;

            $uid = $user->id;

            // Visible if underlying task is visible by the same rules
            $q->whereExists(function ($sub) use ($uid) {
                $sub->select(DB::raw(1))
                    ->from('tasks')
                    ->whereColumn('tasks.id', 'task_ratings.task_id')
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
