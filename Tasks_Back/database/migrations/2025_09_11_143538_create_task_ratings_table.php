<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('rater_id')->constrained('users')->onDelete('cascade');
            $table->json('rating_data'); // {"Code Cleanliness": 45, "Collaboration": 35}
            $table->decimal('final_rating', 5, 2); // Out of 100%
            $table->json('config_snapshot'); // Config used at time of rating
            $table->timestamp('rated_at');
            $table->timestamps();

            $table->unique(['task_id', 'rater_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_ratings');
    }
};
