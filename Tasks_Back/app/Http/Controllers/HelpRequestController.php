<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHelpRequestRequest;
use App\Http\Requests\UpdateHelpRequestRequest;
use App\Http\Requests\CompleteHelpRequestRequest;
use App\Services\HelpRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class HelpRequestController extends Controller
{
    public function __construct(
        private HelpRequestService $helpRequestService
    ) {}

    public function index(): JsonResponse
    {
        $helpRequests = $this->helpRequestService->getAllHelpRequests();

        return response()->json([
            'success' => true,
            'data' => $helpRequests->items(),
            'pagination' => [
                'current_page' => $helpRequests->currentPage(),
                'total' => $helpRequests->total(),
                'per_page' => $helpRequests->perPage(),
                'last_page' => $helpRequests->lastPage(),
                'from' => $helpRequests->firstItem(),
                'to' => $helpRequests->lastItem(),
            ],
            'message' => 'Help requests retrieved successfully',
        ]);
    }

    public function show($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer

        $helpRequest = $this->helpRequestService->getHelpRequestById($id);

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Help request not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $helpRequest,
            'message' => 'Help request retrieved successfully',
        ]);
    }

    public function store(StoreHelpRequestRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['requester_id'] = Auth::id(); // Set current user as requester
        
        $helpRequest = $this->helpRequestService->createHelpRequest($data);

        return response()->json([
            'success' => true,
            'data' => $helpRequest,
            'message' => 'Help request created successfully',
        ], 201);
    }

    public function update(UpdateHelpRequestRequest $request, $id): JsonResponse
    {
        $id = (int) $id; // Cast to integer

        $helpRequest = $this->helpRequestService->updateHelpRequest($id, $request->validated());

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Help request not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $helpRequest,
            'message' => 'Help request updated successfully',
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer

        $deleted = $this->helpRequestService->deleteHelpRequest($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Help request not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Help request deleted successfully',
        ]);
    }

    // Get available help requests (unclaimed)
    public function available(): JsonResponse
    {
        $helpRequests = $this->helpRequestService->getAvailableHelpRequests();

        return response()->json([
            'success' => true,
            'data' => $helpRequests->items(),
            'pagination' => [
                'current_page' => $helpRequests->currentPage(),
                'total' => $helpRequests->total(),
                'per_page' => $helpRequests->perPage(),
                'last_page' => $helpRequests->lastPage(),
                'from' => $helpRequests->firstItem(),
                'to' => $helpRequests->lastItem(),
            ],
            'message' => 'Available help requests retrieved successfully',
        ]);
    }

    // Get help requests for specific task
    public function getByTask(int $taskId): JsonResponse
    {
        $helpRequests = $this->helpRequestService->getHelpRequestsByTask($taskId);

        return response()->json([
            'success' => true,
            'data' => $helpRequests->items(),
            'pagination' => [
                'current_page' => $helpRequests->currentPage(),
                'total' => $helpRequests->total(),
                'per_page' => $helpRequests->perPage(),
                'last_page' => $helpRequests->lastPage(),
                'from' => $helpRequests->firstItem(),
                'to' => $helpRequests->lastItem(),
            ],
            'message' => 'Task help requests retrieved successfully',
        ]);
    }

    // Get help requests made by user
    public function getByRequester(int $userId): JsonResponse
    {
        $helpRequests = $this->helpRequestService->getHelpRequestsByRequester($userId);

        return response()->json([
            'success' => true,
            'data' => $helpRequests->items(),
            'pagination' => [
                'current_page' => $helpRequests->currentPage(),
                'total' => $helpRequests->total(),
                'per_page' => $helpRequests->perPage(),
                'last_page' => $helpRequests->lastPage(),
                'from' => $helpRequests->firstItem(),
                'to' => $helpRequests->lastItem(),
            ],
            'message' => 'User help requests retrieved successfully',
        ]);
    }

    // Get help requests user is helping with
    public function getByHelper(int $userId): JsonResponse
    {
        $helpRequests = $this->helpRequestService->getHelpRequestsByHelper($userId);

        return response()->json([
            'success' => true,
            'data' => $helpRequests->items(),
            'pagination' => [
                'current_page' => $helpRequests->currentPage(),
                'total' => $helpRequests->total(),
                'per_page' => $helpRequests->perPage(),
                'last_page' => $helpRequests->lastPage(),
                'from' => $helpRequests->firstItem(),
                'to' => $helpRequests->lastItem(),
            ],
            'message' => 'Helper assignments retrieved successfully',
        ]);
    }

    // Claim help request
    public function claim($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer

        $helpRequest = $this->helpRequestService->claimHelpRequest($id, Auth::id());

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Help request not found or not available',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $helpRequest,
            'message' => 'Help request claimed successfully',
        ]);
    }

    // Assign help request to specific user
    public function assign($id, int $userId): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $helpRequest = $this->helpRequestService->assignHelpRequest($id, $userId);

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Help request not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $helpRequest,
            'message' => 'Help request assigned successfully',
        ]);
    }

    // Complete help request with rating
    public function complete(CompleteHelpRequestRequest $request,$id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $helpRequest = $this->helpRequestService->completeHelpRequest(
            $id, 
            $request->validated()['rating']
        );

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Help request not found or not claimed',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $helpRequest,
            'message' => 'Help request completed successfully',
        ]);
    }

    // Unclaim help request
    public function unclaim($id): JsonResponse
    {
        $id = (int) $id; // Cast to integer
        $helpRequest = $this->helpRequestService->unclaimHelpRequest($id);

        if (!$helpRequest) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Help request not found or already completed',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $helpRequest,
            'message' => 'Help request unclaimed successfully',
        ]);
    }
}
