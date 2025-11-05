<?php
// app/Services/ClockingService.php

namespace App\Services;

use App\Models\ClockSession;
use App\Models\BreakRecord;
use App\Models\User;
use App\Events\ClockSessionUpdated;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClockingService
{
    /**
     * Clock in - Uses Auth::user(), no ID passing
     */
    public function clockIn(User $user): array
    {
        $existingSession = ClockSession::forUser($user->id)
            ->whereIn('status', ['active', 'on_break'])
            ->first();

        if ($existingSession) {
            throw ValidationException::withMessages([
                'clock_in' => 'You are already clocked in.',
            ]);
        }

        $timezone = config('app.company_timezone', 'UTC');
        $now = Carbon::now('UTC');
        $sessionDate = Carbon::now($timezone)->toDateString();

        $session = ClockSession::create([
            'user_id' => $user->id,
            'clock_in_utc' => $now,
            'session_date' => $sessionDate,
            'status' => 'active',
        ]);

        $session = $session->fresh(['breakRecords', 'user']);

        // Broadcast with user_id
        broadcast(new ClockSessionUpdated($session));

        return $this->formatSessionResponse($session);
    }

    /**
     * Clock out
     */
public function clockOut(User $user): array
{
    $session = $this->getActiveSession($user);

    DB::transaction(function () use ($session) {
        $nowUtc   = Carbon::now('UTC');
        $timezone = config('app.company_timezone', 'UTC');

        // If on break, auto-end it
        if ($session->status === 'on_break') {
            $this->endBreakInternal($session, $nowUtc);
        }

        // Check midnight crossing (compute on a CLONE, don't mutate $nowUtc)
        $clockInDate  = Carbon::parse($session->clock_in_utc)->timezone($timezone)->toDateString();
        $clockOutDate = $nowUtc->copy()->timezone($timezone)->toDateString();

        $session->update([
            'clock_out_utc'    => $nowUtc, // still UTC
            'status'           => 'completed',
            'crosses_midnight' => $clockInDate !== $clockOutDate,
        ]);
    });

    $session->refresh();
    broadcast(new ClockSessionUpdated($session));

    return $this->formatSessionResponse($session);
}


    /**
     * Start break
     */
    public function startBreak(User $user): array
    {
        $session = $this->getActiveSession($user);

        if ($session->status === 'on_break') {
            throw ValidationException::withMessages([
                'break' => 'You are already on a break.',
            ]);
        }

        $now = Carbon::now('UTC');

        DB::transaction(function () use ($session, $now) {
            $session->update(['status' => 'on_break']);

            BreakRecord::create([
                'clock_session_id' => $session->id,
                'break_start_utc' => $now,
                'status' => 'active',
            ]);
        });

        $session->refresh();
        broadcast(new ClockSessionUpdated($session));

        return $this->formatSessionResponse($session);
    }

    /**
     * End break
     */
    public function endBreak(User $user, ?string $description = null): array
    {
        $session = $this->getActiveSession($user);

        if ($session->status !== 'on_break') {
            throw ValidationException::withMessages([
                'break' => 'You are not currently on a break.',
            ]);
        }

        $now = Carbon::now('UTC');

        DB::transaction(function () use ($session, $now, $description) {
            $this->endBreakInternal($session, $now, $description);
        });

        $session->refresh();
        broadcast(new ClockSessionUpdated($session));

        return $this->formatSessionResponse($session);
    }

    /**
     * Internal method to end a break
     */
    private function endBreakInternal(ClockSession $session, Carbon $endTime, ?string $description = null): void
    {
        $activeBreak = $session->breakRecords()
            ->where('status', 'active')
            ->first();

        if (!$activeBreak) {
            return;
        }

        $activeBreak->update([
            'break_end_utc' => $endTime,
            'description' => $description,
            'status' => 'completed',
        ]);

        $session->update(['status' => 'active']);
    }

    /**
     * Get initial data for authenticated user
     */
    public function getInitialData(User $user): array
    {
        $session = ClockSession::forUser($user->id)
            ->whereIn('status', ['active', 'on_break'])
            ->with(['breakRecords', 'user'])
            ->first();

        return $this->formatSessionResponse($session);
    }

    /**
     * Get manager initial data (all active sessions)
     */
    public function getManagerInitialData(): array
    {
        $sessions = ClockSession::withoutGlobalScope('user_scope')
            ->active()
            ->with(['user', 'breakRecords'])
            ->get();

        return [
            'sessions' => $sessions->map(fn($s) => $this->formatSessionResponse($s)),
            'company_timezone' => config('app.company_timezone', 'UTC'),
            'server_time_utc' => now('UTC')->toIso8601String(),
        ];
    }

    /**
     * Get user's records with pagination
     */
    public function getRecords(User $user, array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = ClockSession::forUser($user->id)->with(['breakRecords']);

        if (!empty($filters['start_date'])) {
            $query->where('session_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('session_date', '<=', $filters['end_date']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('session_date', 'desc')
                     ->orderBy('clock_in_utc', 'desc')
                     ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Get all records (managers)
     */
    public function getAllRecords(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = ClockSession::withoutGlobalScope('user_scope')->with(['user', 'breakRecords']);

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['start_date'])) {
            $query->where('session_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('session_date', '<=', $filters['end_date']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('session_date', 'desc')
                     ->orderBy('clock_in_utc', 'desc')
                     ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Format session response - ONLY timestamps and timezone
     */
    private function formatSessionResponse(?ClockSession $session): array
    {
        if (!$session) {
            return [
                'session' => null,
                'company_timezone' => config('app.company_timezone', 'UTC'),
                'server_time_utc' => now('UTC')->toIso8601String(),
            ];
        }

        return [
            'session' => $session,
            'company_timezone' => config('app.company_timezone', 'UTC'),
            'server_time_utc' => now('UTC')->toIso8601String(),
        ];
    }

    private function getActiveSession(User $user): ClockSession
    {
        $session = ClockSession::forUser($user->id)
            ->whereIn('status', ['active', 'on_break'])
            ->first();

        if (!$session) {
            throw ValidationException::withMessages([
                'session' => 'No active clocking session found.',
            ]);
        }

        return $session;
    }
}
