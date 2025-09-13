<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subtask extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'due_date',
        'priority',
        'is_complete',
        'task_id',
    ];

    protected $casts = [
        'due_date' => 'date',
        'is_complete' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    // Boot method to handle task status updates
    protected static function boot()
    {
        parent::boot();
        
        static::saved(function ($subtask) {
            // Update parent task status
            $subtask->task->updateTaskStatus();
        });
        
        static::deleted(function ($subtask) {
            // Update parent task status
            $subtask->task->updateTaskStatus();
        });
    }
}
