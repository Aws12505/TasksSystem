<?php
// app/Models/ClockingCorrectionRequest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClockingCorrectionRequest extends Model
{
    protected $fillable = [
        'user_id',
        'clock_session_id',
        'break_record_id',
        'correction_type',
        'original_time_utc',
        'requested_time_utc',
        'reason',
        'status',
        'admin_notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'original_time_utc' => 'datetime',
        'requested_time_utc' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clockSession(): BelongsTo
    {
        return $this->belongsTo(ClockSession::class);
    }

    public function breakRecord(): BelongsTo
    {
        return $this->belongsTo(BreakRecord::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
