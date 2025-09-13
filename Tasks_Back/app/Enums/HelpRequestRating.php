<?php

namespace App\Enums;

enum HelpRequestRating: string
{
    case LEGITIMATE_LEARNING = 'legitimate_learning';     // 0.1x penalty
    case BASIC_SKILL_GAP = 'basic_skill_gap';            // 0.3x penalty  
    case CARELESS_MISTAKE = 'careless_mistake';          // 0.6x penalty
    case FIXING_OWN_MISTAKES = 'fixing_own_mistakes';    // 0.8x penalty

    public function getPenaltyMultiplier(): float
    {
        return match($this) {
            self::LEGITIMATE_LEARNING => 0.1,
            self::BASIC_SKILL_GAP => 0.3,
            self::CARELESS_MISTAKE => 0.6,
            self::FIXING_OWN_MISTAKES => 0.8,
        };
    }

    public function getLabel(): string
    {
        return match($this) {
            self::LEGITIMATE_LEARNING => 'Legitimate Learning',
            self::BASIC_SKILL_GAP => 'Basic Skill Gap',
            self::CARELESS_MISTAKE => 'Careless Mistake',
            self::FIXING_OWN_MISTAKES => 'Fixing Own Mistakes',
        };
    }
}
