<?php

namespace App\Services;

use App\Models\Workspace;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;

class WorkspaceService
{
    public function getAll(): Collection
    {
        return Auth::user()
            ->workspaces()
            ->latest()
            ->get();
    }

    public function create(array $data): Workspace
    {
        return DB::transaction(function () use ($data) {

            $workspace = Workspace::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            Auth::user()->workspaces()->attach($workspace->id, [
                'role' => 'owner',
            ]);

            return $workspace;
        });
    }

    public function update(Workspace $workspace, array $data): Workspace
    {
        $workspace->update($data);
        return $workspace;
    }

    public function delete(Workspace $workspace): void
    {
        $workspace->delete();
    }
}
