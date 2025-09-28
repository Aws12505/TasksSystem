<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
class FinalRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'period_start',
        'period_end',
        'final_rating',
        'calculation_steps',
        'variables_used',
        'config_snapshot',
        'calculated_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'final_rating' => 'decimal:2',
        'calculation_steps' => 'array',
        'variables_used' => 'array',
        'config_snapshot' => 'array',
        'calculated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

protected static function booted(): void
    {
        static::addGlobalScope('user_scope', function (Builder $q) {
            /** @var \App\Models\User|null $user */
            $user = Auth::user();
            if (!$user) return;
            if ($user->hasRole('admin', 'sanctum')) return;

            $q->where('user_id', $user->id);
        });
    }

}
