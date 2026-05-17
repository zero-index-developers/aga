<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiHistoryController extends Controller
{
    public function index(): JsonResponse
    {
        $history = AiHistory::query()
            ->latest('recorded_at')
            ->latest('id')
            ->get()
            ->map(fn (AiHistory $item) => [
                'id' => (string) $item->id,
                'repoName' => $item->repo_name,
                'timestamp' => optional($item->recorded_at ?? $item->created_at)->toISOString(),
                'prompt' => $item->prompt,
                'response' => $item->response,
            ]);

        return response()->json($history->values());
    }

    public function destroyMany(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['string'],
        ]);

        AiHistory::query()->whereIn('id', $payload['ids'])->delete();

        return response()->json(['success' => true]);
    }
}
