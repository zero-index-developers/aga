<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Edge extends Model
{
    use HasFactory;

    protected $fillable = [
        'repository_id',
        'source_node_id',
        'target_node_id',
        'relationship_type',
        'description',
        'weight',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the repository that owns this edge
     */
    public function repository(): BelongsTo
    {
        return $this->belongsTo(Repository::class);
    }

    /**
     * Get the source node
     */
    public function sourceNode(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'source_node_id');
    }

    /**
     * Get the target node
     */
    public function targetNode(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'target_node_id');
    }

    /**
     * Get edge style based on relationship type
     */
    public function getEdgeStyle(): array
    {
        return match($this->relationship_type) {
            'depends_on' => ['color' => '#ef4444', 'style' => 'solid'],
            'uses' => ['color' => '#3b82f6', 'style' => 'solid'],
            'extends' => ['color' => '#8b5cf6', 'style' => 'dashed'],
            'implements' => ['color' => '#10b981', 'style' => 'dashed'],
            'calls' => ['color' => '#f59e0b', 'style' => 'solid'],
            'imports' => ['color' => '#6366f1', 'style' => 'dotted'],
            'routes_to' => ['color' => '#14b8a6', 'style' => 'solid'],
            'middleware' => ['color' => '#ec4899', 'style' => 'dashed'],
            default => ['color' => '#6b7280', 'style' => 'solid'],
        };
    }
}

// Made with Bob
