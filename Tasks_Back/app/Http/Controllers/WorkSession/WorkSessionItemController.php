<?php

namespace App\Http\Controllers\WorkSession;

use App\Exceptions\WorkSessionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkSession\ReorderWorkSessionItemsRequest;
use App\Http\Requests\WorkSession\SetItemOutcomeRequest;
use App\Http\Requests\WorkSession\StoreWorkSessionItemRequest;
use App\Http\Requests\WorkSession\UpdateWorkSessionItemRequest;
use App\Models\WorkSession;
use App\Services\WorkSession\WorkSessionItemService;
use App\Services\WorkSession\WorkSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Items of the caller's own work session.
 */
class WorkSessionItemController extends Controller
{
    public function __construct(
        private WorkSessionService $sessions,
        private WorkSessionItemService $items,
    ) {}

    public function store(StoreWorkSessionItemRequest $request, int $id): JsonResponse
    {
        try {
            $session = $this->session($request, $id);
            if (! $session) {
                return $this->notFound();
            }

            $item = $this->items->add($session, $request->user(), $request->validated());

            return response()->json([
                'success' => true,
                'data' => $item,
                'message' => 'Item added successfully',
            ], 201);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to add item');
        }
    }

    public function update(UpdateWorkSessionItemRequest $request, int $id, int $itemId): JsonResponse
    {
        try {
            $session = $this->session($request, $id);
            $item = $session ? $this->items->find($session, $itemId) : null;
            if (! $session || ! $item) {
                return $this->notFound();
            }

            $item = $this->items->update($session, $item, $request->user(), $request->validated());

            return response()->json([
                'success' => true,
                'data' => $item,
                'message' => 'Item updated successfully',
            ]);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to update item');
        }
    }

    public function destroy(Request $request, int $id, int $itemId): JsonResponse
    {
        try {
            $session = $this->session($request, $id);
            $item = $session ? $this->items->find($session, $itemId) : null;
            if (! $session || ! $item) {
                return $this->notFound();
            }

            $this->items->delete($session, $item);

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Item deleted successfully',
            ]);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to delete item');
        }
    }

    public function reorder(ReorderWorkSessionItemsRequest $request, int $id): JsonResponse
    {
        try {
            $session = $this->session($request, $id);
            if (! $session) {
                return $this->notFound();
            }

            $items = $this->items->reorder($session, $request->validated('item_ids'));

            return response()->json([
                'success' => true,
                'data' => $items,
                'message' => 'Items reordered successfully',
            ]);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to reorder items');
        }
    }

    public function setOutcome(SetItemOutcomeRequest $request, int $id, int $itemId): JsonResponse
    {
        try {
            $session = $this->session($request, $id);
            $item = $session ? $this->items->find($session, $itemId) : null;
            if (! $session || ! $item) {
                return $this->notFound();
            }

            $data = $request->validated();
            $item = $this->items->setOutcome($session, $item, $data['outcome'], $data['outcome_note'] ?? null);

            return response()->json([
                'success' => true,
                'data' => $item,
                'message' => 'Item outcome updated successfully',
            ]);
        } catch (WorkSessionException $e) {
            return $this->businessError($e);
        } catch (\Throwable $e) {
            return $this->serverError($e, 'Failed to update item outcome');
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private function session(Request $request, int $id): ?WorkSession
    {
        return WorkSession::forUser($request->user()->id)->find($id);
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
