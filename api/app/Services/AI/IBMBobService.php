<?php

namespace App\Services\AI;

use App\Models\Repository;
use App\Models\AICache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IBMBobService
{
    protected bool $enabled;
    protected ?string $apiKey;
    protected ?string $apiUrl;
    protected string $model;
    protected int $maxTokens;
    protected float $temperature;
    protected int $timeout;

    public function __construct()
    {
        $this->enabled = config('services.ibm_bob.enabled', true);
        $this->apiKey = config('services.ibm_bob.api_key');
        $this->apiUrl = config('services.ibm_bob.api_url');
        $this->model = config('services.ibm_bob.model', 'ibm/granite-13b-chat-v2');
        $this->maxTokens = config('services.ibm_bob.max_tokens', 2000);
        $this->temperature = config('services.ibm_bob.temperature', 0.7);
        $this->timeout = config('services.ibm_bob.timeout', 30);
    }

    /**
     * Query IBM Bob with a question about the repository
     */
    public function query(string $question, Repository $repository, ?string $context = null): array
    {
        // Check cache first
        $cached = AICache::findCached($question, $repository->id);
        if ($cached) {
            Log::info('Using cached AI response', [
                'repository_id' => $repository->id,
                'query' => $question,
            ]);

            return [
                'answer' => $cached->response,
                'highlighted_nodes' => $cached->highlighted_nodes ?? [],
                'cached' => true,
                'model' => $cached->model,
            ];
        }

        // If IBM Bob is not enabled or configured, use fallback
        if (!$this->enabled || !$this->apiKey || !$this->apiUrl) {
            return $this->getFallbackResponse($question, $repository);
        }

        try {
            $startTime = microtime(true);

            // Build context from repository
            $fullContext = $this->buildContext($repository, $context);

            // Make API request to IBM Bob
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($this->apiUrl, [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $this->getSystemPrompt(),
                        ],
                        [
                            'role' => 'user',
                            'content' => $this->formatUserPrompt($question, $fullContext),
                        ],
                    ],
                    'max_tokens' => $this->maxTokens,
                    'temperature' => $this->temperature,
                ]);

            $responseTime = microtime(true) - $startTime;

            if (!$response->successful()) {
                Log::error('IBM Bob API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->getFallbackResponse($question, $repository);
            }

            $data = $response->json();
            $answer = $data['choices'][0]['message']['content'] ?? 'No response from AI';
            $tokensUsed = $data['usage']['total_tokens'] ?? 0;

            // Extract highlighted nodes from the response
            $highlightedNodes = $this->extractHighlightedNodes($answer, $repository);

            // Cache the response
            AICache::store(
                $question,
                $answer,
                $repository->id,
                $highlightedNodes,
                $fullContext,
                $this->model,
                $tokensUsed,
                $responseTime
            );

            Log::info('IBM Bob query successful', [
                'repository_id' => $repository->id,
                'tokens_used' => $tokensUsed,
                'response_time' => $responseTime,
            ]);

            return [
                'answer' => $answer,
                'highlighted_nodes' => $highlightedNodes,
                'cached' => false,
                'model' => $this->model,
                'tokens_used' => $tokensUsed,
                'response_time' => $responseTime,
            ];
        } catch (\Exception $e) {
            Log::error('IBM Bob query failed', [
                'repository_id' => $repository->id,
                'error' => $e->getMessage(),
            ]);

            return $this->getFallbackResponse($question, $repository);
        }
    }

    /**
     * Build context from repository for AI
     */
    protected function buildContext(Repository $repository, ?string $additionalContext = null): string
    {
        $context = "Repository: {$repository->full_name}\n";
        $context .= "Language: {$repository->language}\n";
        $context .= "Description: {$repository->description}\n\n";

        // Add architecture overview
        $nodes = $repository->nodes()->select('type', 'layer')->get();
        $nodesByType = $nodes->groupBy('type')->map->count();
        $nodesByLayer = $nodes->groupBy('layer')->map->count();

        $context .= "Architecture Overview:\n";
        $context .= "- Total Components: " . $nodes->count() . "\n";
        
        foreach ($nodesByLayer as $layer => $count) {
            $context .= "- {$layer}: {$count} components\n";
        }

        $context .= "\nComponent Types:\n";
        foreach ($nodesByType as $type => $count) {
            $context .= "- {$type}: {$count}\n";
        }

        if ($additionalContext) {
            $context .= "\nAdditional Context:\n{$additionalContext}\n";
        }

        return $context;
    }

    /**
     * Get system prompt for IBM Bob
     */
    protected function getSystemPrompt(): string
    {
        return <<<PROMPT
You are an expert software architect and code analyst. You have deep knowledge of software architecture patterns, 
design principles, and best practices across multiple programming languages and frameworks.

Your role is to analyze software repositories and provide insightful, accurate answers about:
- Architecture and design patterns
- Code dependencies and relationships
- Potential issues and technical debt
- Historical context and intent behind code decisions
- Impact analysis for proposed changes
- Best practices and recommendations

When answering questions:
1. Be specific and reference actual components when possible
2. Explain the "why" behind architectural decisions
3. Highlight potential risks or impacts
4. Provide actionable insights
5. Use clear, professional language
6. If you mention specific components, wrap them in [NODE:component_name] tags so they can be highlighted

Keep responses concise but comprehensive, focusing on what developers need to know.
PROMPT;
    }

    /**
     * Format user prompt with question and context
     */
    protected function formatUserPrompt(string $question, string $context): string
    {
        return <<<PROMPT
Repository Context:
{$context}

Question: {$question}

Please provide a detailed answer based on the repository's architecture and context.
PROMPT;
    }

    /**
     * Extract node references from AI response
     */
    protected function extractHighlightedNodes(string $response, Repository $repository): array
    {
        preg_match_all('/\[NODE:([^\]]+)\]/', $response, $matches);
        
        if (empty($matches[1])) {
            return [];
        }

        $nodeNames = $matches[1];
        $nodes = $repository->nodes()
            ->whereIn('name', $nodeNames)
            ->pluck('node_id')
            ->toArray();

        return $nodes;
    }

    /**
     * Get fallback response for demo purposes
     */
    protected function getFallbackResponse(string $question, Repository $repository): array
    {
        $question = strtolower($question);
        
        // Demo responses for common questions
        $demoResponses = [
            'auth' => [
                'answer' => "The authentication system in this repository uses a middleware-based approach. The [NODE:AuthMiddleware] validates user tokens before allowing access to protected routes. There's a deliberate 500ms delay in the [NODE:UserController] authentication method that was added in 2024 to prevent race conditions during concurrent login attempts. This delay should not be removed without refactoring the session management system to use proper locking mechanisms.",
                'nodes' => ['AuthMiddleware', 'UserController'],
            ],
            'payment' => [
                'answer' => "The payment processing flow involves three main components: [NODE:PaymentController] receives the request, [NODE:PaymentService] handles the business logic, and [NODE:PaymentGateway] interfaces with external payment providers. Changing the [NODE:PaymentService] would impact 3 API routes and 2 database models. The system uses a two-phase commit pattern to ensure transaction consistency.",
                'nodes' => ['PaymentController', 'PaymentService', 'PaymentGateway'],
            ],
            'database' => [
                'answer' => "This repository uses PostgreSQL as the primary database. The choice was made for its robust ACID compliance and support for complex queries. The [NODE:users] table is central to the system, with foreign key relationships to [NODE:orders], [NODE:payments], and [NODE:sessions] tables. Any schema changes to the users table should be carefully reviewed as it affects multiple services.",
                'nodes' => ['users', 'orders', 'payments'],
            ],
            'bypass' => [
                'answer' => "⚠️ WARNING: Bypassing the [NODE:AuthMiddleware] would create a critical security vulnerability. This middleware performs essential security checks including token validation, rate limiting, and permission verification. Removing it would expose protected endpoints to unauthorized access. If you need to modify authentication behavior, consider extending the middleware rather than bypassing it.",
                'nodes' => ['AuthMiddleware'],
            ],
        ];

        // Find matching demo response
        foreach ($demoResponses as $keyword => $response) {
            if (str_contains($question, $keyword)) {
                $highlightedNodes = $this->findNodesByNames($repository, $response['nodes']);
                
                // Cache the demo response
                AICache::store(
                    $question,
                    $response['answer'],
                    $repository->id,
                    $highlightedNodes,
                    null,
                    'demo-fallback',
                    0,
                    0
                );

                return [
                    'answer' => $response['answer'],
                    'highlighted_nodes' => $highlightedNodes,
                    'cached' => false,
                    'model' => 'demo-fallback',
                ];
            }
        }

        // Generic fallback
        $answer = "Based on the repository structure, I can see this is a {$repository->language} project with " . 
                  $repository->nodes()->count() . " components across multiple layers. " .
                  "To provide a more specific answer, please ask about particular components, dependencies, or architectural patterns.";

        return [
            'answer' => $answer,
            'highlighted_nodes' => [],
            'cached' => false,
            'model' => 'demo-fallback',
        ];
    }

    /**
     * Find nodes by their names
     */
    protected function findNodesByNames(Repository $repository, array $names): array
    {
        return $repository->nodes()
            ->whereIn('name', $names)
            ->pluck('node_id')
            ->toArray();
    }

    /**
     * Check if IBM Bob is properly configured
     */
    public function isConfigured(): bool
    {
        return $this->enabled && !empty($this->apiKey) && !empty($this->apiUrl);
    }
}

// Made with Bob
