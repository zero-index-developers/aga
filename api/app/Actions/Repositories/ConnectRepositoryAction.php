<?php

namespace App\Actions\Repositories;

use App\Jobs\CloneAndAnalyzeRepository;
use App\Models\Repository;
use App\Services\Repositories\GitHubService;

class ConnectRepositoryAction
{
    public function __construct(
        private readonly GitHubService $githubService
    ) {}

    public function execute(array $parsedGitHubUrl): Repository
    {
        $repoData = $this->githubService->getRepository(
            $parsedGitHubUrl['owner'],
            $parsedGitHubUrl['repo'],
        );

        $repository = Repository::create([
            ...$repoData,
            'local_path' => $this->githubService->getLocalPath(
                $parsedGitHubUrl['owner'],
                $parsedGitHubUrl['repo'],
            ),
            'status' => 'pending',
        ]);

        CloneAndAnalyzeRepository::dispatch($repository);

        return $repository;
    }
}
