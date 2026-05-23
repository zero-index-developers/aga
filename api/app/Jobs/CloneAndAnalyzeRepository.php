<?php

namespace App\Jobs;

use App\Models\Repository;
use App\Services\Repositories\GitHubService;
use App\Services\Graph\RepositoryParserService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CloneAndAnalyzeRepository implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600; // 10 minutes
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Repository $repository
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GitHubService $githubService): void
    {
        Log::info('Starting repository clone and analysis', [
            'repository_id' => $this->repository->id,
            'full_name' => $this->repository->full_name,
        ]);

        try {
            // Step 1: Clone repository
            $this->repository->update(['status' => 'cloning']);
            
            Log::info('Cloning repository', [
                'repository_id' => $this->repository->id,
                'clone_url' => $this->repository->clone_url,
                'local_path' => $this->repository->local_path,
            ]);

            $githubService->cloneRepository(
                $this->repository->clone_url,
                $this->repository->local_path,
                $this->repository->default_branch
            );

            // Step 2: Analyze repository
            $this->repository->update(['status' => 'analyzing']);
            
            Log::info('Analyzing repository', [
                'repository_id' => $this->repository->id,
            ]);

            $parser = new RepositoryParserService($this->repository);
            $parser->parse();

            // Step 3: Mark as completed
            $this->repository->markAsCompleted();

            Log::info('Repository clone and analysis completed', [
                'repository_id' => $this->repository->id,
                'nodes_count' => $this->repository->nodes()->count(),
                'edges_count' => $this->repository->edges()->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Repository clone and analysis failed', [
                'repository_id' => $this->repository->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->repository->markAsFailed($e->getMessage());

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Repository job failed permanently', [
            'repository_id' => $this->repository->id,
            'error' => $exception->getMessage(),
        ]);

        $this->repository->markAsFailed(
            'Job failed after ' . $this->tries . ' attempts: ' . $exception->getMessage()
        );
    }
}

// Made with Bob
