<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('final_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('period_start'); // e.g., 2025-01-25
            $table->date('period_end');   // e.g., 2025-02-25
            $table->decimal('final_rating', 5, 2); // Out of 100% (for bonus calculation)
            $table->json('calculation_steps'); // Detailed formula execution steps
            $table->json('variables_used'); // Variable values at calculation time
            $table->json('config_snapshot'); // Formula config used
            $table->timestamp('calculated_at');
            $table->timestamps();

            $table->unique(['user_id', 'period_start', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_ratings');
    }
};
