<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE tickets MODIFY COLUMN type ENUM('quick_fix', 'bug_investigation', 'user_support', 'suggestion') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tickets MODIFY COLUMN type ENUM('quick_fix', 'bug_investigation', 'user_support') NOT NULL");
    }
};
