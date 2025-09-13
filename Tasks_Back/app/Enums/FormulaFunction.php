<?php

namespace App\Enums;

enum FormulaFunction: string
{
    case SUM = 'sum';
    case AVERAGE = 'avg';
    case COUNT = 'count';
    case MIN = 'min';
    case MAX = 'max';
    case SQRT = 'sqrt';
    case ABS = 'abs';

    public function getLabel(): string
    {
        return match($this) {
            self::SUM => 'Sum',
            self::AVERAGE => 'Average',
            self::COUNT => 'Count',
            self::MIN => 'Minimum',
            self::MAX => 'Maximum',
            self::SQRT => 'Square Root',
            self::ABS => 'Absolute Value',
        };
    }
}
