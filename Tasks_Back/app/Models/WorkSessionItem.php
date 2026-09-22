<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A planned item inside a WorkSession. Free text with an optional link to an
 * existing project Task. Outcome is set during the end-of-day review.
 */
class WorkSessionItem extends Model
{
    use HasFactory;

    public const OUTCOME_PENDING = 'pending';

    public const OUTCOME_DONE = 'done';

    public const OUTCOME_PARTIAL = 'partial';

    public const OUTCOME_NOT_DONE = 'not_done';

    public const OUTCOMES = [
        self::OUTCOME_PENDING,
        self::OUTCOME_DONE,
        self::OUTCOME_PARTIAL,
        self::OUTCOME_NOT_DONE,
    ];

    /** Outcomes a user may choose when confirming a session. */
    public const FINAL_OUTCOMES = [
        self::OUTCOME_DONE,
        self::OUTCOME_PARTIAL,
        self::OUTCOME_NOT_DONE,
    ];

    public const PRIORITIES = ['low', 'medium', 'high', 'critical'];

    protected $fillable = [
        'work_session_id',
        'task_id',
        'title',
        'description',
        'priority',
        'estimated_minutes',
        'sort_order',
        'outcome',
        'outcome_note',
        'completed_at',
        'carried_from_item_id',
    ];

    protected $casts = [
        'estimated_minutes' => 'integer',
        'sort_order' => 'integer',
        'completed_at' => 'datetime',
    ];

    // ─── Relations ────────────────────────────────────────────────────

    public function session(): BelongsTo
    {
        return $this->belongsTo(WorkSession::class, 'work_session_id');
    }

    /**
     * NOTE: Task carries a "user_scope" global scope. Admin-side eager loads
     * must use ->with(['task' => fn ($q) => $q->withoutGlobalScopes()]).
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function carriedFrom(): BelongsTo
    {
        return $this->belongsTo(WorkSessionItem::class, 'carried_from_item_id');
    }
}
