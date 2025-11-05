<?php
// app/Http/Controllers/ClockingController.php

namespace App\Http\Controllers;

use App\Http\Requests\EndBreakRequest;
use App\Http\Requests\GetRecordsRequest;
use App\Http\Requests\ExportClockingsRequest;
use App\Services\ClockingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use ZipArchive;

class ClockingController extends Controller
{
    public function __construct(
        private ClockingService $clockingService,
    ) {}

    /**
     * Get initial data for authenticated user
     */
    public function getInitialData(Request $request): JsonResponse
    {
        $data = $this->clockingService->getInitialData($request->user());

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Initial data retrieved successfully',
        ]);
    }

    /**
     * Clock in
     */
    public function clockIn(Request $request): JsonResponse
    {
        $data = $this->clockingService->clockIn($request->user());

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Clocked in successfully',
        ], 201);
    }

    /**
     * Clock out
     */
    public function clockOut(Request $request): JsonResponse
    {
        $data = $this->clockingService->clockOut($request->user());

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Clocked out successfully',
        ]);
    }

    /**
     * Start break
     */
    public function startBreak(Request $request): JsonResponse
    {
        $data = $this->clockingService->startBreak($request->user());

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Break started',
        ], 201);
    }

    /**
     * End break
     */
    public function endBreak(EndBreakRequest $request): JsonResponse
    {
        $data = $this->clockingService->endBreak(
            $request->user(),
            $request->input('description')
        );

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Break ended',
        ]);
    }

    /**
     * Get user's records
     */
    public function getRecords(GetRecordsRequest $request): JsonResponse
    {
        $records = $this->clockingService->getRecords(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'data' => $records->items(),
            'pagination' => [
                'current_page' => $records->currentPage(),
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'last_page' => $records->lastPage(),
                'from' => $records->firstItem(),
                'to' => $records->lastItem(),
            ],
            'message' => 'Records retrieved successfully',
        ]);
    }



    /**
     * Get manager initial data
     */
    public function getManagerInitialData(Request $request): JsonResponse
    {
        $data = $this->clockingService->getManagerInitialData();

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Manager initial data retrieved successfully',
        ]);
    }

    /**
     * Get all records
     */
    public function getAllRecords(GetRecordsRequest $request): JsonResponse
    {
        $records = $this->clockingService->getAllRecords($request->validated());

        return response()->json([
            'success' => true,
            'data' => $records->items(),
            'pagination' => [
                'current_page' => $records->currentPage(),
                'total' => $records->total(),
                'per_page' => $records->perPage(),
                'last_page' => $records->lastPage(),
                'from' => $records->firstItem(),
                'to' => $records->lastItem(),
            ],
            'message' => 'All records retrieved successfully',
        ]);
    }


