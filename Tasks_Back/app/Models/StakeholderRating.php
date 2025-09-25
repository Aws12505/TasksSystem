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
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (!$user) return;

        if ($user->hasRole('admin', 'sanctum')) {
            return;
        }

        // mirror project visibility
        $builder->whereHas('project', function ($pq) use ($user) {
            $pq->where('stakeholder_id', $user->id)
               ->orWhereRelation('sections.tasks.assignedUsers', 'users.id', $user->id);
        });
    });
}


}
