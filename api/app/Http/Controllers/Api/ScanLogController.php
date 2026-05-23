<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScanLog;
use App\Services\ScanLogs\ScanLogFormatter;
use Illuminate\Http\JsonResponse;

class ScanLogController extends Controller
{
    public function __construct(
        private readonly ScanLogFormatter $scanLogFormatter
    ) {}

    public function index(): JsonResponse
    {
        $logs = ScanLog::query()
            ->latest('scanned_at')
            ->latest('id')
            ->get()
            ->map(fn (ScanLog $log) => $this->scanLogFormatter->format($log));

        return response()->json($logs->values());
    }

    public function destroyAll(): JsonResponse
    {
        ScanLog::query()->delete();

        return response()->json(['success' => true]);
    }
}
