<?php

namespace App\Http\Controllers\WorkSession;

use App\Exceptions\WorkSessionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkSession\AssignableTasksRequest;
use App\Http\Requests\WorkSession\ConfirmWorkSessionRequest;
use App\Http\Requests\WorkSession\ListWorkSessionsRequest;
use App\Http\Requests\WorkSession\StartWorkSessionRequest;
use App\Http\Requests\WorkSession\UpdateWorkSessionSummaryRequest;
use App\Services\WorkSession\WorkSessionItemService;
use App\Services\WorkSession\WorkSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Employee side of the Work Sessions module. Every lookup goes through
 * WorkSession::forUser() so users can only ever touch their own sessions.
 */
class WorkSessionController extends Controller
{
    public function __construct(
        private WorkSessionService $sessions,
        private WorkSessionItemService $items,
    ) {}

    public function today(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->sessions->todayPayload($request->user()),
                'message' => 'Today work session retrieved successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to retrieve today work session');
        }
    }

    public function start(StartWorkSessionRequest $request): JsonResponse
    {
        try {
            $session = $this->sessions->start(
                $request->user(),
                $request->validated('carry_over_item_ids') ?? []
            );

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Work session started successfully',
            ], 201);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to start work session');
        }
    }

    public function index(ListWorkSessionsRequest $request): JsonResponse
    {
        try {
            $sessions = $this->sessions->listForUser($request->user(), $request->validated());

            return response()->json([
                'success' => true,
                'data' => $sessions->items(),
                'pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'total' => $sessions->total(),
                    'per_page' => $sessions->perPage(),
                    'last_page' => $sessions->lastPage(),
                    'from' => $sessions->firstItem(),
                    'to' => $sessions->lastItem(),
                ],
                'message' => 'Work sessions retrieved successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to retrieve work sessions');
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $session = $this->sessions->findForUser($request->user(), $id);

            if (! $session) {
                return $this->notFound();
            }

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Work session retrieved successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to retrieve work session');
        }
    }

    public function updateSummary(UpdateWorkSessionSummaryRequest $request, int $id): JsonResponse
    {
        try {
            $session = $this->sessions->findForUser($request->user(), $id);

            if (! $session) {
                return $this->notFound();
            }

            $session = $this->sessions->updateSummary($session, $request->validated('summary_note'));

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Summary updated successfully',
            ]);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to update summary');
        }
    }

    public function confirm(ConfirmWorkSessionRequest $request, int $id): JsonResponse
    {
        try {
            $session = $this->sessions->findForUser($request->user(), $id);

            if (! $session) {
                return $this->notFound();
            }

            $data = $request->validated();
            $session = $this->sessions->confirm($session, $data['items'], $data['summary_note'] ?? null);

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Work session confirmed successfully',
            ]);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to confirm work session');
        }
    }

    public function assignableTasks(AssignableTasksRequest $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->items->assignableTasks($request->user(), $request->validated('search')),
                'message' => 'Assignable tasks retrieved successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to retrieve assignable tasks');
        }
    }

    // ─── Response helpers ─────────────────────────────────────────────

    private function notFound(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => 'Work session not found',
        ], 404);
    }

    private function businessError(WorkSessionException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $e->getMessage(),
        ], 400);
    }

    private function serverError(\Throwable $e, string $message): JsonResponse
    {
        Log::error($message, ['exception' => $e]);

        return response()->json([
            'success' => false,
            'message' => $message,
        ], 500);
    }
}
