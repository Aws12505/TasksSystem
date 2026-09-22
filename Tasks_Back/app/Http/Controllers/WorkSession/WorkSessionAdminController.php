<?php

namespace App\Http\Controllers\WorkSession;

use App\Exceptions\WorkSessionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkSession\AdminListWorkSessionsRequest;
use App\Models\User;
use App\Models\WorkSession;
use App\Services\WorkSession\WorkSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin side: all users' sessions (permission-gated in the route file).
 * Queries bypass the user_scope explicitly; the middleware is the guard.
 */
class WorkSessionAdminController extends Controller
{
    public function __construct(private WorkSessionService $sessions) {}

    /** All users, for the filter picker (the generic /users endpoint paginates). */
    public function users(): JsonResponse
    {
        try {
            $users = User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'avatar_path'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'avatar_url' => $u->avatar_url,
                ])
                ->values();

            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Users retrieved successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to retrieve users');
        }
    }

    public function index(AdminListWorkSessionsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();

            $query = WorkSession::withoutGlobalScope('user_scope')
                ->with('user:id,name,email,avatar_path')
                ->between($filters['start_date'] ?? null, $filters['end_date'] ?? null);

            if (! empty($filters['user_ids'])) {
                $query->whereIn('work_sessions.user_id', array_map('intval', $filters['user_ids']));
            }

            if (! empty($filters['status'])) {
                $query->where('work_sessions.status', $filters['status']);
            }

            $perPage = max(1, min(100, (int) ($filters['per_page'] ?? 15)));

            $sessions = $this->sessions->withCounts($query)
                ->orderByDesc('work_sessions.work_date')
                ->orderBy('work_sessions.user_id')
                ->orderByDesc('work_sessions.id')
                ->paginate($perPage);

            $sessions->setCollection($this->sessions->decorateCounts($sessions->getCollection()));

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

    public function show(int $id): JsonResponse
    {
        try {
            $session = $this->find($id);

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

    public function reopen(Request $request, int $id): JsonResponse
    {
        try {
            $session = $this->find($id);

            if (! $session) {
                return $this->notFound();
            }

            $session = $this->sessions->reopen($session, $request->user());
            $session = $this->find($session->id);

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Work session reopened successfully',
            ]);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to reopen work session');
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private function find(int $id): ?WorkSession
    {
        return WorkSession::withoutGlobalScope('user_scope')
            ->with([
                'user:id,name,email,avatar_path',
                'reopenedByUser:id,name,avatar_path',
                'items.task' => fn ($q) => $q->withoutGlobalScopes()->select('id', 'name', 'status', 'priority'),
            ])
            ->find($id);
    }

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
