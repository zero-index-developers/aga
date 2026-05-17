<?php

namespace App\Http\Controllers;

use App\Models\Repository;
use App\Models\Node;
use App\Services\IBMBobService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AIController extends Controller
{
    protected IBMBobService $bobService;

    public function __construct(IBMBobService $bobService)
    {
        $this->bobService = $bobService;
    }

    /**
     * Query the AI Oracle about the repository
     */
    public function query(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'repository_id' => 'required|integer|exists:repositories,id',
            'question' => 'required|string|min:3|max:500',
            'context' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $repository = Repository::find($request->repository_id);

        if (!$repository->isReady()) {
            return response()->json([
                'success' => false,
                'message' => 'Repository is not ready for querying',
                'status' => $repository->status,
            ], 425);
        }

        try {
            $result = $this->bobService->query(
                $request->question,
                $repository,
                $request->context
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
    public function blastRadius(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'node_id' => 'required|string',
            'repository_id' => 'required|integer|exists:repositories,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $node = Node::where('node_id', $request->node_id)
            ->where('repository_id', $request->repository_id)
            ->first();

        if (!$node) {
            return response()->json([
                'success' => false,
                'message' => 'Node not found',
            ], 404);
        }

        $blastRadius = $node->getBlastRadius();
        $impactSummary = $node->getImpactSummary();

        // Get detailed information about affected nodes
        $upstreamNodes = Node::whereIn('node_id', $blastRadius['upstream'])
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->node_id,
                    'name' => $n->name,
                    'type' => $n->type,
                    'layer' => $n->layer,
                    'file_path' => $n->file_path,
                ];
            });

        $downstreamNodes = Node::whereIn('node_id', $blastRadius['downstream'])
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->node_id,
                    'name' => $n->name,
                    'type' => $n->type,
                    'layer' => $n->layer,
                    'file_path' => $n->file_path,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'node' => [
                    'id' => $node->node_id,
                    'name' => $node->name,
                    'type' => $node->type,
                    'layer' => $node->layer,
                ],
                'blast_radius' => [
                    'upstream' => $blastRadius['upstream'],
                    'downstream' => $blastRadius['downstream'],
                    'total' => $blastRadius['total'],
                ],
                'impact_summary' => $impactSummary,
                'affected_nodes' => [
                    'upstream' => $upstreamNodes,
                    'downstream' => $downstreamNodes,
                ],
            ],
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
