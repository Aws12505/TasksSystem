<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_monthly_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month'); // 1..12
            $table->decimal('score', 5, 2);       // 0.00 .. 100.00
            $table->text('comment')->nullable();
            $table->foreignId('rated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'year', 'month'], 'uq_umr_user_year_month');
            $table->index(['year', 'month'], 'idx_umr_year_month');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_monthly_ratings');
    }
};
