<?php

namespace App\Services;

use App\Models\Section;
use Illuminate\Pagination\LengthAwarePaginator;

class SectionService
{
    public function getAllSections(int $perPage = 15): LengthAwarePaginator
    {
        return Section::with('project')->latest()->paginate($perPage);
    }

    public function getSectionById(int $id)
    {
        return Section::with('project')->find($id);
    }

    public function createSection(array $data): Section
    {
        return Section::create($data)->load('project');
    }

    public function updateSection(int $id, array $data): ?Section
    {
        $section = Section::find($id);
        
        if (!$section) {
            return null;
        }

        $section->update($data);
        return $section->fresh(['project']);
    }

    public function deleteSection(int $id): bool
    {
        $section = Section::find($id);
        
        if (!$section) {
            return false;
        }

        return $section->delete();
    }

    // Get sections by project
    public function getSectionsByProject(int $projectId, int $perPage = 15): LengthAwarePaginator
    {
        return Section::where('project_id', $projectId)->latest()->paginate($perPage);
    }
}
