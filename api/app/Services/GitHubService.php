<?php

namespace App\Services;

use Github\Client;
use Github\AuthMethod;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class GitHubService
{
    protected Client $client;
    protected ?string $token;
    protected string $storagePath;

    public function __construct()
    {
        $this->token = config('services.github.token') ?: null;
        $this->storagePath = storage_path(config('services.github.storage_path', 'app/repositories'));
        
        $this->client = new Client();
        
        if ($this->token) {
            $this->client->authenticate($this->token, null, AuthMethod::ACCESS_TOKEN);
        }
    }

    /**
     * Get repository information from GitHub
     */
    public function getRepository(string $owner, string $repo): array
    {
        try {
            $repoData = $this->client->api('repo')->show($owner, $repo);
            
            return [
                'name' => $repoData['name'],
                'full_name' => $repoData['full_name'],
                'owner' => $repoData['owner']['login'],
                'description' => $repoData['description'] ?? '',
                'url' => $repoData['html_url'],
                'clone_url' => $repoData['clone_url'],
                'default_branch' => $repoData['default_branch'] ?? 'main',
                'language' => $repoData['language'] ?? 'Unknown',
                'metadata' => [
                    'stars' => $repoData['stargazers_count'] ?? 0,
                    'forks' => $repoData['forks_count'] ?? 0,
                    'open_issues' => $repoData['open_issues_count'] ?? 0,
                    'size' => $repoData['size'] ?? 0,
                    'created_at' => $repoData['created_at'] ?? null,
                    'updated_at' => $repoData['updated_at'] ?? null,
                    'private' => $repoData['private'] ?? false,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Failed to fetch repository from GitHub', [
                'owner' => $owner,
                'repo' => $repo,
                'error' => $e->getMessage(),
            ]);
            
            throw new \Exception("Failed to fetch repository: {$e->getMessage()}");
        }
    }

    /**
     * Clone repository to local storage
     */
    public function cloneRepository(string $cloneUrl, string $localPath, ?string $branch = null): bool
    {
        try {
            // Ensure storage directory exists
            if (!is_dir(dirname($localPath))) {
                mkdir(dirname($localPath), 0755, true);
            }

            // Remove existing directory if it exists
            if (is_dir($localPath)) {
                $this->removeDirectory($localPath);
            }

            // Build clone command
            $command = ['git', 'clone'];
            
            if ($branch) {
                $command[] = '--branch';
                $command[] = $branch;
            }
            
            $command[] = '--depth';
            $command[] = '1'; // Shallow clone for speed
            
            // Add token to URL if available
            if ($this->token) {
                $cloneUrl = $this->addTokenToUrl($cloneUrl);
            }
            
            $command[] = $cloneUrl;
            $command[] = $localPath;

            $process = new Process($command);
            $process->setTimeout(300); // 5 minutes timeout
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            Log::info('Repository cloned successfully', [
                'path' => $localPath,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to clone repository', [
                'clone_url' => $cloneUrl,
                'local_path' => $localPath,
                'error' => $e->getMessage(),
            ]);
            
            throw new \Exception("Failed to clone repository: {$e->getMessage()}");
        }
    }

    /**
     * Get commit history for a repository
     */
    public function getCommitHistory(string $owner, string $repo, int $limit = 100): array
    {
        try {
            $commits = $this->client->api('repo')->commits()->all($owner, $repo, [
                'per_page' => $limit,
            ]);

            return array_map(function ($commit) {
                return [
                    'sha' => $commit['sha'],
                    'message' => $commit['commit']['message'],
                    'author' => $commit['commit']['author']['name'] ?? 'Unknown',
                    'date' => $commit['commit']['author']['date'] ?? null,
                    'url' => $commit['html_url'] ?? null,
                ];
            }, $commits);
        } catch (\Exception $e) {
            Log::error('Failed to fetch commit history', [
                'owner' => $owner,
                'repo' => $repo,
                'error' => $e->getMessage(),
            ]);
            
            return [];
        }
    }

    /**
     * Get pull requests for a repository
     */
    public function getPullRequests(string $owner, string $repo, string $state = 'all', int $limit = 50): array
    {
        try {
            $prs = $this->client->api('pull_request')->all($owner, $repo, [
                'state' => $state,
                'per_page' => $limit,
            ]);

            return array_map(function ($pr) {
                return [
                    'number' => $pr['number'],
                    'title' => $pr['title'],
                    'state' => $pr['state'],
                    'author' => $pr['user']['login'] ?? 'Unknown',
                    'created_at' => $pr['created_at'] ?? null,
                    'updated_at' => $pr['updated_at'] ?? null,
                    'merged_at' => $pr['merged_at'] ?? null,
                    'url' => $pr['html_url'] ?? null,
                ];
            }, $prs);
        } catch (\Exception $e) {
            Log::error('Failed to fetch pull requests', [
                'owner' => $owner,
                'repo' => $repo,
                'error' => $e->getMessage(),
            ]);
            
            return [];
        }
    }

    /**
     * Get file content from repository
     */
    public function getFileContent(string $owner, string $repo, string $path, ?string $ref = null): ?string
    {
        try {
            $fileData = $this->client->api('repo')->contents()->show($owner, $repo, $path, $ref);
            
            if (isset($fileData['content'])) {
                return base64_decode($fileData['content']);
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error('Failed to fetch file content', [
                'owner' => $owner,
                'repo' => $repo,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            
            return null;
        }
    }

    /**
     * Parse GitHub URL to extract owner and repo
     */
    public static function parseGitHubUrl(string $url): ?array
    {
        // Support various GitHub URL formats
        $patterns = [
            '#github\.com[:/]([^/]+)/([^/\.]+)(?:\.git)?#i',
            '#^([^/]+)/([^/]+)$#', // owner/repo format
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return [
                    'owner' => $matches[1],
                    'repo' => $matches[2],
                ];
            }
        }

        return null;
    }

    /**
     * Add authentication token to clone URL
     */
    protected function addTokenToUrl(string $url): string
    {
        if (strpos($url, 'https://') === 0) {
            return str_replace('https://', "https://{$this->token}@", $url);
        }
        
        return $url;
    }

    /**
     * Remove directory recursively
     */
    protected function removeDirectory(string $path): bool
    {
        if (!is_dir($path)) {
            return false;
        }

        $files = array_diff(scandir($path), ['.', '..']);
        
        foreach ($files as $file) {
            $filePath = $path . DIRECTORY_SEPARATOR . $file;
            
            if (is_dir($filePath)) {
                $this->removeDirectory($filePath);
            } else {
                unlink($filePath);
            }
        }

        return rmdir($path);
    }

    /**
     * Get local path for repository
     */
    public function getLocalPath(string $owner, string $repo): string
    {
        return $this->storagePath . DIRECTORY_SEPARATOR . $owner . DIRECTORY_SEPARATOR . $repo;
    }
}

// Made with Bob
