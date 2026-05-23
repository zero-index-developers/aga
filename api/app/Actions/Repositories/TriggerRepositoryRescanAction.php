<?php

namespace App\Actions\Repositories;

use App\Jobs\CloneAndAnalyzeRepository;
use App\Models\Repository;

class TriggerRepositoryRescanAction
{
    public function execute(Repository $repository): Repository
    {
        $repository->update([
            'status' => 'pending',
            'error_message' => null,
        ]);

        CloneAndAnalyzeRepository::dispatch($repository);

        return $repository->fresh();
    }
}
