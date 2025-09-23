<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
class TaskRating extends Model
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

    protected static function booted()
    {
        static::addGlobalScope('user_scope', function (Builder $builder) {
            $user = Auth::user();

            if ($user && (!isset($user->role) || $user->role !== 'admin')) {
                // Scope based on the task this rating is for
                // User can see task ratings if they can see the task itself
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
