<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // make requester_id nullable
            $table->foreignId('requester_id')
                ->nullable()
                ->change();

            // add requester_name after requester_id
            $table->string('requester_name')->nullable()->after('requester_id');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('requester_name');

            // revert requester_id to NOT NULL
            $table->foreignId('requester_id')
                ->nullable(false)
                ->change();
        });
    }
};
