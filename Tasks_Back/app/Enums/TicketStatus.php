<?php

namespace App\Enums;

enum TicketStatus: string
{
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case RESOLVED = 'resolved';

    public function getLabel(): string
    {
        return match($this) {
            self::OPEN => 'Open',
            self::IN_PROGRESS => 'In Progress',
            self::RESOLVED => 'Resolved',
        };
    }

    public function getColor(): string
    {
        return match($this) {
            self::OPEN => 'red',
            self::IN_PROGRESS => 'yellow',
            self::RESOLVED => 'green',
        };
    }
}
