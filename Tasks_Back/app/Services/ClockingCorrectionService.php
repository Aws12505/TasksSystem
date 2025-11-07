<?php
// app/Services/ClockingCorrectionService.php

namespace App\Services;

use App\Models\ClockingCorrectionRequest;
use App\Models\ClockSession;
use App\Models\BreakRecord;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Events\ClockSessionUpdated;

class ClockingCorrectionService
{
    private function checkIfCrossesMidnight($clockInUtc, $clockOutUtc): bool
    {
        $companyTimezone = config('app.company_timezone', 'UTC');
        $clockInDate = Carbon::parse($clockInUtc, 'UTC')->setTimezone($companyTimezone)->toDateString();
        $clockOutDate = Carbon::parse($clockOutUtc, 'UTC')->setTimezone($companyTimezone)->toDateString();
        return $clockInDate !== $clockOutDate;
    }

    public function requestCorrection(User $user, array $data): ClockingCorrectionRequest
    {
        $correctionType = $data['correction_type'];

        if (in_array($correctionType, ['clock_in', 'clock_out'])) {
            if (empty($data['clock_session_id'])) {
                throw ValidationException::withMessages(['clock_session_id' => 'Required']);
            }
            $session = ClockSession::findOrFail($data['clock_session_id']);
            if ($session->user_id !== $user->id) {
                throw ValidationException::withMessages(['error' => 'Unauthorized']);
            }
            $originalTime = $correctionType === 'clock_in' ? $session->clock_in_utc : $session->clock_out_utc;

        } elseif (in_array($correctionType, ['break_in', 'break_out'])) {
            if (empty($data['break_record_id'])) {
                throw ValidationException::withMessages(['break_record_id' => 'Required']);
            }
            $breakRecord = BreakRecord::findOrFail($data['break_record_id']);
            if ($breakRecord->clockSession->user_id !== $user->id) {
                throw ValidationException::withMessages(['error' => 'Unauthorized']);
            }
            $originalTime = $correctionType === 'break_in' ? $breakRecord->break_start_utc : $breakRecord->break_end_utc;
        }

        return ClockingCorrectionRequest::create([
            'user_id' => $user->id,
            'clock_session_id' => $data['clock_session_id'] ?? null,
            'break_record_id' => $data['break_record_id'] ?? null,
            'correction_type' => $correctionType,
            'original_time_utc' => $originalTime,
            'requested_time_utc' => $data['requested_time_utc'],
            'reason' => $data['reason'],
            'status' => 'pending',
        ]);
    }

    public function approveCorrection(ClockingCorrectionRequest $request, User $admin, ?string $notes = null): void
    {
        DB::transaction(function () use ($request, $admin, $notes) {
            $correctionType = $request->correction_type;
            $newTime = $request->requested_time_utc;

            if (in_array($correctionType, ['clock_in', 'clock_out'])) {
                $session = $request->clockSession;
                if ($correctionType === 'clock_in') {
                    $session->update(['clock_in_utc' => $newTime]);
                    broadcast(new ClockSessionUpdated($session));
                } else {
                    $session->update([
                        'clock_out_utc' => $newTime,
                        'crosses_midnight' => $this->checkIfCrossesMidnight($session->clock_in_utc, $newTime),
                    ]);
                    broadcast(new ClockSessionUpdated($session));
                }
            } elseif (in_array($correctionType, ['break_in', 'break_out'])) {
                $breakRecord = $request->breakRecord;
                $field = $correctionType === 'break_in' ? 'break_start_utc' : 'break_end_utc';
                $breakRecord->update([$field => $newTime]);
                $session = $breakRecord->clockSession;
                broadcast(new ClockSessionUpdated($session));
            }

            $request->update([
                'status' => 'approved',
                'admin_notes' => $notes,
                'approved_by' => $admin->id,
                'approved_at' => now('UTC'),
            ]);
        });
    }

    public function rejectCorrection(ClockingCorrectionRequest $request, User $admin, ?string $notes = null): void
    {
        $request->update([
            'status' => 'rejected',
            'admin_notes' => $notes,
            'approved_by' => $admin->id,
            'approved_at' => now('UTC'),
        ]);
    }

    public function directEditClockSession(ClockSession $session, array $data): ClockSession
    {
        $updateData = [];

        if (!empty($data['clock_in_utc'])) {
            $updateData['clock_in_utc'] = $data['clock_in_utc'];
        }

        if (!empty($data['clock_out_utc'])) {
            $updateData['clock_out_utc'] = $data['clock_out_utc'];
            $updateData['crosses_midnight'] = $this->checkIfCrossesMidnight(
                $updateData['clock_in_utc'] ?? $session->clock_in_utc,
                $data['clock_out_utc']
            );
        }

        $session->update($updateData);
        broadcast(new ClockSessionUpdated($session));
        return $session->fresh();
    }

    public function directEditBreakRecord(BreakRecord $break, array $data): BreakRecord
    {
        $updateData = [];

        if (!empty($data['break_start_utc'])) {
            $updateData['break_start_utc'] = $data['break_start_utc'];
        }

        if (!empty($data['break_end_utc'])) {
            $updateData['break_end_utc'] = $data['break_end_utc'];
        }

        $break->update($updateData);
        $session = $break->clockSession;
        broadcast(new ClockSessionUpdated($session));
        return $break->fresh();
    }

    public function getUserPendingCorrections(User $user)
    {
        return ClockingCorrectionRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with(['clockSession', 'breakRecord'])
            ->latest()
            ->get();
    }

    public function getAllPendingCorrections()
    {
        return ClockingCorrectionRequest::where('status', 'pending')
            ->with(['user', 'clockSession', 'breakRecord'])
            ->latest()
            ->get();
    }
}
