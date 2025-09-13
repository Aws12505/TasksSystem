<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use App\Enums\TicketStatus;
use App\Enums\TicketType;
use Illuminate\Pagination\LengthAwarePaginator;

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
        return Ticket::with(['requester', 'assignee'])->find($id);
    }

    // Create new ticket
    public function createTicket(array $data): Ticket
    {
        return Ticket::create($data)->load(['requester', 'assignee']);
    }

    // Update ticket
    public function updateTicket(int $id, array $data): ?Ticket
    {
        $ticket = Ticket::find($id);
        
        if (!$ticket) {
            return null;
        }

        $ticket->update($data);
        return $ticket->fresh(['requester', 'assignee']);
    }

    // Delete ticket
    public function deleteTicket(int $id): bool
    {
        $ticket = Ticket::find($id);
        
        if (!$ticket) {
            return false;
        }

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
    public function updateTicketStatus(int $id, TicketStatus $status): ?Ticket
    {
        $ticket = Ticket::find($id);
        
        if (!$ticket) {
            return null;
        }

        $updateData = ['status' => $status];
        
        // If resolving, set completed_at
        if ($status === TicketStatus::RESOLVED) {
            $updateData['completed_at'] = now();
        }
        
        $ticket->update($updateData);
        return $ticket->fresh(['requester', 'assignee']);
    }
}
