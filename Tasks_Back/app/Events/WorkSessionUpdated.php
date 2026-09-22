<?php

// app/Events/WorkSessionUpdated.php

namespace App\Events;

use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired whenever a work session changes in a way the admin "All Sessions"
 * view cares about: started, confirmed, reopened or its items changed.
 * Mirrors ClockSessionUpdated (public channel, broadcast immediately).
 */
class WorkSessionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public WorkSession $session;

    public function __construct(WorkSession $session, public string $action)
    {
        // Reload outside the user_scope so the payload is complete regardless
        // of who triggered the event, and attach fresh counts.
        $this->session = WorkSession::withoutGlobalScope('user_scope')
            ->with('user:id,name,avatar_path')
            ->withCount([
                'items',
                'items as done_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_DONE),
                'items as partial_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_PARTIAL),
                'items as not_done_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_NOT_DONE),
                'items as pending_count' => fn ($q) => $q->where('outcome', WorkSessionItem::OUTCOME_PENDING),
            ])
            ->findOrFail($session->id);
    }

    public function broadcastAs(): string
    {
        return 'WorkSessionUpdated';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('work-sessions.admin'),
        ];
    }

    public function broadcastWith(): array
    {
        $s = $this->session;

        return [
            'action' => $this->action,
            'session_id' => $s->id,
            'user_id' => $s->user_id,
            'user_name' => $s->user?->name,
            'avatar_url' => $s->user?->avatar_url,
            'work_date' => $s->work_date?->format('Y-m-d'),
            'status' => $s->status,
            'confirmed_at' => $s->confirmed_at?->toIso8601String(),
            'counts' => [
                'items' => (int) $s->items_count,
                'done' => (int) $s->done_count,
                'partial' => (int) $s->partial_count,
                'not_done' => (int) $s->not_done_count,
                'pending' => (int) $s->pending_count,
            ],
            'completion_pct' => WorkSession::completionPct(
                (int) $s->done_count,
                (int) $s->partial_count,
                (int) $s->items_count
            ),
            'server_time_utc' => now('UTC')->toIso8601String(),
        ];
    }
}
