<?php

namespace App\Actions\AI;

use App\Models\Repository;
use App\Services\AI\IBMBobService;

class AskOracleAction
{
    public function __construct(
        private readonly IBMBobService $bobService
    ) {}

    public function execute(Repository $repository, string $question, ?string $context = null): array
    {
        return $this->bobService->query($question, $repository, $context);
    }
}
