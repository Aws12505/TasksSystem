<?php

namespace Database\Seeders;

use App\Models\FinalRatingConfig;
use Illuminate\Database\Seeder;

class FinalRatingConfigSeeder extends Seeder
{
    public function run(): void
    {
        FinalRatingConfig::create([
            'name' => 'Default Configuration',
            'description' => 'Standard rating configuration with all components enabled',
            'is_active' => true,
            'config' => FinalRatingConfig::defaultConfig(),
        ]);
    }
}
