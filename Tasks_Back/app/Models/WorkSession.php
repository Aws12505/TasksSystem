<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

/**
 * A user's daily work session: planned items at shift start, reviewed and
 * confirmed at shift end. One row per (user, work_date).
 *
 * Extends plain Model (not BaseModel) so timestamps keep their time-of-day.
 */
class WorkSession extends Model
{
    use HasFactory;

    public const STATUS_OPEN = 'open';

    public const STATUS_CONFIRMED = 'confirmed';

    protected $fillable = [
        'user_id',
        'work_date',
        'status',
        'started_at',
        'confirmed_at',
        'reopened_at',
        'reopened_by',
        'summary_note',
    ];

    protected $casts = [
        'work_date' => 'date:Y-m-d',
        'started_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'reopened_at' => 'datetime',
    ];

    /**
     * Permission-based visibility (mirrors ClockSession): users without
     * "view all work sessions" only ever see their own rows.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $query) {
            $user = Auth::user();

            if (! $user) {
                return;
            }

            if (! $user->can('view all work sessions')) {
                $query->where('work_sessions.user_id', $user->id);
            }
        });
    }

    // ─── Relations ────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reopenedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reopened_by');
    }

    /**
     * Same relation under a name that serializes as "reopened_by_user", so the
     * raw "reopened_by" FK integer is preserved in JSON when eager-loaded.
     */
    public function reopenedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reopened_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(WorkSessionItem::class)->orderBy('sort_order')->orderBy('id');
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    /** Bypass the visibility scope and target a specific user's sessions. */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->withoutGlobalScope('user_scope')->where('work_sessions.user_id', $userId);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('work_sessions.status', self::STATUS_OPEN);
    }

    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->where('work_sessions.status', self::STATUS_CONFIRMED);
    }

    public function scopeBetween(Builder $query, ?string $start, ?string $end): Builder
    {
        if ($start) {
            $query->where('work_sessions.work_date', '>=', $start);
        }
        if ($end) {
            $query->where('work_sessions.work_date', '<=', $end);
        }

        return $query;
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->where('work_sessions.work_date', self::companyToday());
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /** Credit given to a "partial" outcome when computing completion %. */
    public const PARTIAL_WEIGHT = 0.5;

    /**
     * Completion percentage = (done + PARTIAL_WEIGHT * partial) / total * 100,
     * rounded to 2 decimals. Pending items count in the total with no credit.
     * Returns null when there are no items.
     */
    public static function completionPct(int $done, int $partial, int $total): ?float
    {
        if ($total <= 0) {
            return null;
        }

        return round((($done + self::PARTIAL_WEIGHT * $partial) / $total) * 100, 2);
    }

    /** Today's calendar date in the company timezone. */
    public static function companyToday(): string
    {
        $timezone = config('app.company_timezone', 'UTC');

        return Carbon::now($timezone)->toDateString();
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function isConfirmed(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }
}
