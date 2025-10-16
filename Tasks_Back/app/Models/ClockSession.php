<?php
// app/Models/ClockSession.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ClockSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'clock_in_utc',
        'clock_out_utc',
        'session_date',
        'status',
        'crosses_midnight',
    ];

    protected $casts = [
        'clock_in_utc' => 'datetime',
        'clock_out_utc' => 'datetime',
        'session_date' => 'date',
        'crosses_midnight' => 'boolean',
    ];

    protected $with = ['breakRecords', 'user'];
    
    // NO calculated fields - frontend does all calculations
    protected $hidden = ['created_at', 'updated_at'];

    /**
     * Global scope for permission-based filtering
     */
    protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $query) {
            $user = Auth::user();
            
            if (!$user) {
                return;
            }

            if (!$user->can('view all clocking sessions')) {
                $query->where('user_id', $user->id);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function breakRecords(): HasMany
    {
        return $this->hasMany(BreakRecord::class)->orderBy('break_start_utc');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['active', 'on_break']);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday(Builder $query): Builder
    {
        $timezone = config('app.company_timezone', 'UTC');
        $today = Carbon::now($timezone)->toDateString();
        return $query->where('session_date', $today);
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->withoutGlobalScope('user_scope')->where('user_id', $userId);
    }
}
