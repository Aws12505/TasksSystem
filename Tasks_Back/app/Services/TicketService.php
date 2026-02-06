<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use App\Enums\TicketStatus;
use App\Enums\TicketType;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Attachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TicketService
{
    // Get all tickets
    public function getAllTickets(int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::with(['requester', 'assignee'])
            ->latest()
            ->paginate($perPage);
    }

    // Get ticket by ID
    public function getTicketById(int $id)
    {
        return Ticket::with(['requester', 'assignee', 'attachments'])->find($id);
    }

    // Create new ticket
    public function createTicket(array $data): Ticket
    {
        // Create ticket
        $ticket = Ticket::create($data);

        // Handle file uploads
        if (isset($data['attachments'])) {
            foreach ($data['attachments'] as $file) {
                $this->uploadAttachment($ticket, $file);
            }
        }

        return $ticket->load(['requester', 'assignee', 'attachments']);
    }

    // Update ticket
    public function updateTicket(int $id, array $data): ?Ticket
    {
        $ticket = Ticket::find($id);
        if (!$ticket) {
            return null;
        }

        // Update ticket fields
        $ticket->update($data);

        // Remove attachments NOT in keep list
        if (isset($data['keep_attachments'])) {
            $ticket->attachments()
                ->whereNotIn('id', $data['keep_attachments'])
                ->get()
                ->each(function ($attachment) {
                    Storage::disk('public')->delete($attachment->file_path);
                    $attachment->delete();
                });
        }

        // Upload new attachments
        if (isset($data['attachments'])) {
            foreach ($data['attachments'] as $file) {
                $this->uploadAttachment($ticket, $file);
            }
        }

        return $ticket->load(['requester', 'assignee', 'attachments']);
    }

    private function uploadAttachment(Ticket $ticket, $file)
    {
        $path = $file->store('attachments', 'public');
        $attachment = new Attachment([
            'ticket_id' => $ticket->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);
        $attachment->save();
    }
    private function deleteAllAttachments(Ticket $ticket)
    {
        foreach ($ticket->attachments as $attachment) {
            Storage::delete($attachment->file_path);
            $attachment->delete();
        }
    }
    // Delete ticket
    public function deleteTicket(int $id): bool
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return false;
        }

        // Delete associated attachments
        $this->deleteAllAttachments($ticket);

        return $ticket->delete();
    }

    // Get available tickets (unassigned and open)
    public function getAvailableTickets(int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::whereNull('assigned_to')
            ->where('status', TicketStatus::OPEN)
            ->with(['requester'])
            ->latest()
            ->paginate($perPage);
    }

    // Get tickets by requester
    public function getTicketsByRequester(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::where('requester_id', $userId)
            ->with(['assignee'])
            ->latest()
            ->paginate($perPage);
    }

    // Get tickets assigned to user
    public function getTicketsByAssignee(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::where('assigned_to', $userId)
            ->with(['requester'])
            ->latest()
            ->paginate($perPage);
    }

    // Get tickets by status
    public function getTicketsByStatus(TicketStatus $status, int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::where('status', $status)
            ->with(['requester', 'assignee'])
            ->latest()
            ->paginate($perPage);
    }

    // Get tickets by type
    public function getTicketsByType(TicketType $type, int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::where('type', $type)
            ->with(['requester', 'assignee'])
            ->latest()
            ->paginate($perPage);
    }

    // Claim ticket
    public function claimTicket(int $id, int $assigneeId): ?Ticket
    {
        $ticket = Ticket::find($id);

        if (!$ticket || !$ticket->isAvailable()) {
            return null;
        }

        $ticket->update([
            'assigned_to' => $assigneeId,
            'status' => TicketStatus::IN_PROGRESS,
        ]);

        return $ticket->fresh(['requester', 'assignee']);
    }

    // Assign ticket to specific user
    public function assignTicket(int $id, int $assigneeId): ?Ticket
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return null;
        }

        $ticket->update([
            'assigned_to' => $assigneeId,
            'status' => $ticket->status === TicketStatus::OPEN ? TicketStatus::IN_PROGRESS : $ticket->status,
        ]);

        return $ticket->fresh(['requester', 'assignee']);
    }

    // Complete ticket
    public function completeTicket(int $id): ?Ticket
    {
        $ticket = Ticket::find($id);

        if (!$ticket || !$ticket->isAssigned()) {
            return null;
        }

        $ticket->complete();
        return $ticket->fresh(['requester', 'assignee']);
    }

    // Unassign ticket (remove assignee)
    public function unassignTicket(int $id): ?Ticket
    {
        $ticket = Ticket::find($id);

        if (!$ticket || $ticket->isCompleted()) {
            return null;
        }

        $ticket->update([
            'assigned_to' => null,
            'status' => TicketStatus::OPEN,
        ]);

        return $ticket->fresh(['requester', 'assignee']);
    }

    // Update ticket status
    public function updateTicketStatus(int $id, string $status): ?Ticket
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return null;
        }

        $updateData = ['status' => $status];
        $status = $status instanceof TicketStatus ? $status : TicketStatus::from($status);

        // If resolving, set completed_at
        if ($status === TicketStatus::RESOLVED) {
            $updateData['completed_at'] = now();
        }

        $ticket->update($updateData);
        return $ticket->fresh(['requester', 'assignee']);
    }
}
