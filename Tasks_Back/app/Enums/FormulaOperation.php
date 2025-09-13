<?php

namespace App\Enums;

enum FormulaOperation: string
{
    case ADD = '+';
    case SUBTRACT = '-';
    case MULTIPLY = '*';
    case DIVIDE = '/';
    case POWER = '^';
    case MODULO = '%';

    public function getLabel(): string
    {
        return match($this) {
            self::ADD => 'Add',
            self::SUBTRACT => 'Subtract',
            self::MULTIPLY => 'Multiply',
            self::DIVIDE => 'Divide',
            self::POWER => 'Power',
            self::MODULO => 'Modulo',
        };
    }
}
