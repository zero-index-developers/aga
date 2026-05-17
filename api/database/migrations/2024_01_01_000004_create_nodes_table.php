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
        Schema::create('nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repository_id')->constrained()->onDelete('cascade');
            $table->string('node_id')->unique(); // Unique identifier for the node
            $table->string('name');
            $table->enum('type', [
                'controller',
                'service',
                'model',
                'middleware',
                'route',
                'api_route',
                'database',
                'table',
                'migration',
                'component',
                'view',
                'config',
                'helper',
                'job',
                'event',
                'listener',
                'command',
                'policy',
                'resource',
                'request',
                'rule',
                'provider',
                'facade',
                'trait',
                'interface',
                'enum',
                'exception',
                'test',
                'factory',
                'seeder',
                'other'
            ]);
            $table->enum('layer', ['frontend', 'api', 'backend', 'database', 'infrastructure', 'other'])->default('other');
            $table->string('file_path');
            $table->text('description')->nullable();
            $table->string('namespace')->nullable();
            $table->string('class_name')->nullable();
            $table->json('methods')->nullable(); // Array of method names
            $table->json('properties')->nullable(); // Array of property names
            $table->json('dependencies')->nullable(); // Array of dependency node_ids
            $table->json('metadata')->nullable(); // Additional metadata
            $table->integer('line_start')->nullable();
            $table->integer('line_end')->nullable();
            $table->integer('complexity_score')->default(0);
            $table->timestamps();
            
            $table->index(['repository_id', 'type']);
            $table->index(['repository_id', 'layer']);
            $table->index('node_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nodes');
    }
};

// Made with Bob
