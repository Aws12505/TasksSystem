<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Services\TicketService;
use App\Enums\TicketStatus;
use App\Enums\TicketType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class TicketController extends Controller
{
    public function __construct(
        private TicketService $ticketService
    ) {}

    public function index(): JsonResponse
    {
        $tickets = $this->ticketService->getAllTickets();

        return response()->json([
            'success' => true,
            'data' => $tickets->items(),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'total' => $tickets->total(),
                'per_page' => $tickets->perPage(),
                'last_page' => $tickets->lastPage(),
                'from' => $tickets->firstItem(),
                'to' => $tickets->lastItem(),
            ],
            'message' => 'Tickets retrieved successfully',
        ]);
    }

    public function show($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $ticket = $this->ticketService->getTicketById($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Ticket retrieved successfully',
        ]);
    }

    public function store(StoreTicketRequest $request): JsonResponse
{
    $data = $request->validated();

    if (Auth::check()) {
        // Server decides the requester; ignore any client attempt
        $data['requester_id'] = Auth::id();
        $data['requester_name'] = Auth::user()->name;
    } else {
        // Guests: requester_id stays null; requester_name already validated as required
        $data['requester_id'] = null;
    }

    $ticket = $this->ticketService->createTicket($data);

    return response()->json([
        'success' => true,
        'data' => $ticket,
        'message' => 'Ticket created successfully',
    ], 201);
}

    public function update(UpdateTicketRequest $request, $id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $ticket = $this->ticketService->updateTicket($id, $request->validated());

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Ticket updated successfully',
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $deleted = $this->ticketService->deleteTicket($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Ticket deleted successfully',
        ]);
    }

    // Get available tickets (unassigned and open)
    public function available(): JsonResponse
    {
        $tickets = $this->ticketService->getAvailableTickets();

        return response()->json([
            'success' => true,
            'data' => $tickets->items(),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'total' => $tickets->total(),
                'per_page' => $tickets->perPage(),
                'last_page' => $tickets->lastPage(),
                'from' => $tickets->firstItem(),
                'to' => $tickets->lastItem(),
            ],
            'message' => 'Available tickets retrieved successfully',
        ]);
    }

    // Get tickets by requester
    public function getByRequester(int $userId): JsonResponse
    {
        $tickets = $this->ticketService->getTicketsByRequester($userId);

        return response()->json([
            'success' => true,
            'data' => $tickets->items(),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'total' => $tickets->total(),
                'per_page' => $tickets->perPage(),
                'last_page' => $tickets->lastPage(),
                'from' => $tickets->firstItem(),
                'to' => $tickets->lastItem(),
            ],
            'message' => 'User tickets retrieved successfully',
        ]);
    }

    // Get tickets assigned to user
    public function getByAssignee(int $userId): JsonResponse
    {
        $tickets = $this->ticketService->getTicketsByAssignee($userId);

        return response()->json([
            'success' => true,
            'data' => $tickets->items(),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'total' => $tickets->total(),
                'per_page' => $tickets->perPage(),
                'last_page' => $tickets->lastPage(),
                'from' => $tickets->firstItem(),
                'to' => $tickets->lastItem(),
            ],
            'message' => 'Assigned tickets retrieved successfully',
        ]);
    }

    // Get tickets by status
    public function getByStatus(string $status): JsonResponse
    {
        $ticketStatus = TicketStatus::tryFrom($status);
        
        if (!$ticketStatus) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Invalid status',
            ], 400);
        }

        $tickets = $this->ticketService->getTicketsByStatus($ticketStatus);

        return response()->json([
            'success' => true,
            'data' => $tickets->items(),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'total' => $tickets->total(),
                'per_page' => $tickets->perPage(),
                'last_page' => $tickets->lastPage(),
                'from' => $tickets->firstItem(),
                'to' => $tickets->lastItem(),
            ],
            'message' => 'Tickets by status retrieved successfully',
        ]);
    }

    // Get tickets by type
    public function getByType(string $type): JsonResponse
    {
        $ticketType = TicketType::tryFrom($type);
        
        if (!$ticketType) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Invalid type',
            ], 400);
        }

        $tickets = $this->ticketService->getTicketsByType($ticketType);

        return response()->json([
            'success' => true,
            'data' => $tickets->items(),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'total' => $tickets->total(),
                'per_page' => $tickets->perPage(),
                'last_page' => $tickets->lastPage(),
                'from' => $tickets->firstItem(),
                'to' => $tickets->lastItem(),
            ],
            'message' => 'Tickets by type retrieved successfully',
        ]);
    }

    // Claim ticket
    public function claim($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $ticket = $this->ticketService->claimTicket($id, Auth::id());

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found or not available',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Ticket claimed successfully',
        ]);
    }

    // Assign ticket to specific user
    public function assign($id, int $userId): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $ticket = $this->ticketService->assignTicket($id, $userId);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Ticket assigned successfully',
        ]);
    }

    // Complete ticket
    public function complete($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $ticket = $this->ticketService->completeTicket($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found or not assigned',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Ticket completed successfully',
        ]);
    }

    // Unassign ticket
    public function unassign($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $ticket = $this->ticketService->unassignTicket($id);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found or already completed',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Ticket unassigned successfully',
        ]);
    }

    // Update ticket status
    public function updateStatus(UpdateTicketStatusRequest $request,$id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        
        $ticket = $this->ticketService->updateTicketStatus($id, $request->validated()['status']);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Ticket not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Ticket status updated successfully',
        ]);
    }
}
