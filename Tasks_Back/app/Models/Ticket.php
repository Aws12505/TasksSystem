<?php

namespace App\Models;

use App\Enums\TicketStatus;
use App\Enums\TicketType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'type',
        'priority',
        'requester_id',
        'assigned_to',
        'completed_at',
    ];

    protected $casts = [
        'status' => TicketStatus::class,
        'type' => TicketType::class,
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Check if ticket is assigned (has an assignee)
    public function isAssigned(): bool
    {
        return !is_null($this->assigned_to);
    }

    // Check if ticket is available to be claimed
    public function isAvailable(): bool
    {
        return is_null($this->assigned_to) && $this->status === TicketStatus::OPEN;
    }

    // Check if ticket is completed
    public function isCompleted(): bool
    {
        return $this->status === TicketStatus::RESOLVED;
    }

    // Complete the ticket
    public function complete(): void
    {
        $this->update([
            'status' => TicketStatus::RESOLVED,
            'completed_at' => now(),
        ]);
    }

    // Start working on the ticket
    public function startWork(): void
    {
        $this->update([
            'status' => TicketStatus::IN_PROGRESS,
        ]);
    }
}
