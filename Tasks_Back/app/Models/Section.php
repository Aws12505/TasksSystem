<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            $user = Auth::user();
            if (!$user) return;
            if ($user->hasRole('admin', 'sanctum')) return;

            $uid = $user->id;

            // Section is visible if user is the project stakeholder
            // OR has any task in this section/project assigned to them
            $q->where(function ($q) use ($uid) {
                $q->whereExists(function ($sub) use ($uid) {
                    $sub->select(DB::raw(1))
                        ->from('projects')
                        ->whereColumn('projects.id', 'sections.project_id')
                        ->where('projects.stakeholder_id', $uid);
                })
                ->orWhereExists(function ($sub) use ($uid) {
                    $sub->select(DB::raw(1))
                        ->from('tasks')
                        ->join('task_user', 'task_user.task_id', '=', 'tasks.id')
                        ->whereColumn('tasks.section_id', 'sections.id')
                        ->where('task_user.user_id', $uid);
                });
            });
        });
    }


}