public function exportRecords(ExportClockingsRequest $request)
{
    $tempDir = null;
    $zipPath = null;

    try {
        $tempDir = storage_path('app/temp/clocking-' . time() . '-' . uniqid());
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $userId = $request->user()->id;
        $userName = preg_replace('/[^a-zA-Z0-9]/', '_', $request->user()->name);
        $companyTimezone = config('app.company_timezone', 'UTC');

        // FIX: Query ALL records directly - NO pagination
        $query = \App\Models\ClockSession::forUser($userId)->with(['breakRecords', 'user']);

        if (!empty($request->input('start_date'))) {
            $query->where('session_date', '>=', $request->input('start_date'));
        }
        if (!empty($request->input('end_date'))) {
            $query->where('session_date', '<=', $request->input('end_date'));
        }

        $sessionsCollection = $query->orderBy('session_date', 'desc')
            ->orderBy('clock_in_utc', 'desc')
            ->get();

        // Format all sessions
        $formattedSessions = $sessionsCollection->map(function($session) use ($companyTimezone) {
            $workSeconds = $this->calculateWorkDuration(
                $session->clock_in_utc,
                $session->clock_out_utc,
                $session->breakRecords ?? []
            );
            $breakSeconds = $this->calculateTotalBreakDuration($session->breakRecords ?? []);

            return [
                'session_date' => \Carbon\Carbon::parse($session->session_date, 'UTC')
                    ->setTimezone($companyTimezone)
                    ->format('M d, Y'),
                'clock_in' => \Carbon\Carbon::parse($session->clock_in_utc, 'UTC')
                    ->setTimezone($companyTimezone)
                    ->format('h:i A'),
                'clock_out' => $session->clock_out_utc 
                    ? \Carbon\Carbon::parse($session->clock_out_utc, 'UTC')
                        ->setTimezone($companyTimezone)
                        ->format('h:i A')
                    : '—',
                'work_duration' => $this->formatDuration($workSeconds),
                'break_duration' => $this->formatDuration($breakSeconds),
                'breaks_count' => ($session->breakRecords ? $session->breakRecords->count() : 0),
                'status' => $session->status,
                'raw_work_seconds' => $workSeconds,
                'raw_break_seconds' => $breakSeconds,
            ];
        })->toArray();

        $totalWorkSeconds = array_sum(array_column($formattedSessions, 'raw_work_seconds'));
        $totalBreakSeconds = array_sum(array_column($formattedSessions, 'raw_break_seconds'));

        $userModel = $request->user();
        $avatarLocalPath = $userModel->avatar_local_path ?? null;

        $individualPdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.clocking-records', [
            'user' => $userModel,
            'avatar_local_path' => $avatarLocalPath,
            'sessions' => $formattedSessions,
            'filters' => $request->validated(),
            'companyTimezone' => $companyTimezone,
            'totals' => [
                'records_count' => count($formattedSessions),
                'work_duration' => $this->formatDuration($totalWorkSeconds),
                'break_duration' => $this->formatDuration($totalBreakSeconds),
            ],
        ]);
        $individualPdf->setPaper('a4', 'portrait');
        $pdfFileName = 'clocking_' . $userName . '_' . $userId . '.pdf';
        $individualPdf->save($tempDir . '/' . $pdfFileName);

        $zipFileName = 'clocking-export_' . now()->format('Y-m-d_H-i-s') . '.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \Exception('Could not create ZIP file');
        }

        $zip->addFile($tempDir . '/' . $pdfFileName, $pdfFileName);
        $zip->close();

        return response()->download($zipPath, $zipFileName, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="' . $zipFileName . '"',
        ])->deleteFileAfterSend(true);

    } catch (\Exception $e) {
        if ($tempDir && file_exists($tempDir)) {
            array_map('unlink', glob("$tempDir/*.*"));
            @rmdir($tempDir);
        }
        if ($zipPath && file_exists($zipPath)) {
            @unlink($zipPath);
        }
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    } finally {
        if ($tempDir) {
            register_shutdown_function(function () use ($tempDir) {
                if (file_exists($tempDir)) {
                    foreach (glob("$tempDir/*.*") as $file) {
                        @unlink($file);
                    }
                    @rmdir($tempDir);
                }
            });
        }
    }
}

/**
 * Export all records - NO PAGINATION - OVERVIEW PER USER (Analytics)
 */
