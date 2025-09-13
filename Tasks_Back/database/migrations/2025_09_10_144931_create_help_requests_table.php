<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('help_requests', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('helper_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->enum('rating', [
                'legitimate_learning',
                'basic_skill_gap', 
                'careless_mistake',
                'fixing_own_mistakes'
            ])->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('help_requests');
    }
};
