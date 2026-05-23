<?php

namespace App\Http\Controllers\Api;

use App\Actions\AI\AskOracleAction;
use App\Actions\AI\GenerateBlastRadiusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\AI\BlastRadiusRequest;
use App\Http\Requests\AI\QueryOracleRequest;
use App\Models\Repository;
use App\Models\Node;
use App\Services\AI\IBMBobService;
use Illuminate\Http\JsonResponse;

class AIController extends Controller
{
    public function __construct(
        private readonly IBMBobService $bobService,
        private readonly AskOracleAction $askOracle,
        private readonly GenerateBlastRadiusAction $generateBlastRadius,
    ) {}

    /**
     * Query the AI Oracle about the repository
     */
    public function query(QueryOracleRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $repository = Repository::find($payload['repository_id']);

        if (!$repository->isReady()) {
            return response()->json([
                'success' => false,
                'message' => 'Repository is not ready for querying',
                'status' => $repository->status,
            ], 425);
        }

        try {
            $result = $this->askOracle->execute(
                $repository,
                $payload['question'],
                $payload['context'] ?? null,
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'answer' => $result['answer'],
                    'highlighted_nodes' => $result['highlighted_nodes'],
                    'cached' => $result['cached'],
                    'model' => $result['model'],
                    'tokens_used' => $result['tokens_used'] ?? 0,
                    'response_time' => $result['response_time'] ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process query: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get blast radius for a node
     */
    public function blastRadius(BlastRadiusRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $node = Node::where('node_id', $payload['node_id'])
            ->where('repository_id', $payload['repository_id'])
            ->first();

        if (!$node) {
            return response()->json([
                'success' => false,
                'message' => 'Node not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->generateBlastRadius->execute($node),
        ]);
    }

    /**
     * Get AI query history for a repository
     */
    public function history(int $repositoryId): JsonResponse
    {
        $repository = Repository::find($repositoryId);

        if (!$repository) {
            return response()->json([
                'success' => false,
                'message' => 'Repository not found',
            ], 404);
        }

        $history = $repository->aiCache()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($cache) {
                return [
                    'id' => $cache->id,
                    'query' => $cache->query,
                    'response' => $cache->response,
                    'highlighted_nodes' => $cache->highlighted_nodes,
                    'model' => $cache->model,
                    'hit_count' => $cache->hit_count,
                    'created_at' => $cache->created_at->toIso8601String(),
                    'last_accessed_at' => $cache->last_accessed_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Check AI service status
     */
    public function status(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'configured' => $this->bobService->isConfigured(),
                'enabled' => config('services.ibm_bob.enabled'),
                'model' => config('services.ibm_bob.model'),
            ],
        ]);
    }
}

// Made with Bob
