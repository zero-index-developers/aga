<?php

namespace App\Services\ScanLogs;

use App\Models\AiHistory;

class AiHistoryFormatter
{
    public function format(AiHistory $item): array
    {
        return [
            'id' => (string) $item->id,
            'repoName' => $item->repo_name,
            'timestamp' => optional($item->recorded_at ?? $item->created_at)->toISOString(),
            'prompt' => $item->prompt,
            'response' => $item->response,
        ];
    }
}
