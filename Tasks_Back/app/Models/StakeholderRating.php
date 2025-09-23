<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
class StakeholderRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'stakeholder_id',
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

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function stakeholder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'stakeholder_id');
    }

    protected static function booted()
    {
        static::addGlobalScope('user_scope', function (Builder $builder) {
            $user = Auth::user();

            if ($user && (!isset($user->role) || $user->role !== 'admin')) {
                // Scope based on the project this rating is for
                // User can see stakeholder ratings if they can see the project itself
                $builder->whereHas('project', function ($projectQuery) use ($user) {
                    $projectQuery->where(function ($query) use ($user) {
                        $query->where('stakeholder_id', $user->id)
                              ->orWhereHas('sections.tasks.assignedUsers', function ($taskQuery) use ($user) {
                                  $taskQuery->where('users.id', $user->id);
                              });
                    });
                });
            }
        });
    }
}
