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
        Schema::create('edges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repository_id')->constrained()->onDelete('cascade');
            $table->foreignId('source_node_id')->constrained('nodes')->onDelete('cascade');
            $table->foreignId('target_node_id')->constrained('nodes')->onDelete('cascade');
            $table->enum('relationship_type', [
                'depends_on',
                'uses',
                'extends',
                'implements',
                'calls',
                'imports',
                'references',
                'belongs_to',
                'has_many',
                'has_one',
                'many_to_many',
                'routes_to',
                'middleware',
                'event',
                'listener',
                'other'
            ]);
            $table->text('description')->nullable();
            $table->integer('weight')->default(1); // For graph algorithms
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['repository_id', 'relationship_type']);
            $table->index('source_node_id');
            $table->index('target_node_id');
            $table->unique(['source_node_id', 'target_node_id', 'relationship_type'], 'unique_edge');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('edges');
    }
};

// Made with Bob
