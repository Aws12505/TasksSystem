<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Manual admin rating (0..100) for a user for a given calendar month.
 * One row per (user, year, month). Admin-only routes, so no visibility scope.
 */
class UserMonthlyRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'year',
        'month',
        'score',
        'comment',
        'rated_by',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'score' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rated_by');
    }
}
