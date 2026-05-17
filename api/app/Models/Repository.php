<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Repository extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'full_name',
        'owner',
        'description',
        'url',
        'clone_url',
        'default_branch',
        'language',
        'local_path',
        'status',
        'error_message',
        'last_scanned_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_scanned_at' => 'datetime',
    ];

    /**
     * Get all nodes for this repository
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(Node::class);
    }

    /**
     * Get all edges for this repository
     */
    public function edges(): HasMany
    {
        return $this->hasMany(Edge::class);
    }

    /**
     * Get AI cache entries for this repository
     */
    public function aiCache(): HasMany
    {
        return $this->hasMany(AICache::class);
    }

    /**
     * Check if repository is ready for querying
     */
    public function isReady(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if repository is currently being processed
     */
    public function isProcessing(): bool
    {
        return in_array($this->status, ['pending', 'cloning', 'analyzing']);
    }

    /**
     * Mark repository as failed
     */
    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }

    /**
     * Mark repository as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'last_scanned_at' => now(),
            'error_message' => null,
        ]);
    }

    /**
     * Get graph data for visualization
     */
    public function getGraphData(): array
    {
        $nodes = $this->nodes()
            ->select('id', 'node_id', 'name', 'type', 'layer', 'file_path', 'description', 'metadata')
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'label' => $node->name,
                    'type' => $node->type,
                    'layer' => $node->layer,
                    'filePath' => $node->file_path,
                    'description' => $node->description,
                    'metadata' => $node->metadata,
                ];
            });

        $edges = $this->edges()
            ->with(['sourceNode:id,node_id', 'targetNode:id,node_id'])
            ->get()
            ->map(function ($edge) {
                return [
                    'id' => "edge-{$edge->id}",
                    'source' => $edge->sourceNode->node_id,
                    'target' => $edge->targetNode->node_id,
                    'type' => $edge->relationship_type,
                    'label' => $edge->relationship_type,
                    'weight' => $edge->weight,
                ];
            });

        return [
            'nodes' => $nodes,
            'edges' => $edges,
        ];
    }
}

// Made with Bob
