<?php

namespace App\Http\Controllers\WorkSession;

use App\Exceptions\WorkSessionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkSession\ListMonthlyRatingsRequest;
use App\Http\Requests\WorkSession\RatingAverageRequest;
use App\Http\Requests\WorkSession\UpsertMonthlyRatingRequest;
use App\Models\User;
use App\Services\WorkSession\MonthlyRatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Manual monthly ratings (0..100) per user. Admin-only; gated by the
 * "rate work sessions" permission at the route level.
 */
class MonthlyRatingController extends Controller
{
    public function __construct(private readonly MonthlyRatingService $ratings) {}

    /** GET /work-sessions/admin/ratings?year=&month= */
    public function index(ListMonthlyRatingsRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $data = $this->ratings->listForMonth((int) $validated['year'], (int) $validated['month']);

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Monthly ratings retrieved successfully',
            ]);
        } catch (WorkSessionException $e) {
            return response()->json(['success' => false, 'data' => null, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            Log::error('Failed to process rating request', ['exception' => $e]);

            return response()->json(['success' => false, 'message' => 'Failed to process rating request'], 500);
        }
    }

    /** POST /work-sessions/admin/ratings/average */
    public function average(RatingAverageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $data = $this->ratings->average(
                $validated['user_ids'],
                ['year' => (int) $validated['from']['year'], 'month' => (int) $validated['from']['month']],
                ['year' => (int) $validated['to']['year'], 'month' => (int) $validated['to']['month']],
            );

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Rating averages calculated successfully',
            ]);
        } catch (WorkSessionException $e) {
            return response()->json(['success' => false, 'data' => null, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            Log::error('Failed to process rating request', ['exception' => $e]);

            return response()->json(['success' => false, 'message' => 'Failed to process rating request'], 500);
        }
    }

    /** PUT /work-sessions/admin/ratings/{user}/{year}/{month} */
    public function upsert(UpsertMonthlyRatingRequest $request, int $user, int $year, int $month): JsonResponse
    {
        if ($invalid = $this->invalidPeriod($year, $month)) {
            return $invalid;
        }

        $target = User::find($user);
        if (! $target) {
            return response()->json(['success' => false, 'data' => null, 'message' => 'User not found'], 404);
        }

        try {
            $validated = $request->validated();

            $result = $this->ratings->upsert(
                $target,
                $year,
                $month,
                (float) $validated['score'],
                $validated['comment'] ?? null,
                $request->user(),
            );

            return response()->json([
                'success' => true,
                'data' => $this->ratings->ratingPayload($result['rating']),
                'message' => $result['created'] ? 'Rating created successfully' : 'Rating updated successfully',
            ], $result['created'] ? 201 : 200);
        } catch (WorkSessionException $e) {
            return response()->json(['success' => false, 'data' => null, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            Log::error('Failed to process rating request', ['exception' => $e]);

            return response()->json(['success' => false, 'message' => 'Failed to process rating request'], 500);
        }
    }

    /** DELETE /work-sessions/admin/ratings/{user}/{year}/{month} */
    public function destroy(Request $request, int $user, int $year, int $month): JsonResponse
    {
        if ($invalid = $this->invalidPeriod($year, $month)) {
            return $invalid;
        }

        $target = User::find($user);
        if (! $target) {
            return response()->json(['success' => false, 'data' => null, 'message' => 'User not found'], 404);
        }

        try {
            $deleted = $this->ratings->delete($target, $year, $month);

            if (! $deleted) {
                return response()->json(['success' => false, 'data' => null, 'message' => 'Rating not found'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Rating deleted successfully',
            ]);
        } catch (WorkSessionException $e) {
            return response()->json(['success' => false, 'data' => null, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            Log::error('Failed to process rating request', ['exception' => $e]);

            return response()->json(['success' => false, 'message' => 'Failed to process rating request'], 500);
        }
    }

    /** 400 response when the path year/month is out of range, null otherwise. */
    private function invalidPeriod(int $year, int $month): ?JsonResponse
    {
        if ($month < 1 || $month > 12 || $year < 2020 || $year > 2100) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Invalid year or month',
            ], 400);
        }

        return null;
    }
}
