<?php
// app/Http/Controllers/ClockingController.php

namespace App\Http\Controllers;

use App\Http\Requests\EndBreakRequest;
use App\Http\Requests\GetRecordsRequest;
use App\Http\Requests\ExportClockingsRequest;
use App\Services\ClockingService;
use App\Services\ClockingExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClockingController extends Controller
{
    public function __construct(
        private ClockingService $clockingService,
        private ClockingExportService $exportService
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
     * Export user's records
     */
    public function exportRecords(ExportClockingsRequest $request): JsonResponse
    {
        $path = $this->exportService->exportUserRecordsPDF(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'data' => [
                'download_url' => Storage::url($path),
                'path' => $path,
            ],
            'message' => 'Export generated successfully',
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

    /**
     * Export all records
     */
    public function exportAllRecords(ExportClockingsRequest $request): JsonResponse
    {
        $path = $this->exportService->exportAllRecordsZIP($request->validated());

        return response()->json([
            'success' => true,
            'data' => [
                'download_url' => Storage::url($path),
                'path' => $path,
            ],
            'message' => 'Export generated successfully',
        ]);
    }
}
