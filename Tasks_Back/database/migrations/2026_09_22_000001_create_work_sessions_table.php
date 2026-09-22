<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Calendar day in the company timezone (config('app.company_timezone'))
            $table->date('work_date');
            $table->enum('status', ['open', 'confirmed'])->default('open');
            $table->timestamp('started_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('reopened_at')->nullable();
            $table->foreignId('reopened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('summary_note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'work_date'], 'uq_work_sessions_user_date');
            $table->index('work_date', 'idx_work_sessions_date');
            $table->index(['status', 'work_date'], 'idx_work_sessions_status_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_sessions');
    }
};
