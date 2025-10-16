<?php
// database/migrations/2025_10_16_125600_remove_duration_columns_from_clocking_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clock_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'total_work_minutes',
                'total_break_minutes',
            ]);
        });

        Schema::table('break_records', function (Blueprint $table) {
            $table->dropColumn('duration_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('clock_sessions', function (Blueprint $table) {
            $table->integer('total_work_minutes')->default(0);
            $table->integer('total_break_minutes')->default(0);
        });

        Schema::table('break_records', function (Blueprint $table) {
            $table->integer('duration_minutes')->default(0);
        });
    }
};
