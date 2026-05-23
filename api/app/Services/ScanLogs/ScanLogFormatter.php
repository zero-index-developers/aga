<?php

namespace App\Services\ScanLogs;

use App\Models\ScanLog;

class ScanLogFormatter
{
    public function format(ScanLog $log): array
    {
        return [
            'id' => (string) $log->id,
            'repoName' => $log->repo_name,
            'status' => $log->status,
            'timestamp' => optional($log->scanned_at ?? $log->created_at)->toISOString(),
            'duration' => $log->duration,
            'nodesFound' => $log->nodes_found,
        ];
    }
}
