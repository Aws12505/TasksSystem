<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectService
{
    public function getAllProjects(int $perPage = 15): LengthAwarePaginator
    {
        return Project::with('stakeholder')->latest()->paginate($perPage);
    }

    public function getProjectById(int $id)
    {
        return Project::with('stakeholder')->find($id);
    }

    public function createProject(array $data): Project
    {
        return Project::create($data)->load('stakeholder');
    }

    public function updateProject(int $id, array $data): ?Project
    {
        $project = Project::find($id);
        
        if (!$project) {
            return null;
        }

        // Remove stakeholder_id from data to prevent editing
        unset($data['stakeholder_id']);
        
        $project->update($data);
        return $project->fresh(['stakeholder']);
    }

    public function deleteProject(int $id): bool
    {
        $project = Project::find($id);
        
        if (!$project) {
            return false;
        }

        return $project->delete();
    }
}
