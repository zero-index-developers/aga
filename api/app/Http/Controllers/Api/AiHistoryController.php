<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Logs\DestroyAiHistoryRequest;
use App\Models\AiHistory;
use App\Services\ScanLogs\AiHistoryFormatter;
use Illuminate\Http\JsonResponse;

class AiHistoryController extends Controller
{
    public function __construct(
        private readonly AiHistoryFormatter $aiHistoryFormatter
    ) {}

    public function index(): JsonResponse
    {
        $history = AiHistory::query()
            ->latest('recorded_at')
            ->latest('id')
            ->get()
            ->map(fn (AiHistory $item) => $this->aiHistoryFormatter->format($item));

        return response()->json($history->values());
    }

    public function destroyMany(DestroyAiHistoryRequest $request): JsonResponse
    {
        $payload = $request->validated();

        AiHistory::query()->whereIn('id', $payload['ids'])->delete();

        return response()->json(['success' => true]);
    }
}
