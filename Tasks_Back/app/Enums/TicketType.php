<?php

namespace App\Enums;

enum TicketType: string
{
    case QUICK_FIX = 'quick_fix';
    case BUG_INVESTIGATION = 'bug_investigation';
    case USER_SUPPORT = 'user_support';

    public function getLabel(): string
    {
        return match($this) {
            self::QUICK_FIX => 'Quick Fix',
            self::BUG_INVESTIGATION => 'Bug Investigation',
            self::USER_SUPPORT => 'User Support',
        };
    }

    public function getEstimatedTime(): string
    {
        return match($this) {
            self::QUICK_FIX => '1-2 hours',
            self::BUG_INVESTIGATION => '4-8 hours',
            self::USER_SUPPORT => '30 minutes - 2 hours',
        };
    }
}
