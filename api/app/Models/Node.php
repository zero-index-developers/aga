<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Node extends Model
{
    use HasFactory;

    protected $fillable = [
        'repository_id',
        'node_id',
        'name',
        'type',
        'layer',
        'file_path',
        'description',
        'namespace',
        'class_name',
        'methods',
        'properties',
        'dependencies',
        'metadata',
        'line_start',
        'line_end',
        'complexity_score',
    ];

    protected $casts = [
        'methods' => 'array',
        'properties' => 'array',
        'dependencies' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the repository that owns this node
     */
    public function repository(): BelongsTo
    {
        return $this->belongsTo(Repository::class);
    }

    /**
     * Get edges where this node is the source
     */
    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'source_node_id');
    }

    /**
     * Get edges where this node is the target
     */
    public function incomingEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'target_node_id');
    }

    /**
     * Get all dependencies (downstream nodes)
     */
    public function getDependencies()
    {
        return $this->outgoingEdges()
            ->with('targetNode')
            ->get()
            ->pluck('targetNode');
    }

    /**
     * Get all dependents (upstream nodes)
     */
    public function getDependents()
    {
        return $this->incomingEdges()
            ->with('sourceNode')
            ->get()
            ->pluck('sourceNode');
    }

    /**
     * Calculate blast radius (all affected nodes)
     */
    public function getBlastRadius(): array
    {
        $upstream = $this->getDependents()->pluck('node_id')->toArray();
        $downstream = $this->getDependencies()->pluck('node_id')->toArray();

        return [
            'upstream' => $upstream,
            'downstream' => $downstream,
            'total' => count($upstream) + count($downstream),
        ];
    }

    /**
     * Get impact summary
     */
    public function getImpactSummary(): string
    {
        $blastRadius = $this->getBlastRadius();
        
        $upstreamCount = count($blastRadius['upstream']);
        $downstreamCount = count($blastRadius['downstream']);

        $parts = [];
        
        if ($upstreamCount > 0) {
            $parts[] = "{$upstreamCount} upstream " . ($upstreamCount === 1 ? 'dependency' : 'dependencies');
        }
        
        if ($downstreamCount > 0) {
            $parts[] = "{$downstreamCount} downstream " . ($downstreamCount === 1 ? 'dependency' : 'dependencies');
        }

        if (empty($parts)) {
            return "No direct dependencies";
        }

        return "Changing this affects " . implode(' and ', $parts);
    }

    /**
     * Get color based on layer
     */
    public function getLayerColor(): string
    {
        return match($this->layer) {
            'frontend' => '#3b82f6', // Blue
            'api' => '#10b981', // Green
            'backend' => '#8b5cf6', // Purple
            'database' => '#f59e0b', // Orange
            'infrastructure' => '#6366f1', // Indigo
            default => '#6b7280', // Gray
        };
    }
}

// Made with Bob
