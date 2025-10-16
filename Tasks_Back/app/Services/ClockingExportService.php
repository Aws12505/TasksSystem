<?php
// app/Services/ClockingExportService.php

namespace App\Services;

use App\Models\ClockSession;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class ClockingExportService
{
    /**
     * Export user's records to PDF
     */
    public function exportUserRecordsPDF(User $user, array $filters = []): string
    {
        $query = ClockSession::forUser($user->id)
            ->with(['breakRecords']);

        // Apply filters
        if (!empty($filters['start_date'])) {
            $query->where('session_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('session_date', '<=', $filters['end_date']);
        }

        $sessions = $query->orderBy('session_date', 'desc')
                          ->orderBy('clock_in_utc', 'desc')
                          ->get();

        $data = [
            'user' => $user,
            'sessions' => $sessions,
            'filters' => $filters,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        $pdf = Pdf::loadView('pdf.clocking-records', $data);

        $filename = 'clocking-records-' . $user->id . '-' . now()->timestamp . '.pdf';
        $path = 'exports/' . $filename;

        Storage::put($path, $pdf->output());

        return $path;
    }

    /**
     * Export all records to ZIP (overview + individual PDFs)
     */
    public function exportAllRecordsZIP(array $filters = []): string
    {
        $query = ClockSession::withoutGlobalScope('user_scope')
            ->with(['user', 'breakRecords']);

        // Apply filters
        if (!empty($filters['start_date'])) {
            $query->where('session_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->where('session_date', '<=', $filters['end_date']);
        }

        $sessions = $query->orderBy('session_date', 'desc')
                          ->orderBy('clock_in_utc', 'desc')
                          ->get();

        // Group by user
        $sessionsByUser = $sessions->groupBy('user_id');

        // Create temporary directory
        $tempDir = storage_path('app/temp/' . uniqid());
        mkdir($tempDir, 0755, true);

        // Generate overview PDF
        $overviewData = [
            'sessions' => $sessions,
            'filters' => $filters,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        $overviewPdf = Pdf::loadView('pdf.clocking-overview', $overviewData);
        file_put_contents($tempDir . '/overview.pdf', $overviewPdf->output());

        // Generate individual PDFs
        foreach ($sessionsByUser as $userId => $userSessions) {
            $user = $userSessions->first()->user;

            $userData = [
                'user' => $user,
                'sessions' => $userSessions,
                'filters' => $filters,
                'generated_at' => now()->format('Y-m-d H:i:s'),
            ];

            $userPdf = Pdf::loadView('pdf.clocking-records', $userData);
            
            $safeUserName = preg_replace('/[^A-Za-z0-9\-]/', '_', $user->name);
            file_put_contents(
                $tempDir . '/' . $safeUserName . '_' . $userId . '.pdf',
                $userPdf->output()
            );
        }

        // Create ZIP
        $zipFilename = 'clocking-export-' . now()->timestamp . '.zip';
        $zipPath = storage_path('app/exports/' . $zipFilename);

        if (!file_exists(storage_path('app/exports'))) {
            mkdir(storage_path('app/exports'), 0755, true);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            $files = scandir($tempDir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    $zip->addFile($tempDir . '/' . $file, $file);
                }
            }
            $zip->close();
        }

        // Clean up temp directory
        array_map('unlink', glob("$tempDir/*.*"));
        rmdir($tempDir);

        return 'exports/' . $zipFilename;
    }
}
