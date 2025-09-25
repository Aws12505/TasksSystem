<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'project_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
{
    return $this->hasMany(Task::class);
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

        $builder->whereHas('project', function ($pq) use ($user) {
            $pq->where('stakeholder_id', $user->id)
               ->orWhereRelation('sections.tasks.assignedUsers', 'users.id', $user->id);
        });
    });
}


}
