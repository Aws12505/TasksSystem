<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRatingConfigRequest;
use App\Http\Requests\UpdateRatingConfigRequest;
use App\Services\RatingConfigService;
use App\Enums\RatingConfigType;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
class RatingConfigController extends Controller
{
    public function __construct(
        private RatingConfigService $ratingConfigService
    ) {}

    public function index(): JsonResponse
    {
        $configs = $this->ratingConfigService->getAllConfigs();

        return response()->json([
            'success' => true,
            'data' => $configs->items(),
            'pagination' => [
                'current_page' => $configs->currentPage(),
                'total' => $configs->total(),
                'per_page' => $configs->perPage(),
                'last_page' => $configs->lastPage(),
                'from' => $configs->firstItem(),
                'to' => $configs->lastItem(),
            ],
            'message' => 'Rating configs retrieved successfully',
        ]);
    }

    public function store(StoreRatingConfigRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        
        $config = $this->ratingConfigService->createConfig($data);

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Rating config created successfully',
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $config = $this->ratingConfigService->getConfigById($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Rating config not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Rating config retrieved successfully',
        ]);
    }

    public function update(UpdateRatingConfigRequest $request, int $id): JsonResponse
    {
        $config = $this->ratingConfigService->updateConfig($id, $request->validated());

        if (!$config) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Rating config not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Rating config updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->ratingConfigService->deleteConfig($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Rating config not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Rating config deleted successfully',
        ]);
    }

    public function activate(int $id): JsonResponse
    {
        $config = $this->ratingConfigService->activateConfig($id);

        if (!$config) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Rating config not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $config,
            'message' => 'Rating config activated successfully',
        ]);
    }

    public function getByType(string $type): JsonResponse
    {
        $configType = RatingConfigType::tryFrom($type);
        
        if (!$configType) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Invalid config type',
            ], 400);
        }

        $configs = $this->ratingConfigService->getConfigsByType($configType);

        return response()->json([
            'success' => true,
            'data' => $configs->items(),
            'pagination' => [
                'current_page' => $configs->currentPage(),
                'total' => $configs->total(),
                'per_page' => $configs->perPage(),
                'last_page' => $configs->lastPage(),
                'from' => $configs->firstItem(),
                'to' => $configs->lastItem(),
            ],
            'message' => 'Rating configs retrieved successfully',
        ]);
    }
}
