<?php

namespace App\Services\WorkSession;

use App\Models\User;
use App\Models\UserMonthlyRating;

/**
 * Manual monthly score (0..100) per user, plus averages over month ranges.
 */
class MonthlyRatingService
{
    public function __construct(private readonly WorkSessionReportService $reports) {}

    /**
     * Every user (ordered by name) with their rating for the month (or null)
     * and their confirmed-session stats for that month.
     */
    public function listForMonth(int $year, int $month): array
    {
        $users = User::orderBy('name')->get(['id', 'name', 'email', 'avatar_path']);
        $userIds = $users->pluck('id')->map(fn ($id) => (int) $id)->all();

        $ratings = UserMonthlyRating::where('year', $year)
            ->where('month', $month)
            ->whereIn('user_id', $userIds)
            ->get()
            ->keyBy('user_id');

        $stats = $this->reports->monthlyStatsForUsers($year, $month, $userIds);

        return $users->map(function (User $user) use ($ratings, $stats) {
            /** @var UserMonthlyRating|null $rating */
            $rating = $ratings->get($user->id);

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                ],
                'rating' => $rating ? $this->ratingPayload($rating) : null,
                'stats' => $stats[$user->id] ?? $this->reports->emptyStats(),
            ];
        })->values()->all();
    }

    /**
     * Create or update the (user, year, month) rating.
     *
     * @return array{rating: UserMonthlyRating, created: bool}
     */
    public function upsert(User $user, int $year, int $month, float $score, ?string $comment, User $rater): array
    {
        $rating = UserMonthlyRating::updateOrCreate(
            ['user_id' => $user->id, 'year' => $year, 'month' => $month],
            ['score' => round($score, 2), 'comment' => $comment, 'rated_by' => $rater->id],
        );

        return [
            'rating' => $rating,
            'created' => $rating->wasRecentlyCreated,
        ];
    }

    /** @return bool whether a row existed and was removed */
    public function delete(User $user, int $year, int $month): bool
    {
        return UserMonthlyRating::where('user_id', $user->id)
            ->where('year', $year)
            ->where('month', $month)
            ->delete() > 0;
    }

    /**
     * Per-user average over the months in [from, to] that HAVE a rating,
     * plus the overall mean of those per-user averages.
     *
     * @param  int[]  $userIds
     * @param  array{year:int,month:int}  $from
     * @param  array{year:int,month:int}  $to
     */
    public function average(array $userIds, array $from, array $to): array
    {
        $userIds = array_values(array_unique(array_map('intval', $userIds)));

        $fromIndex = $this->monthIndex((int) $from['year'], (int) $from['month']);
        $toIndex = $this->monthIndex((int) $to['year'], (int) $to['month']);
        $monthsInRange = max(0, $toIndex - $fromIndex + 1);

        $users = User::whereIn('id', $userIds)->orderBy('name')->get(['id', 'name', 'email', 'avatar_path']);

        $ratings = UserMonthlyRating::whereIn('user_id', $userIds)
            ->whereRaw('(year * 12 + month) BETWEEN ? AND ?', [$fromIndex, $toIndex])
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->groupBy('user_id');

        $perUser = [];
        $averages = [];

        foreach ($users as $user) {
            $userRatings = collect($ratings->get($user->id, []));
            $scores = $userRatings->map(fn (UserMonthlyRating $r) => (float) $r->score);
            $average = $scores->isEmpty() ? null : round($scores->avg(), 2);

            if ($average !== null) {
                $averages[] = $average;
            }

            $perUser[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'avatar_url' => $user->avatar_url,
                'months_rated' => $scores->count(),
                'average_score' => $average,
                'ratings' => $userRatings->map(fn (UserMonthlyRating $r) => [
                    'year' => (int) $r->year,
                    'month' => (int) $r->month,
                    'score' => (float) $r->score,
                ])->values()->all(),
            ];
        }

        return [
            'range' => [
                'from' => sprintf('%04d-%02d', $from['year'], $from['month']),
                'to' => sprintf('%04d-%02d', $to['year'], $to['month']),
                'months_in_range' => $monthsInRange,
            ],
            'per_user' => $perUser,
            'overall_average' => $averages === [] ? null : round(array_sum($averages) / count($averages), 2),
            'users_with_ratings' => count($averages),
        ];
    }

    /** Public shape of a rating row (score as float). */
    public function ratingPayload(UserMonthlyRating $rating): array
    {
        return [
            'id' => $rating->id,
            'user_id' => (int) $rating->user_id,
            'year' => (int) $rating->year,
            'month' => (int) $rating->month,
            'score' => (float) $rating->score,
            'comment' => $rating->comment,
            'rated_by' => $rating->rated_by !== null ? (int) $rating->rated_by : null,
            'created_at' => $rating->created_at?->toISOString(),
            'updated_at' => $rating->updated_at?->toISOString(),
        ];
    }

    /** Linear month index so ranges can be compared with plain integers. */
    private function monthIndex(int $year, int $month): int
    {
        return $year * 12 + $month;
    }
}
