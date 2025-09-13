<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stakeholder_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('stakeholder_id')->constrained('users')->onDelete('cascade');
            $table->json('rating_data'); // {"Overall Quality": 80, "Timeline": 70}
            $table->decimal('final_rating', 5, 2); // Out of 100%
            $table->json('config_snapshot'); // Config used at time of rating
            $table->timestamp('rated_at');
            $table->timestamps();

            $table->unique(['project_id', 'stakeholder_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stakeholder_ratings');
    }
};
