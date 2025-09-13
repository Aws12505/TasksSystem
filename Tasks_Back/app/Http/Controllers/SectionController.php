<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSectionRequest;
use App\Http\Requests\UpdateSectionRequest;
use App\Services\SectionService;
use Illuminate\Http\JsonResponse;

class SectionController extends Controller
{
    public function __construct(
        private SectionService $sectionService
    ) {}

    public function index(): JsonResponse
    {
        $sections = $this->sectionService->getAllSections();

        return response()->json([
            'success' => true,
            'data' => $sections->items(),
            'pagination' => [
                'current_page' => $sections->currentPage(),
                'total' => $sections->total(),
                'per_page' => $sections->perPage(),
                'last_page' => $sections->lastPage(),
                'from' => $sections->firstItem(),
                'to' => $sections->lastItem(),
            ],
            'message' => 'Sections retrieved successfully',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $section = $this->sectionService->getSectionById($id);

        if (!$section) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Section not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $section,
            'message' => 'Section retrieved successfully',
        ]);
    }

    public function store(StoreSectionRequest $request): JsonResponse
    {
        $section = $this->sectionService->createSection($request->validated());

        return response()->json([
            'success' => true,
            'data' => $section,
            'message' => 'Section created successfully',
        ], 201);
    }

    public function update(UpdateSectionRequest $request, int $id): JsonResponse
    {
        $section = $this->sectionService->updateSection($id, $request->validated());

        if (!$section) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Section not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $section,
            'message' => 'Section updated successfully',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->sectionService->deleteSection($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Section not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Section deleted successfully',
        ]);
    }

    public function getByProject(int $projectId): JsonResponse
    {
        $sections = $this->sectionService->getSectionsByProject($projectId);

        return response()->json([
            'success' => true,
            'data' => $sections->items(),
            'pagination' => [
                'current_page' => $sections->currentPage(),
                'total' => $sections->total(),
                'per_page' => $sections->perPage(),
                'last_page' => $sections->lastPage(),
                'from' => $sections->firstItem(),
                'to' => $sections->lastItem(),
            ],
            'message' => 'Project sections retrieved successfully',
        ]);
    }
}
