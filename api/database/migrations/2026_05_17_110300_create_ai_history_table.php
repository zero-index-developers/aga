<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repository_id')->nullable()->constrained('repositories')->nullOnDelete();
            $table->string('repo_name');
            $table->text('prompt');
            $table->longText('response');
            $table->timestamp('recorded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_history');
    }
};
