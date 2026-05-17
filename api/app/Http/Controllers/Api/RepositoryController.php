<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Repository;
use App\Models\ScanLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RepositoryController extends Controller
{
    public function index(): JsonResponse
    {
        $repositories = Repository::query()
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(fn (Repository $repository) => $this->formatRepository($repository))
            ->values();

        return response()->json($repositories);
    }

    public function status(): JsonResponse
    {
        $repository = Repository::query()->where('is_active', true)->first();

        return response()->json([
            'connectedRepo' => $repository?->name,
            'analytics' => $repository?->analytics ?? [
                'nodes' => 0,
                'edges' => 0,
                'health' => 0,
                'lastScanned' => null,
            ],
        ]);
    }

    public function connect(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'url' => ['required', 'string', 'max:2048'],
            'repoName' => ['nullable', 'string', 'max:255'],
            'provider' => ['nullable', 'string', 'max:50'],
            'token' => ['nullable', 'string'],
        ]);

        $name = trim($payload['repoName'] ?? $this->nameFromUrl($payload['url']));
        $provider = $payload['provider'] ?? $this->providerFromUrl($payload['url']);
        $slug = Str::slug($name);
        $existingRepository = Repository::query()->where('slug', $slug)->first();
        $defaultAnalytics = [
            'nodes' => 0,
            'edges' => 0,
            'health' => 100,
            'lastScanned' => null,
        ];

        Repository::query()->update(['is_active' => false]);

        $repository = Repository::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'name' => $name,
                'url' => $payload['url'],
                'provider' => $provider,
                'access_token' => $payload['token'] ?? null,
                'is_active' => true,
                'analytics' => $existingRepository?->analytics ?? $defaultAnalytics,
            ],
        );

        return response()->json([
            'success' => true,
            'db' => [
                'connectedRepo' => $repository->name,
                'analytics' => $repository->analytics ?? $defaultAnalytics,
            ],
        ]);
    }

    public function graph(Request $request): JsonResponse
    {
        $repoName = $request->query('repo') ?: $request->query('name');

        $repository = $repoName
            ? Repository::query()->where('name', $repoName)->orWhere('slug', Str::slug($repoName))->first()
            : Repository::query()->where('is_active', true)->first();

        return response()->json($repository?->graph ?? [
            'nodes' => [],
            'edges' => [],
        ]);
    }

    public function storeScan(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2048'],
            'provider' => ['nullable', 'string', 'max:50'],
            'graph' => ['required', 'array'],
            'graph.nodes' => ['nullable', 'array'],
            'graph.edges' => ['nullable', 'array'],
            'analytics' => ['required', 'array'],
            'analytics.nodes' => ['required', 'integer', 'min:0'],
            'analytics.edges' => ['required', 'integer', 'min:0'],
            'analytics.health' => ['required', 'integer', 'min:0', 'max:100'],
            'analytics.lastScanned' => ['required', 'date'],
            'duration' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        Repository::query()->update(['is_active' => false]);

        $repository = Repository::query()->updateOrCreate(
            ['slug' => Str::slug($payload['name'])],
            [
                'name' => $payload['name'],
                'url' => $payload['url'] ?? 'local://aga',
                'provider' => $payload['provider'] ?? $this->providerFromUrl($payload['url'] ?? 'local://aga'),
                'is_active' => true,
                'analytics' => $payload['analytics'],
                'graph' => $payload['graph'],
            ],
        );

        ScanLog::query()->create([
            'repository_id' => $repository->id,
            'repo_name' => $repository->name,
            'status' => $payload['status'] ?? 'Success',
            'duration' => $payload['duration'] ?? '0s',
            'nodes_found' => $payload['analytics']['nodes'],
            'message' => $payload['message'] ?? 'Repository scan completed successfully.',
            'scanned_at' => $payload['analytics']['lastScanned'],
        ]);

        return response()->json([
            'success' => true,
            'repository' => $this->formatRepository($repository->fresh()),
        ]);
    }

    private function formatRepository(Repository $repository): array
    {
        return [
            'name' => $repository->name,
            'url' => $repository->url,
            'provider' => $repository->provider,
            'analytics' => $repository->analytics ?? [
                'nodes' => 0,
                'edges' => 0,
                'health' => 0,
                'lastScanned' => null,
            ],
        ];
    }

    private function nameFromUrl(string $url): string
    {
        if (str_starts_with($url, 'local://')) {
            return trim(Str::after($url, 'local://')) ?: 'local-repository';
        }

        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');
        $segment = Str::of($path)->afterLast('/')->before('.git')->value();

        return $segment !== '' ? $segment : 'unknown-repo';
    }

    private function providerFromUrl(string $url): string
    {
        if (str_contains($url, 'gitlab')) {
            return 'gitlab';
        }

        if (str_starts_with($url, 'local://')) {
            return 'local';
        }

        return 'github';
    }
}
