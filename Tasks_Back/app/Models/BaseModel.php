<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DateTimeInterface;

abstract class BaseModel extends Model
{
    /**
     * Force all date-like attributes to JSON as local-midnight string
     * Example: 2025-10-07T00:00:00   (no timezone)
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d\T00:00:00');
    }
}
