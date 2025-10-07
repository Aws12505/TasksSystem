<?php

namespace App\Models;

use App\Enums\HelpRequestRating;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HelpRequest extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'description',
        'task_id',
        'requester_id',
        'helper_id',
        'rating',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'rating' => HelpRequestRating::class,
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
            'is_claimed'   => 'bool',
        'is_available' => 'bool',
    ];

    // Make sure these show up in JSON responses
    protected $appends = [
        'is_claimed',
        'is_available',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function helper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'helper_id');
    }

    // Check if help request is claimed (has a helper assigned)
    public function isClaimed(): bool
    {
        return !is_null($this->helper_id);
    }

    // Check if help request is available to be claimed
    public function isAvailable(): bool
    {
        return is_null($this->helper_id) && !$this->is_completed;
    }

    // Get penalty multiplier from rating
    public function getPenaltyMultiplier(): ?float
    {
        return $this->rating?->getPenaltyMultiplier();
    }

    // Complete the help request with rating
    public function complete(string $rating): void
    {
        $this->update([
            'rating' => $rating,
            'is_completed' => true,
            'completed_at' => now(),
        ]);
    }

     public function getIsClaimedAttribute(): bool
    {
        // Use your existing logic here
        // Example: return !is_null($this->helper_id) && !$this->is_completed;
        return (bool) ($this->isClaimed());
    }

    public function getIsAvailableAttribute(): bool
    {
        // Use your existing logic here
        // Example: return is_null($this->helper_id) && !$this->is_completed;
        return (bool) ($this->isAvailable());
    }
}
