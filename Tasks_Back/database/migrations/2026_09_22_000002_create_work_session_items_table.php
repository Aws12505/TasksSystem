<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_session_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_session_id')->constrained('work_sessions')->cascadeOnDelete();
            // Optional link to an existing project task; history is kept if the task is deleted
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->unsignedSmallInteger('estimated_minutes')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->enum('outcome', ['pending', 'done', 'partial', 'not_done'])->default('pending');
            $table->text('outcome_note')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('carried_from_item_id')->nullable()->constrained('work_session_items')->nullOnDelete();
            $table->timestamps();

            $table->index(['work_session_id', 'sort_order'], 'idx_wsi_session_sort');
            $table->index('task_id', 'idx_wsi_task');
            $table->index('outcome', 'idx_wsi_outcome');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_session_items');
    }
};