public function exportAllRecords(ExportClockingsRequest $request)
{
    $tempDir = null;
    $zipPath = null;

    try {
        $tempDir = storage_path('app/temp/clocking-all-' . time() . '-' . uniqid());
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $companyTimezone = config('app.company_timezone', 'UTC');

        // FIX: Query ALL records directly - NO pagination
        $query = \App\Models\ClockSession::withoutGlobalScope('user_scope')->with(['breakRecords', 'user']);

        if (!empty($request->input('start_date'))) {
            $query->where('session_date', '>=', $request->input('start_date'));
        }
        if (!empty($request->input('end_date'))) {
            $query->where('session_date', '<=', $request->input('end_date'));
        }

        $allSessionsCollection = $query->orderBy('session_date', 'desc')
            ->orderBy('clock_in_utc', 'desc')
            ->get();

        $sessionsByUser = $allSessionsCollection->groupBy('user_id');

        // FIX: Create ANALYTICS per user (aggregated data) - NOT individual records
        $userAnalytics = $sessionsByUser->map(function($userSessions, $userId) use ($companyTimezone) {
            $user = $userSessions->first()->user;
            
            $totalWorkSeconds = 0;
            $totalBreakSeconds = 0;
            $totalSessions = 0;

            foreach ($userSessions as $session) {
                $workSeconds = $this->calculateWorkDuration(
                    $session->clock_in_utc,
                    $session->clock_out_utc,
                    $session->breakRecords ?? []
                );
                $breakSeconds = $this->calculateTotalBreakDuration($session->breakRecords ?? []);
                
                $totalWorkSeconds += $workSeconds;
                $totalBreakSeconds += $breakSeconds;
                $totalSessions += 1;
            }

            return [
                'user_id' => $userId,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'avatar_local_path' => $user->avatar_local_path ?? null,
                'total_sessions' => $totalSessions,
                'total_work_duration' => $this->formatDuration($totalWorkSeconds),
                'total_break_duration' => $this->formatDuration($totalBreakSeconds),
                'raw_work_seconds' => $totalWorkSeconds,
                'raw_break_seconds' => $totalBreakSeconds,
            ];
        })->values()->toArray();

        // Overall totals
        $totalWorkSeconds = array_sum(array_column($userAnalytics, 'raw_work_seconds'));
        $totalBreakSeconds = array_sum(array_column($userAnalytics, 'raw_break_seconds'));

        // Generate OVERVIEW PDF (Analytics only)
        $overviewPdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.clocking-overview', [
            'userAnalytics' => $userAnalytics,
            'filters' => $request->validated(),
            'companyTimezone' => $companyTimezone,
            'totals' => [
                'employees_count' => count($userAnalytics),
                'total_sessions' => array_sum(array_column($userAnalytics, 'total_sessions')),
                'work_duration' => $this->formatDuration($totalWorkSeconds),
                'break_duration' => $this->formatDuration($totalBreakSeconds),
            ],
        ]);
        $overviewPdf->setPaper('a4', 'portrait');
        $overviewPdf->save($tempDir . '/00_overview.pdf');

        // Generate individual PDFs per user with FULL records
        $fileIndex = 1;
        foreach ($sessionsByUser as $userSessions) {
            $user = $userSessions->first()->user;
            $sanitizedName = preg_replace('/[^a-zA-Z0-9]/', '_', $user->name);

            $userFormattedSessions = $userSessions->map(function($session) use ($companyTimezone) {
                $workSeconds = $this->calculateWorkDuration(
                    $session->clock_in_utc,
                    $session->clock_out_utc,
                    $session->breakRecords ?? []
                );
                $breakSeconds = $this->calculateTotalBreakDuration($session->breakRecords ?? []);

                return [
                    'session_date' => \Carbon\Carbon::parse($session->session_date, 'UTC')
                        ->setTimezone($companyTimezone)
                        ->format('M d, Y'),
                    'clock_in' => \Carbon\Carbon::parse($session->clock_in_utc, 'UTC')
                        ->setTimezone($companyTimezone)
                        ->format('h:i A'),
                    'clock_out' => $session->clock_out_utc 
                        ? \Carbon\Carbon::parse($session->clock_out_utc, 'UTC')
                            ->setTimezone($companyTimezone)
                            ->format('h:i A')
                        : '—',
                    'work_duration' => $this->formatDuration($workSeconds),
                    'break_duration' => $this->formatDuration($breakSeconds),
                    'breaks_count' => ($session->breakRecords ? $session->breakRecords->count() : 0),
                    'status' => $session->status,
                    'raw_work_seconds' => $workSeconds,
                    'raw_break_seconds' => $breakSeconds,
                ];
            })->toArray();

            $userWorkSeconds = array_sum(array_column($userFormattedSessions, 'raw_work_seconds'));
            $userBreakSeconds = array_sum(array_column($userFormattedSessions, 'raw_break_seconds'));

            $individualPdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.clocking-records', [
                'user' => $user,
                'avatar_local_path' => $user->avatar_local_path ?? null,
                'sessions' => $userFormattedSessions,
                'filters' => $request->validated(),
                'companyTimezone' => $companyTimezone,
                'totals' => [
                    'records_count' => count($userFormattedSessions),
                    'work_duration' => $this->formatDuration($userWorkSeconds),
                    'break_duration' => $this->formatDuration($userBreakSeconds),
                ],
            ]);
            $individualPdf->setPaper('a4', 'portrait');
            $fileName = sprintf('%02d_%s_%d.pdf', $fileIndex++, $sanitizedName, $user->id);
            $individualPdf->save($tempDir . '/' . $fileName);
        }

        $zipFileName = 'clocking-export_all_' . now()->format('Y-m-d_H-i-s') . '.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \Exception('Could not create ZIP file');
        }

        foreach (scandir($tempDir) as $file) {
            if ($file !== '.' && $file !== '..') {
                $zip->addFile($tempDir . '/' . $file, $file);
            }
        }
        $zip->close();

        return response()->download($zipPath, $zipFileName, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="' . $zipFileName . '"',
        ])->deleteFileAfterSend(true);

    } catch (\Exception $e) {
        if ($tempDir && file_exists($tempDir)) {
            array_map('unlink', glob("$tempDir/*.*"));
            @rmdir($tempDir);
        }
        if ($zipPath && file_exists($zipPath)) {
            @unlink($zipPath);
        }
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    } finally {
        if ($tempDir) {
            register_shutdown_function(function () use ($tempDir) {
                if (file_exists($tempDir)) {
                    foreach (glob("$tempDir/*.*") as $file) {
                        @unlink($file);
                    }
                    @rmdir($tempDir);
                }
            });
        }
    }
}

