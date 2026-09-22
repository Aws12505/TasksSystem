<?php

namespace App\Http\Controllers\WorkSession;

use App\Exceptions\WorkSessionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkSession\ByTaskReportRequest;
use App\Http\Requests\WorkSession\ExportMonthlyPdfRequest;
use App\Http\Requests\WorkSession\OverviewReportRequest;
use App\Models\User;
use App\Models\UserMonthlyRating;
use App\Services\WorkSession\MonthlyRatingService;
use App\Services\WorkSession\WorkSessionReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use ZipArchive;

/**
 * Admin reports over work sessions: overview, by-task and monthly PDF export.
 * Route-level permission middleware gates access (see routes/api/work-sessions.php).
 */
class WorkSessionReportController extends Controller
{
    public function __construct(
        private readonly WorkSessionReportService $reports,
        private readonly MonthlyRatingService $ratings,
    ) {}

    /** GET /work-sessions/admin/reports/overview */
    public function overview(OverviewReportRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $data = $this->reports->overview(
                $validated['start_date'],
                $validated['end_date'],
                $validated['user_ids'] ?? [],
                $request->boolean('include_open'),
            );

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Overview report generated successfully',
            ]);
        } catch (WorkSessionException $e) {
            return response()->json(['success' => false, 'data' => null, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            Log::error('Failed to generate report', ['exception' => $e]);

            return response()->json(['success' => false, 'message' => 'Failed to generate report'], 500);
        }
    }

    /** GET /work-sessions/admin/reports/by-task */
    public function byTask(ByTaskReportRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $data = $this->reports->byTask(
                $validated['start_date'],
                $validated['end_date'],
                $validated['user_ids'] ?? [],
                $validated['group_by'] ?? 'task',
                $request->boolean('include_open'),
            );

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'By-task report generated successfully',
            ]);
        } catch (WorkSessionException $e) {
            return response()->json(['success' => false, 'data' => null, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            Log::error('Failed to generate report', ['exception' => $e]);

            return response()->json(['success' => false, 'message' => 'Failed to generate report'], 500);
        }
    }

    /**
     * POST /work-sessions/admin/reports/export-pdf
     *
     * Builds one overview PDF plus one PDF per selected user for the month,
     * zips them and streams the archive. Mirrors FinalRatingController::exportPdf.
     */
    public function exportPdf(ExportMonthlyPdfRequest $request)
    {
        $validated = $request->validated();

        $tempDir = null;
        $zipPath = null;

        try {
            $year = (int) $validated['year'];
            $month = (int) $validated['month'];
            $userIds = array_values(array_unique(array_map('intval', $validated['user_ids'])));

            $users = User::whereIn('id', $userIds)->orderBy('name')->get();
            if ($users->isEmpty()) {
                throw new WorkSessionException('No users selected');
            }

            $stats = $this->reports->monthlyStatsForUsers($year, $month, $users->pluck('id')->all());
            $ratings = UserMonthlyRating::where('year', $year)
                ->where('month', $month)
                ->whereIn('user_id', $users->pluck('id'))
                ->get()
                ->keyBy('user_id');

            $periodLabel = Carbon::createFromDate($year, $month, 1)->format('F Y');
            $generatedAt = now()->format('F d, Y');

            $overviewRows = $users->map(function (User $user) use ($stats, $ratings) {
                $rating = $ratings->get($user->id);

                return [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'email' => $user->email,
                    'stats' => $stats[$user->id] ?? $this->reports->emptyStats(),
                    'rating' => $rating ? $this->ratings->ratingPayload($rating) : null,
                ];
            })->values()->all();

            // Create temp directory with unique timestamp
            $tempDir = storage_path('app/temp/work-sessions-'.time().'-'.uniqid());
            if (! file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // 1) Overview PDF
            $overviewPdf = Pdf::loadView('pdf.work-session-monthly-overview', [
                'year' => $year,
                'month' => $month,
                'period_label' => $periodLabel,
                'generated_at' => $generatedAt,
                'rows' => $overviewRows,
            ]);
            $overviewPdf->setPaper('a4', 'portrait');
            $overviewPath = $tempDir.'/'.sprintf('00_Overview_%04d_%02d.pdf', $year, $month);
            $overviewPdf->save($overviewPath);

            // 2) Individual PDFs
            foreach ($users as $index => $user) {
                $detail = $this->reports->monthlyDetailForUser($user, $year, $month);
                $rating = $ratings->get($user->id);

                $individualPdf = Pdf::loadView('pdf.work-session-monthly', [
                    'detail' => $detail,
                    'rating' => $rating ? $this->ratings->ratingPayload($rating) : null,
                    'avatar_local_path' => $user->avatar_local_path,
                    'generated_at' => $generatedAt,
                ]);
                $individualPdf->setPaper('a4', 'portrait');

                $sanitizedName = preg_replace('/[^a-zA-Z0-9]/', '_', $user->name);
                $fileName = sprintf('%02d_%s.pdf', $index + 1, $sanitizedName);

                $individualPdf->save($tempDir.'/'.$fileName);
            }

            // 3) ZIP all PDFs
            $zipFileName = sprintf('work-sessions_%04d-%02d.zip', $year, $month);
            $zipPath = storage_path('app/temp/'.$zipFileName);

            $zip = new ZipArchive;
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \Exception('Could not create ZIP file');
            }

            foreach (scandir($tempDir) as $file) {
                if ($file !== '.' && $file !== '..') {
                    $zip->addFile($tempDir.'/'.$file, $file);
                }
            }
            $zip->close();

            if (! file_exists($zipPath)) {
                throw new \Exception('ZIP file was not created successfully');
            }

            return response()->download($zipPath, $zipFileName, [
                'Content-Type' => 'application/zip',
                'Content-Disposition' => 'attachment; filename="'.$zipFileName.'"',
            ])->deleteFileAfterSend(true);

        } catch (\Throwable $e) {
            if ($tempDir && file_exists($tempDir)) {
                array_map('unlink', glob("$tempDir/*.*"));
                @rmdir($tempDir);
            }
            if ($zipPath && file_exists($zipPath)) {
                @unlink($zipPath);
            }

            $isBusiness = $e instanceof WorkSessionException;
            if (! $isBusiness) {
                Log::error('Failed to export work session PDF', ['exception' => $e]);
            }

            return response()->json([
                'success' => false,
                'message' => $isBusiness ? $e->getMessage() : 'Failed to export work session PDF',
            ], $isBusiness ? 400 : 500);
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
}
