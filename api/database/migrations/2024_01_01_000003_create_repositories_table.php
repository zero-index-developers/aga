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
        Schema::create('repositories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('full_name')->unique();
            $table->string('owner');
            $table->text('description')->nullable();
            $table->string('url');
            $table->string('clone_url');
            $table->string('default_branch')->default('main');
            $table->string('language')->nullable();
            $table->string('local_path')->nullable();
            $table->enum('status', ['pending', 'cloning', 'analyzing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('last_scanned_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('status');
            $table->index('owner');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repositories');
    }
};

// Made with Bob
