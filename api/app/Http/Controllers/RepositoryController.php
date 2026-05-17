<?php

namespace App\Http\Controllers;

use App\Models\Repository;
use App\Services\GitHubService;
use App\Jobs\CloneAndAnalyzeRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class RepositoryController extends Controller
{
    protected GitHubService $githubService;

    public function __construct(GitHubService $githubService)
    {
        $this->githubService = $githubService;
    }

    /**
     * List all repositories
     */
    public function index(): JsonResponse
    {
        $repositories = Repository::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($repo) {
                return [
                    'id' => $repo->id,
                    'name' => $repo->name,
                    'full_name' => $repo->full_name,
                    'owner' => $repo->owner,
                    'description' => $repo->description,
                    'url' => $repo->url,
                    'language' => $repo->language,
                    'status' => $repo->status,
                    'last_scanned_at' => $repo->last_scanned_at?->toIso8601String(),
                    'metadata' => $repo->metadata,
                    'created_at' => $repo->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $repositories,
        ]);
    }

    /**
     * Connect a new repository
     */
    public function connect(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Parse GitHub URL
            $parsed = GitHubService::parseGitHubUrl($request->url);
            
            if (!$parsed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid GitHub URL format',
                ], 400);
            }

            // Check if repository already exists
            $existing = Repository::where('full_name', "{$parsed['owner']}/{$parsed['repo']}")->first();
            
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Repository already connected',
                    'data' => [
                        'id' => $existing->id,
                        'status' => $existing->status,
                    ],
                ], 409);
            }

            // Fetch repository information from GitHub
            $repoData = $this->githubService->getRepository($parsed['owner'], $parsed['repo']);

            // Create repository record
            $repository = Repository::create([
                ...$repoData,
                'local_path' => $this->githubService->getLocalPath($parsed['owner'], $parsed['repo']),
                'status' => 'pending',
            ]);

            // Dispatch job to clone and analyze repository
            CloneAndAnalyzeRepository::dispatch($repository);

            return response()->json([
                'success' => true,
                'message' => 'Repository connection initiated',
                'data' => [
                    'id' => $repository->id,
                    'name' => $repository->name,
                    'full_name' => $repository->full_name,
                    'status' => $repository->status,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect repository: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get repository details
     */
    public function show(int $id): JsonResponse
    {
        $repository = Repository::find($id);

        if (!$repository) {
            return response()->json([
                'success' => false,
                'message' => 'Repository not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $repository->id,
                'name' => $repository->name,
                'full_name' => $repository->full_name,
                'owner' => $repository->owner,
                'description' => $repository->description,
                'url' => $repository->url,
                'language' => $repository->language,
                'status' => $repository->status,
                'error_message' => $repository->error_message,
                'last_scanned_at' => $repository->last_scanned_at?->toIso8601String(),
                'metadata' => $repository->metadata,
                'stats' => [
                    'nodes_count' => $repository->nodes()->count(),
                    'edges_count' => $repository->edges()->count(),
                    'nodes_by_layer' => $repository->nodes()
                        ->selectRaw('layer, count(*) as count')
                        ->groupBy('layer')
                        ->pluck('count', 'layer'),
                    'nodes_by_type' => $repository->nodes()
                        ->selectRaw('type, count(*) as count')
                        ->groupBy('type')
                        ->pluck('count', 'type'),
                ],
                'created_at' => $repository->created_at->toIso8601String(),
                'updated_at' => $repository->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get repository graph data
     */
    public function graph(int $id): JsonResponse
    {
        $repository = Repository::find($id);

        if (!$repository) {
            return response()->json([
                'success' => false,
                'message' => 'Repository not found',
            ], 404);
        }

        if (!$repository->isReady()) {
            return response()->json([
                'success' => false,
                'message' => 'Repository is not ready yet',
                'status' => $repository->status,
            ], 425);
        }

        $graphData = $repository->getGraphData();

        return response()->json([
            'success' => true,
            'data' => $graphData,
        ]);
    }

    /**
     * Get repository status
     */
    public function status(int $id): JsonResponse
    {
        $repository = Repository::find($id);

        if (!$repository) {
            return response()->json([
                'success' => false,
                'message' => 'Repository not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $repository->id,
                'status' => $repository->status,
                'error_message' => $repository->error_message,
                'is_ready' => $repository->isReady(),
                'is_processing' => $repository->isProcessing(),
                'last_scanned_at' => $repository->last_scanned_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Rescan repository
     */
    public function rescan(int $id): JsonResponse
    {
        $repository = Repository::find($id);

        if (!$repository) {
            return response()->json([
                'success' => false,
                'message' => 'Repository not found',
            ], 404);
        }

        if ($repository->isProcessing()) {
            return response()->json([
                'success' => false,
                'message' => 'Repository is already being processed',
            ], 409);
        }

        // Reset status and dispatch job
        $repository->update(['status' => 'pending', 'error_message' => null]);
        CloneAndAnalyzeRepository::dispatch($repository);

        return response()->json([
            'success' => true,
            'message' => 'Repository rescan initiated',
            'data' => [
                'id' => $repository->id,
                'status' => $repository->status,
            ],
        ]);
    }

    /**
     * Delete repository
     */
    public function destroy(int $id): JsonResponse
    {
        $repository = Repository::find($id);

        if (!$repository) {
            return response()->json([
                'success' => false,
                'message' => 'Repository not found',
            ], 404);
        }

        // Delete local files if they exist
        if ($repository->local_path && is_dir($repository->local_path)) {
            $this->removeDirectory($repository->local_path);
        }

        $repository->delete();

        return response()->json([
            'success' => true,
            'message' => 'Repository deleted successfully',
        ]);
    }

    /**
     * Remove directory recursively
     */
    protected function removeDirectory(string $path): bool
    {
        if (!is_dir($path)) {
            return false;
        }

        $files = array_diff(scandir($path), ['.', '..']);
        
        foreach ($files as $file) {
            $filePath = $path . DIRECTORY_SEPARATOR . $file;
            
            if (is_dir($filePath)) {
                $this->removeDirectory($filePath);
            } else {
                unlink($filePath);
            }
        }

        return rmdir($path);
    }
}

// Made with Bob
