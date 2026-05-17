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
        Schema::create('ai_cache', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repository_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('query_hash')->unique(); // Hash of the query for fast lookup
            $table->text('query'); // The original query
            $table->text('context')->nullable(); // Context provided to AI
            $table->longText('response'); // AI response
            $table->json('highlighted_nodes')->nullable(); // Node IDs to highlight
            $table->string('model')->nullable(); // AI model used
            $table->integer('tokens_used')->default(0);
            $table->float('response_time')->default(0); // In seconds
            $table->integer('hit_count')->default(0); // How many times this cache was used
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
            
            $table->index('query_hash');
            $table->index(['repository_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_cache');
    }
};

// Made with Bob
