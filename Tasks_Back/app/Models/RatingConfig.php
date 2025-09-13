<?php

namespace App\Models;

use App\Enums\RatingConfigType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RatingConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'config_data',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'type' => RatingConfigType::class,
        'config_data' => 'array',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function getActiveByType(RatingConfigType $type): ?self
    {
        return self::where('type', $type)
                   ->where('is_active', true)
                   ->latest()
                   ->first();
    }

    // Get fields for task/stakeholder configs
    public function getFields(): array
    {
        return $this->config_data['fields'] ?? [];
    }

    // Get formula expression for final rating config
    public function getFormulaExpression(): string
    {
        return $this->config_data['expression'] ?? '';
    }

    // Get variable definitions for final rating config
    public function getVariableDefinitions(): array
    {
        return $this->config_data['variables'] ?? [];
    }
}
