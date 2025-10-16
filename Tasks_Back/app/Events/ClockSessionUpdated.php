<?php
// app/Events/ClockSessionUpdated.php

namespace App\Events;

use App\Models\ClockSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClockSessionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ClockSession $session
    ) {
        $this->session = $session->fresh(['breakRecords', 'user']);
    }

    public function broadcastAs(): string
    {
        return 'ClockSessionUpdated';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('clocking.manager'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->session->user_id,
            'session' => $this->session->toArray(),
            'company_timezone' => config('app.company_timezone', 'UTC'),
            'server_time_utc' => now('UTC')->toIso8601String(),
        ];
    }
}
