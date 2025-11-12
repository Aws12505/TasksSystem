<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class TaskComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Comments inherit visibility from their parent task
     */
    protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            $user = Auth::user();
            
            if (!$user) {
                return;
            }

            if ($user->hasRole('admin', 'sanctum')) {
                return;
            }

            $uid = $user->id;

            // Comment is visible if its parent task is visible
            $q->whereExists(function ($sub) use ($uid) {
                $sub->selectRaw('1')
                    ->from('tasks')
                    ->whereColumn('tasks.id', '=', 'task_comments.task_id')
                    ->where(function ($inner) use ($uid) {
                        $inner->whereExists(function ($x) use ($uid) {
                            $x->selectRaw('1')
                                ->from('task_user')
                                ->whereColumn('task_user.task_id', '=', 'tasks.id')
                                ->where('task_user.user_id', '=', $uid);
                        })
                        ->orWhereExists(function ($x) use ($uid) {
                            $x->selectRaw('1')
                                ->from('sections')
                                ->join('projects', 'projects.id', '=', 'sections.project_id')
                                ->whereColumn('sections.id', '=', 'tasks.section_id')
                                ->where('projects.stakeholder_id', '=', $uid);
                        });
                    });
            });
        });
    }
}
