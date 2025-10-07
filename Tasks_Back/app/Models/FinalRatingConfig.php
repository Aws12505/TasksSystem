<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinalRatingConfig extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_active', 'config'];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function getActive(): ?self
    {
        return self::where('is_active', true)->first();
    }

    public function activate(): void
    {
        self::where('is_active', true)->update(['is_active' => false]);
        $this->update(['is_active' => true]);
    }

    public static function defaultConfig(): array
    {
        return [
            'task_ratings' => [
                'enabled' => true,
                'include_task_weight' => true,
                'include_user_percentage' => true,
                'aggregation' => 'sum'
            ],
            'stakeholder_ratings' => [
                'enabled' => true,
                'include_project_percentage' => true,
                'include_task_weight' => true,
                'aggregation' => 'sum'
            ],
            'help_requests_helper' => [
                'enabled' => true,
                'points_per_help' => 5,
                'max_points' => 20
            ],
            'help_requests_requester' => [
                'enabled' => true,
                'penalties' => [
                    'basic_skill_gap' => -2,
                    'fixing_own_mistakes' => -5,
                    'clarification' => -1,
                    'other' => -3,
                ]
            ],
            'tickets_resolved' => [
                'enabled' => false,
                'points_per_ticket' => 3,
                'max_points' => 15
            ]
        ];
    }
}
