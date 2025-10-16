<?php
// app/Models/BreakRecord.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreakRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'clock_session_id',
        'break_start_utc',
        'break_end_utc',
        'description',
        'status',
    ];

    protected $casts = [
        'break_start_utc' => 'datetime',
        'break_end_utc' => 'datetime',
    ];

    // NO calculated fields - frontend does all calculations
    protected $hidden = ['created_at', 'updated_at'];

    public function clockSession(): BelongsTo
    {
        return $this->belongsTo(ClockSession::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
