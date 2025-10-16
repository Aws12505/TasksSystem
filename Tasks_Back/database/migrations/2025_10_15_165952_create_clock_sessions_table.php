<?php
// database/migrations/2024_10_15_000001_create_clock_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clock_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('clock_in_utc');
            $table->timestamp('clock_out_utc')->nullable();
            $table->date('session_date');
            $table->integer('total_work_minutes')->default(0);
            $table->integer('total_break_minutes')->default(0);
            $table->enum('status', ['active', 'on_break', 'completed'])->default('active');
            $table->boolean('crosses_midnight')->default(false);
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'status'], 'idx_clock_sessions_user_status');
            $table->index('session_date', 'idx_clock_sessions_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clock_sessions');
    }
};
