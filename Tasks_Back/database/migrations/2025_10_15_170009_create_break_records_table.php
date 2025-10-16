<?php
// database/migrations/2024_10_15_000002_create_break_records_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('break_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clock_session_id')
                  ->constrained('clock_sessions')
                  ->onDelete('cascade');
            $table->timestamp('break_start_utc');
            $table->timestamp('break_end_utc')->nullable();
            $table->text('description')->nullable();
            $table->integer('duration_minutes')->default(0);
            $table->enum('status', ['active', 'completed'])->default('active');
            $table->timestamps();

            $table->index('clock_session_id', 'idx_break_records_session');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('break_records');
    }
};
