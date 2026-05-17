<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScanLog;
use Illuminate\Http\JsonResponse;

class ScanLogController extends Controller
{
    public function index(): JsonResponse
    {
        $logs = ScanLog::query()
            ->latest('scanned_at')
            ->latest('id')
            ->get()
            ->map(fn (ScanLog $log) => [
                'id' => (string) $log->id,
                'repoName' => $log->repo_name,
                'status' => $log->status,
                'timestamp' => optional($log->scanned_at ?? $log->created_at)->toISOString(),
                'duration' => $log->duration,
                'nodesFound' => $log->nodes_found,
            ]);

        return response()->json($logs->values());
    }

    public function destroyAll(): JsonResponse
    {
        ScanLog::query()->delete();

        return response()->json(['success' => true]);
    }
}
