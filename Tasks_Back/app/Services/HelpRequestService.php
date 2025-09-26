<?php

namespace App\Services;

use App\Models\HelpRequest;
use App\Models\User;
use App\Enums\HelpRequestRating;
use Illuminate\Pagination\LengthAwarePaginator;

class HelpRequestService
{
    // Get all help requests
    public function getAllHelpRequests(int $perPage = 15): LengthAwarePaginator
    {
        return HelpRequest::with(['task.section', 'requester', 'helper'])
                          ->latest()
                          ->paginate($perPage);
    }

    // Get help request by ID
    public function getHelpRequestById(int $id)
    {
        return HelpRequest::with(['task.section', 'requester', 'helper'])->find($id);
    }

    // Create new help request
    public function createHelpRequest(array $data): HelpRequest
    {
        return HelpRequest::create($data)->load(['task.section', 'requester', 'helper']);
    }

    // Update help request
    public function updateHelpRequest(int $id, array $data): ?HelpRequest
    {
        $helpRequest = HelpRequest::find($id);
        
        if (!$helpRequest) {
            return null;
        }

        $helpRequest->update($data);
        return $helpRequest->fresh(['task.section', 'requester', 'helper']);
    }

    // Delete help request
    public function deleteHelpRequest(int $id): bool
    {
        $helpRequest = HelpRequest::find($id);
        
        if (!$helpRequest) {
            return false;
        }

        return $helpRequest->delete();
    }

    // Get available help requests (unclaimed)
    public function getAvailableHelpRequests(int $perPage = 15): LengthAwarePaginator
    {
        return HelpRequest::whereNull('helper_id')
                          ->where('is_completed', false)
                          ->with(['task.section.project', 'requester'])
                          ->latest()
                          ->paginate($perPage);
    }

    // Get help requests for specific task
    public function getHelpRequestsByTask(int $taskId, int $perPage = 15): LengthAwarePaginator
    {
        return HelpRequest::where('task_id', $taskId)
                          ->with(['requester', 'helper'])
                          ->latest()
                          ->paginate($perPage);
    }

    // Get help requests made by user
    public function getHelpRequestsByRequester(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return HelpRequest::where('requester_id', $userId)
                          ->with(['task.section.project', 'helper'])
                          ->latest()
                          ->paginate($perPage);
    }

    // Get help requests user is helping with
    public function getHelpRequestsByHelper(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return HelpRequest::where('helper_id', $userId)
                          ->with(['task.section.project', 'requester'])
                          ->latest()
                          ->paginate($perPage);
    }

    // Claim help request
    public function claimHelpRequest(int $id, int $helperId): ?HelpRequest
    {
        $helpRequest = HelpRequest::find($id);
        
        if (!$helpRequest || !$helpRequest->isAvailable()) {
            return null;
        }

        $helpRequest->update(['helper_id' => $helperId]);
        return $helpRequest->fresh(['task.section', 'requester', 'helper']);
    }

    // Assign help request to specific user
    public function assignHelpRequest(int $id, int $helperId): ?HelpRequest
    {
        $helpRequest = HelpRequest::find($id);
        
        if (!$helpRequest) {
            return null;
        }

        $helpRequest->update(['helper_id' => $helperId]);
        return $helpRequest->fresh(['task.section', 'requester', 'helper']);
    }

    // Complete help request with rating
    public function completeHelpRequest(int $id, HelpRequestRating|String $rating): ?HelpRequest
    {
        $helpRequest = HelpRequest::find($id);
        
        if (!$helpRequest || !$helpRequest->isClaimed()) {
            return null;
        }

        $helpRequest->complete($rating);
        return $helpRequest->fresh(['task.section', 'requester', 'helper']);
    }

    // Unclaim help request (remove helper)
    public function unclaimHelpRequest(int $id): ?HelpRequest
    {
        $helpRequest = HelpRequest::find($id);
        
        if (!$helpRequest || $helpRequest->is_completed) {
            return null;
        }

        $helpRequest->update(['helper_id' => null]);
        return $helpRequest->fresh(['task.section', 'requester', 'helper']);
    }
}
