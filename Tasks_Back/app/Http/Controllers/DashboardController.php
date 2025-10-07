<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    private DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get employee dashboard data
     * GET /api/dashboard/employee
     */
    public function getEmployeeDashboard(Request $request)
    {
        try {
            $userId = Auth::id();
            $data = $this->dashboardService->getEmployeeDashboard($userId);

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get manager analytics dashboard
     * GET /api/dashboard/analytics?period=today
     * Requires: view analytics permission
     */
    public function getManagerAnalytics(Request $request)
    {
        // Check permission
        if (!$request->user()->can('view analytics')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You need view analytics permission.',
            ], 403);
        }

        try {
            $period = $request->get('period', 'today');
            
            // Validate period
            $validPeriods = ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'month_to_date'];
            if (!in_array($period, $validPeriods)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid period. Valid periods: ' . implode(', ', $validPeriods),
                ], 400);
            }

            $data = $this->dashboardService->getManagerAnalytics($period);

            return response()->json([
                'success' => true,
                'data' => $data,
                'period' => $period,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
