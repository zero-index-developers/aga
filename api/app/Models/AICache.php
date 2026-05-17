<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AICache extends Model
{
    use HasFactory;

    protected $table = 'ai_cache';

    protected $fillable = [
        'repository_id',
        'query_hash',
        'query',
        'context',
        'response',
        'highlighted_nodes',
        'model',
        'tokens_used',
        'response_time',
        'hit_count',
        'last_accessed_at',
    ];

    protected $casts = [
        'highlighted_nodes' => 'array',
        'last_accessed_at' => 'datetime',
    ];

    /**
     * Get the repository that owns this cache entry
     */
    public function repository(): BelongsTo
    {
        return $this->belongsTo(Repository::class);
    }

    /**
     * Generate hash for a query
     */
    public static function generateHash(string $query, ?int $repositoryId = null): string
    {
        return hash('sha256', $repositoryId . '|' . strtolower(trim($query)));
    }

    /**
     * Find cached response
     */
    public static function findCached(string $query, ?int $repositoryId = null): ?self
    {
        $hash = self::generateHash($query, $repositoryId);
        
        $cache = self::where('query_hash', $hash)->first();
        
        if ($cache) {
            $cache->increment('hit_count');
            $cache->update(['last_accessed_at' => now()]);
        }
        
        return $cache;
    }

    /**
     * Store AI response in cache
     */
    public static function store(
        string $query,
        string $response,
        ?int $repositoryId = null,
        ?array $highlightedNodes = null,
        ?string $context = null,
        ?string $model = null,
        int $tokensUsed = 0,
        float $responseTime = 0
    ): self {
        $hash = self::generateHash($query, $repositoryId);
        
        return self::updateOrCreate(
            ['query_hash' => $hash],
            [
                'repository_id' => $repositoryId,
                'query' => $query,
                'context' => $context,
                'response' => $response,
                'highlighted_nodes' => $highlightedNodes,
                'model' => $model,
                'tokens_used' => $tokensUsed,
                'response_time' => $responseTime,
                'hit_count' => 1,
                'last_accessed_at' => now(),
            ]
        );
    }

    /**
     * Clear old cache entries
     */
    public static function clearOld(int $days = 30): int
    {
        return self::where('created_at', '<', now()->subDays($days))->delete();
    }
}

// Made with Bob
