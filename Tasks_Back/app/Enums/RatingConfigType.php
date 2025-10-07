<?php

namespace App\Enums;

enum RatingConfigType: string
{
    case TASK_RATING = 'task_rating';
    case STAKEHOLDER_RATING = 'stakeholder_rating';

    public function getLabel(): string
    {
        return match($this) {
            self::TASK_RATING => 'Task Rating Fields',
            self::STAKEHOLDER_RATING => 'Stakeholder Rating Fields',
        };
    }
}
