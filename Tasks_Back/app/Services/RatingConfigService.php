<?php

namespace App\Services;

use App\Models\RatingConfig;
use App\Enums\RatingConfigType;
use Illuminate\Pagination\LengthAwarePaginator;

class RatingConfigService
{
    public function getAllConfigs(int $perPage = 15): LengthAwarePaginator
    {
        return RatingConfig::with('creator')->latest()->paginate($perPage);
    }

    public function getConfigById(int $id): ?RatingConfig
    {
        return RatingConfig::with('creator')->find($id);
    }

    public function createConfig(array $data): RatingConfig
    {
        return RatingConfig::create($data)->load('creator');
    }

    public function updateConfig(int $id, array $data): ?RatingConfig
    {
        $config = RatingConfig::find($id);
        
        if (!$config) {
            return null;
        }

        $config->update($data);
        return $config->fresh(['creator']);
    }

    public function deleteConfig(int $id): bool
    {
        $config = RatingConfig::find($id);
        return $config?->delete() ?? false;
    }

    public function getConfigsByType(RatingConfigType $type): LengthAwarePaginator
    {
        return RatingConfig::where('type', $type)
                          ->with('creator')
                          ->latest()
                          ->paginate(15);
    }

    public function getActiveConfigsByType(RatingConfigType $type)
    {
        return RatingConfig::getActiveConfigsByType($type);
    }

    public function activateConfig(int $id): ?RatingConfig
    {
        $config = RatingConfig::find($id);
        
        if (!$config) {
            return null;
        }

        $config->update(['is_active' => true]);
        
        return $config->fresh(['creator']);
    }
}
