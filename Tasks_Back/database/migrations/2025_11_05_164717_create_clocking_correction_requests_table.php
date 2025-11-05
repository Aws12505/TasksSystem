<?php
// database/migrations/2025_01_20_create_clocking_correction_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clocking_correction_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('clock_session_id')->nullable()->constrained('clock_sessions')->onDelete('cascade');
            $table->foreignId('break_record_id')->nullable()->constrained('break_records')->onDelete('cascade');
            
            $table->enum('correction_type', ['clock_in', 'clock_out', 'break_in', 'break_out']);
            $table->timestamp('original_time_utc');
            $table->timestamp('requested_time_utc');
            $table->text('reason');
            
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clocking_correction_requests');
    }
};
