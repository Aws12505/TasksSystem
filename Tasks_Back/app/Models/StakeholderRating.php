<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

    protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            $user = Auth::user();
            if (!$user) return;
            if ($user->hasRole('admin', 'sanctum')) return;

            $uid = $user->id;

            // Mirror project visibility
            $q->where(function ($q) use ($uid) {
                $q->whereExists(function ($sub) use ($uid) {
                    $sub->select(DB::raw(1))
                        ->from('projects')
                        ->whereColumn('projects.id', 'stakeholder_ratings.project_id')
                        ->where('projects.stakeholder_id', $uid);
                })
                ->orWhereExists(function ($sub) use ($uid) {
                    $sub->select(DB::raw(1))
                        ->from('sections')
                        ->join('tasks', 'tasks.section_id', '=', 'sections.id')
                        ->join('task_user', 'task_user.task_id', '=', 'tasks.id')
                        ->whereColumn('sections.project_id', 'stakeholder_ratings.project_id')
                        ->where('task_user.user_id', $uid);
                });
            });
        });
    }


}
