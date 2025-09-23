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
            $user = Auth::user();

            if ($user && (!isset($user->role) || $user->role !== 'admin')) {
                // Scope based on the project this section belongs to
                // User can see sections if they can see the project itself
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