// FIX: Correct break duration calculation
private function calculateWorkDuration($clockInUtc, $clockOutUtc, $breakRecords)
{
    if (!$clockOutUtc) {
        return 0;
    }

    $clockIn = $clockInUtc instanceof \DateTime ? $clockInUtc->getTimestamp() : strtotime($clockInUtc);
    $clockOut = $clockOutUtc instanceof \DateTime ? $clockOutUtc->getTimestamp() : strtotime($clockOutUtc);
    
    $totalSeconds = max(0, $clockOut - $clockIn);
    $breakSeconds = $this->calculateTotalBreakDuration($breakRecords);
    
    return max(0, $totalSeconds - $breakSeconds);
}

// FIX: Correct calculation - only count COMPLETED breaks
private function calculateTotalBreakDuration($breakRecords)
{
    $totalSeconds = 0;

    if (!$breakRecords || !is_iterable($breakRecords)) {
        return 0;
    }

    foreach ($breakRecords as $break) {
        // Only count completed breaks with both start and end
        if ($break->break_end_utc && $break->status === 'completed') {
            $start = $break->break_start_utc instanceof \DateTime 
                ? $break->break_start_utc->getTimestamp() 
                : strtotime($break->break_start_utc);
            $end = $break->break_end_utc instanceof \DateTime 
                ? $break->break_end_utc->getTimestamp() 
                : strtotime($break->break_end_utc);
            
            $totalSeconds += max(0, $end - $start);
        }
    }

    return $totalSeconds;
}

private function formatDuration($seconds)
{
    $seconds = (int)$seconds;
    $hours = floor($seconds / 3600);
    $minutes = floor(($seconds % 3600) / 60);
    $secs = $seconds % 60;

    return sprintf('%02d:%02d:%02d', $hours, $minutes, $secs);
}
}
