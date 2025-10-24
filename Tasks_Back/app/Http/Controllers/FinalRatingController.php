<?php

namespace App\Http\Controllers;

use App\Models\FinalRatingConfig;
use App\Services\FinalRating\FinalRatingCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use ZipArchive;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Models\TaskRating;
use Illuminate\Support\Facades\DB;
class FinalRatingController extends Controller
{
    private FinalRatingCalculator $calculator;

    public function __construct(FinalRatingCalculator $calculator)
    {
        $this->calculator = $calculator;
    }

    public function calculate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'max_points' => 'required|numeric|min:1',
            'config_id' => 'nullable|exists:final_rating_configs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $startDate = Carbon::parse($request->period_start)->startOfDay();
            $endDate = Carbon::parse($request->period_end)->endOfDay();
            $maxPoints = floatval($request->max_points);

            $config = $request->config_id 
                ? FinalRatingConfig::findOrFail($request->config_id) 
                : null;

            $result = $this->calculator->calculate(
                $startDate,
                $endDate,
                $maxPoints,
                $config,
                null
            );
// foreach ($result['users'] as &$u) {
//     $u['avatar_data_uri'] = $this->avatarToDataUri($u['avatar_url'] ?? null);
// }
// unset($u);
            return response()->json([
                'success' => true,
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function exportPdf(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period_start' => 'required|date',
            'period_end'   => 'required|date|after_or_equal:period_start',
            'max_points'   => 'required|numeric|min:1',
            'config_id'    => 'nullable|exists:final_rating_configs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $tempDir = null;
        $zipPath = null;

        try {
            $startDate = Carbon::parse($request->period_start)->startOfDay();
            $endDate   = Carbon::parse($request->period_end)->endOfDay();
            $maxPoints = (float) $request->max_points;

            $config = $request->config_id
                ? FinalRatingConfig::findOrFail($request->config_id)
                : null;

            $result = $this->calculator->calculate(
                $startDate,
                $endDate,
                $maxPoints,
                $config,
                null
            );

            // ---- Inject avatar_local_path for each user row ----
            // Prefer using the model's accessor (avatar_local_path).
            foreach ($result['users'] as &$u) {
                $userModel = null;

                // Try common id keys your calculator might output
                if (isset($u['user_id'])) {
                    $userModel = User::find($u['user_id']);
                } elseif (isset($u['id'])) {
                    $userModel = User::find($u['id']);
                } elseif (isset($u['user']['id'])) {
                    $userModel = User::find($u['user']['id']);
                }

                if ($userModel) {
                    // Uses the model method you added (accessor)
                    // getAvatarLocalPathAttribute() => $userModel->avatar_local_path
                    $u['avatar_local_path'] = $userModel->avatar_local_path;
                } else {
                    // Fallback: resolve from array's avatar_path string (if present)
                    $u['avatar_local_path'] = $this->resolveAvatarLocalPathFromArray($u['avatar_path'] ?? null);
                }
            }
            unset($u);
            // ----------------------------------------------------

            // Create temp directory with unique timestamp
            $tempDir = storage_path('app/temp/final-ratings-' . time() . '-' . uniqid());
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // 1) Overview PDF
            $overviewPdf = Pdf::loadView('pdf.final-ratings-overview', ['data' => $result]);
            $overviewPdf->setPaper('a4', 'portrait');
            $overviewPath = $tempDir . '/00_Overview_All_Employees.pdf';
            $overviewPdf->save($overviewPath);

            // 2) Individual PDFs
            foreach ($result['users'] as $index => $user) {
                $individualPdf = Pdf::loadView('pdf.final-ratings-individual', [
                    'user'       => $user,
                    'period'     => $result['period'],
                    'config'     => $result['config'],
                    'max_points' => $result['max_points_for_100_percent'],
                ]);
                $individualPdf->setPaper('a4', 'portrait');

                $sanitizedName = preg_replace('/[^a-zA-Z0-9]/', '_', $user['user_name']);
                $fileName = sprintf('%02d_%s_%.2f_percent.pdf',
                    $index + 1,
                    $sanitizedName,
                    $user['final_percentage']
                );

                $individualPdf->save($tempDir . '/' . $fileName);
            }

            // 3) ZIP all PDFs
            $zipFileName = 'final-ratings_' . $result['period']['start'] . '_to_' . $result['period']['end'] . '.zip';
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

            if (!file_exists($zipPath)) {
                throw new \Exception('ZIP file was not created successfully');
            }

            return response()->download($zipPath, $zipFileName, [
                'Content-Type'        => 'application/zip',
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

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
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
     * Fallback resolver if we only have a stored avatar_path string in the array,
     * and not a User model instance.
     */
    private function resolveAvatarLocalPathFromArray(?string $avatarPath): ?string
    {
        if (!$avatarPath) {
            return null;
        }

        // If you store avatars on the `public` disk:
        // storage/app/public/<avatarPath>
        $full = Storage::disk('public')->path($avatarPath);
        return file_exists($full) ? $full : null;

        // If you store directly under public/:
        // $full = public_path($avatarPath);
        // return file_exists($full) ? $full : null;
    }
    public function index()
    {
        $configs = FinalRatingConfig::orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $configs,
        ], 200);
    }

    public function show(int $id)
    {
        $config = FinalRatingConfig::find($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Config not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $config,
        ], 200);
    }

    public function getActive()
    {
        $config = FinalRatingConfig::getActive();

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'No active configuration found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $config,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'config' => 'required|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $config = FinalRatingConfig::create([
                'name' => $request->name,
                'description' => $request->description,
                'config' => $request->config,
                'is_active' => false,
            ]);

            if ($request->is_active) {
                $config->activate();
            }

            return response()->json([
                'success' => true,
                'data' => $config,
                'message' => 'Configuration created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $id)
    {
        $config = FinalRatingConfig::find($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Config not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'config' => 'sometimes|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $config->update($request->only(['name', 'description', 'config']));

            if ($request->has('is_active') && $request->is_active) {
                $config->activate();
            }

            return response()->json([
                'success' => true,
                'data' => $config->fresh(),
                'message' => 'Configuration updated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id)
    {
        $config = FinalRatingConfig::find($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Config not found',
            ], 404);
        }

        if ($config->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete active configuration. Please activate another configuration first.',
            ], 400);
        }

        try {
            $config->delete();

            return response()->json([
                'success' => true,
                'message' => 'Configuration deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function activate(int $id)
    {
        $config = FinalRatingConfig::find($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Config not found',
            ], 404);
        }

        try {
            $config->activate();

            return response()->json([
                'success' => true,
                'data' => $config->fresh(),
                'message' => 'Configuration activated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getDefaultStructure()
    {
        return response()->json([
            'success' => true,
            'data' => FinalRatingConfig::defaultConfig(),
        ], 200);
    }


    public function calculateWeightedRatingsSOS(Request $request)
{
    $validated = $request->validate([
        'user_ids' => 'required|array',
        'user_ids.*' => 'required|integer|exists:users,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    $userIds = $validated['user_ids'];
    $startDate = Carbon::parse($validated['start_date'])->startOfDay();
    $endDate = Carbon::parse($validated['end_date'])->endOfDay();

    // Get latest rating for each task in date range
    $latestRatings = TaskRating::select('task_ratings.*')
        ->whereBetween('task_ratings.created_at', [$startDate, $endDate])
        ->whereIn('task_ratings.id', function ($query) use ($startDate, $endDate) {
            $query->select(DB::raw('MAX(id)'))
                ->from('task_ratings')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('task_id');
        })
        ->get();

    $results = [];

    foreach ($userIds as $userId) {
        $totalWeightedRating = 0;
        $totalPercentage = 0;

        foreach ($latestRatings as $rating) {
            $taskUserPivot = DB::table('task_user')
                ->where('task_id', $rating->task_id)
                ->where('user_id', $userId)
                ->first();

            if ($taskUserPivot && $taskUserPivot->percentage > 0) {
                $percentage = $taskUserPivot->percentage;
                // Rating is already out of 100, so just weight it by percentage
                $totalWeightedRating += ($rating->final_rating * $percentage);
                $totalPercentage += $percentage;
            }
        }

        // Calculate weighted average - ALREADY out of 100
        $ratingOutOf100 = null;
        if ($totalPercentage > 0) {
            $ratingOutOf100 = round($totalWeightedRating / $totalPercentage, 2);
        }

        $user = User::find($userId);

        $results[] = [
            'user_name' => $user->name,
            'rating' => $ratingOutOf100
        ];
    }

    return response()->json($results);
}
}
