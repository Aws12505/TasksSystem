<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        $userId = $request->input('user_id');
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : null;

        $data = $this->analyticsService->getDashboardSummary($userId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Dashboard analytics retrieved successfully',
        ]);
    }

    public function report(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $data = $this->analyticsService->getComprehensiveReport($filters);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Comprehensive analytics report generated successfully',
        ]);
    }

    public function userAnalytics(Request $request, int $userId): JsonResponse
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : null;

        $data = $this->analyticsService->userAnalytics->getUserPerformanceOverview($userId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'User analytics retrieved successfully',
        ]);
    }

    public function projectAnalytics(Request $request, int $projectId): JsonResponse
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : null;

        $data = $this->analyticsService->projectAnalytics->getDetailedProjectAnalytics($projectId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Project analytics retrieved successfully',
        ]);
    }

    public function topPerformers(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : null;
        $limit = $request->input('limit', 10);

        $data = $this->analyticsService->userAnalytics->getTopPerformers($startDate, $endDate, $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Top performers retrieved successfully',
        ]);
    }

    public function systemStats(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : null;

        $data = $this->analyticsService->systemAnalytics->getSystemOverview($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'System analytics retrieved successfully',
        ]);
    }

    public function exportReport(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
            'format' => 'nullable|in:json,csv,excel',
        ]);

        $data = $this->analyticsService->getComprehensiveReport($filters);
        $format = $filters['format'] ?? 'json';

        // You can implement different export formats here
        switch ($format) {
            case 'csv':
                // Convert to CSV format
                break;
            case 'excel':
                // Convert to Excel format
                break;
            default:
                // Return JSON
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'format' => $format,
            'message' => 'Analytics report exported successfully',
        ]);
    }
}
