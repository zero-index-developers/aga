<?php

namespace App\Services;

use App\Models\Repository;
use App\Models\Node;
use App\Models\Edge;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RepositoryParserService
{
    protected Repository $repository;
    protected string $basePath;
    protected array $nodes = [];
    protected array $edges = [];

    public function __construct(Repository $repository)
    {
        $this->repository = $repository;
        $this->basePath = $repository->local_path;
    }

    /**
     * Parse the entire repository
     */
    public function parse(): bool
    {
        try {
            Log::info('Starting repository parsing', [
                'repository_id' => $this->repository->id,
                'path' => $this->basePath,
            ]);

            // Clear existing nodes and edges
            $this->repository->nodes()->delete();
            $this->repository->edges()->delete();

            // Parse different file types
            $this->parsePhpFiles();
            $this->parseJavaScriptFiles();
            $this->parseTypeScriptFiles();
            $this->parseDatabaseFiles();
            $this->parseConfigFiles();
            $this->parseRouteFiles();

            // Build relationships between nodes
            $this->buildRelationships();

            Log::info('Repository parsing completed', [
                'repository_id' => $this->repository->id,
                'nodes_count' => count($this->nodes),
                'edges_count' => count($this->edges),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Repository parsing failed', [
                'repository_id' => $this->repository->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Parse PHP files (Controllers, Models, Services, etc.)
     */
    protected function parsePhpFiles(): void
    {
        $phpFiles = $this->findFiles('*.php', ['vendor', 'node_modules', 'storage', 'bootstrap/cache']);

        foreach ($phpFiles as $file) {
            $this->parsePhpFile($file);
        }
    }

    /**
     * Parse a single PHP file
     */
    protected function parsePhpFile(string $filePath): void
    {
        $content = file_get_contents($filePath);
        $relativePath = $this->getRelativePath($filePath);

        // Extract namespace
        preg_match('/namespace\s+([^;]+);/', $content, $namespaceMatch);
        $namespace = $namespaceMatch[1] ?? null;

        // Extract class name
        preg_match('/class\s+(\w+)/', $content, $classMatch);
        $className = $classMatch[1] ?? null;

        if (!$className) {
            return; // Skip files without classes
        }

        // Determine node type based on file path and class name
        $type = $this->determinePhpNodeType($relativePath, $className);
        $layer = $this->determineLayer($relativePath, $type);

        // Extract methods
        preg_match_all('/(?:public|protected|private)\s+function\s+(\w+)\s*\(/', $content, $methodMatches);
        $methods = $methodMatches[1] ?? [];

        // Extract properties
        preg_match_all('/(?:public|protected|private)\s+(?:static\s+)?\$(\w+)/', $content, $propertyMatches);
        $properties = $propertyMatches[1] ?? [];

        // Extract dependencies (use statements)
        preg_match_all('/use\s+([^;]+);/', $content, $useMatches);
        $dependencies = $useMatches[1] ?? [];

        // Create node
        $nodeId = $this->generateNodeId($namespace, $className);
        
        $node = Node::create([
            'repository_id' => $this->repository->id,
            'node_id' => $nodeId,
            'name' => $className,
            'type' => $type,
            'layer' => $layer,
            'file_path' => $relativePath,
            'description' => $this->extractDescription($content),
            'namespace' => $namespace,
            'class_name' => $className,
            'methods' => $methods,
            'properties' => $properties,
            'dependencies' => $dependencies,
            'complexity_score' => $this->calculateComplexity($content),
            'metadata' => [
                'line_count' => substr_count($content, "\n") + 1,
                'method_count' => count($methods),
                'property_count' => count($properties),
            ],
        ]);

        $this->nodes[$nodeId] = $node;
    }

    /**
     * Parse JavaScript/TypeScript files
     */
    protected function parseJavaScriptFiles(): void
    {
        $jsFiles = $this->findFiles('*.{js,jsx}', ['node_modules', 'vendor', 'dist', 'build']);
        
        foreach ($jsFiles as $file) {
            $this->parseJsFile($file, 'component');
        }
    }

    /**
     * Parse TypeScript files
     */
    protected function parseTypeScriptFiles(): void
    {
        $tsFiles = $this->findFiles('*.{ts,tsx}', ['node_modules', 'vendor', 'dist', 'build']);
        
        foreach ($tsFiles as $file) {
            $this->parseJsFile($file, 'component');
        }
    }

    /**
     * Parse JS/TS file
     */
    protected function parseJsFile(string $filePath, string $defaultType): void
    {
        $content = file_get_contents($filePath);
        $relativePath = $this->getRelativePath($filePath);

        // Extract component/function names
        preg_match_all('/(?:export\s+)?(?:default\s+)?(?:function|const|class)\s+(\w+)/', $content, $matches);
        $names = $matches[1] ?? [];

        if (empty($names)) {
            return;
        }

        $name = $names[0]; // Use first found name
        $type = $this->determineJsNodeType($relativePath, $name);
        $layer = 'frontend';

        // Extract imports
        preg_match_all('/import\s+.*?from\s+[\'"]([^\'"]+)[\'"]/', $content, $importMatches);
        $dependencies = $importMatches[1] ?? [];

        $nodeId = $this->generateNodeId(null, $name . '_' . basename($filePath));

        $node = Node::create([
            'repository_id' => $this->repository->id,
            'node_id' => $nodeId,
            'name' => $name,
            'type' => $type,
            'layer' => $layer,
            'file_path' => $relativePath,
            'description' => $this->extractDescription($content),
            'dependencies' => $dependencies,
            'complexity_score' => $this->calculateComplexity($content),
            'metadata' => [
                'line_count' => substr_count($content, "\n") + 1,
                'file_type' => pathinfo($filePath, PATHINFO_EXTENSION),
            ],
        ]);

        $this->nodes[$nodeId] = $node;
    }

    /**
     * Parse database migration files
     */
    protected function parseDatabaseFiles(): void
    {
        $migrationFiles = $this->findFiles('*.php', [], 'database/migrations');

        foreach ($migrationFiles as $file) {
            $this->parseMigrationFile($file);
        }
    }

    /**
     * Parse migration file
     */
    protected function parseMigrationFile(string $filePath): void
    {
        $content = file_get_contents($filePath);
        $relativePath = $this->getRelativePath($filePath);

        // Extract table name
        preg_match('/Schema::create\([\'"](\w+)[\'"]/', $content, $tableMatch);
        $tableName = $tableMatch[1] ?? basename($filePath, '.php');

        $nodeId = $this->generateNodeId('database', $tableName);

        $node = Node::create([
            'repository_id' => $this->repository->id,
            'node_id' => $nodeId,
            'name' => $tableName,
            'type' => 'table',
            'layer' => 'database',
            'file_path' => $relativePath,
            'description' => "Database table: {$tableName}",
            'metadata' => [
                'migration_file' => basename($filePath),
            ],
        ]);

        $this->nodes[$nodeId] = $node;
    }

    /**
     * Parse configuration files
     */
    protected function parseConfigFiles(): void
    {
        $configFiles = $this->findFiles('*.php', [], 'config');

        foreach ($configFiles as $file) {
            $relativePath = $this->getRelativePath($file);
            $configName = basename($file, '.php');

            $nodeId = $this->generateNodeId('config', $configName);

            $node = Node::create([
                'repository_id' => $this->repository->id,
                'node_id' => $nodeId,
                'name' => $configName,
                'type' => 'config',
                'layer' => 'infrastructure',
                'file_path' => $relativePath,
                'description' => "Configuration: {$configName}",
            ]);

            $this->nodes[$nodeId] = $node;
        }
    }

    /**
     * Parse route files
     */
    protected function parseRouteFiles(): void
    {
        $routeFiles = $this->findFiles('*.php', [], 'routes');

        foreach ($routeFiles as $file) {
            $this->parseRouteFile($file);
        }
    }

    /**
     * Parse route file
     */
    protected function parseRouteFile(string $filePath): void
    {
        $content = file_get_contents($filePath);
        $relativePath = $this->getRelativePath($filePath);

        // Extract routes
        preg_match_all('/Route::(?:get|post|put|patch|delete|any)\([\'"]([^\'"]+)[\'"]/', $content, $routeMatches);
        $routes = $routeMatches[1] ?? [];

        foreach ($routes as $route) {
            $nodeId = $this->generateNodeId('route', str_replace('/', '_', $route));

            $node = Node::create([
                'repository_id' => $this->repository->id,
                'node_id' => $nodeId,
                'name' => $route,
                'type' => 'api_route',
                'layer' => 'api',
                'file_path' => $relativePath,
                'description' => "API Route: {$route}",
                'metadata' => [
                    'route_file' => basename($filePath),
                ],
            ]);

            $this->nodes[$nodeId] = $node;
        }
    }

    /**
     * Build relationships between nodes
     */
    protected function buildRelationships(): void
    {
        foreach ($this->nodes as $node) {
            if (!empty($node->dependencies)) {
                foreach ($node->dependencies as $dependency) {
                    $targetNode = $this->findNodeByDependency($dependency);
                    
                    if ($targetNode) {
                        Edge::create([
                            'repository_id' => $this->repository->id,
                            'source_node_id' => $node->id,
                            'target_node_id' => $targetNode->id,
                            'relationship_type' => 'depends_on',
                            'description' => "{$node->name} depends on {$targetNode->name}",
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Find files matching pattern
     */
    protected function findFiles(string $pattern, array $excludeDirs = [], ?string $subPath = null): array
    {
        $searchPath = $subPath ? $this->basePath . '/' . $subPath : $this->basePath;
        
        if (!is_dir($searchPath)) {
            return [];
        }

        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($searchPath, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $filePath = $file->getPathname();
                
                // Check if file should be excluded
                $shouldExclude = false;
                foreach ($excludeDirs as $excludeDir) {
                    if (strpos($filePath, '/' . $excludeDir . '/') !== false) {
                        $shouldExclude = true;
                        break;
                    }
                }

                if (!$shouldExclude && fnmatch($pattern, $file->getFilename(), FNM_CASEFOLD)) {
                    $files[] = $filePath;
                }
            }
        }

        return $files;
    }

    /**
     * Helper methods
     */
    protected function getRelativePath(string $fullPath): string
    {
        return str_replace($this->basePath . '/', '', $fullPath);
    }

    protected function generateNodeId(?string $namespace, string $name): string
    {
        return md5(($namespace ?? '') . '::' . $name);
    }

    protected function determinePhpNodeType(string $path, string $className): string
    {
        if (str_contains($path, 'Controller')) return 'controller';
        if (str_contains($path, 'Model')) return 'model';
        if (str_contains($path, 'Service')) return 'service';
        if (str_contains($path, 'Middleware')) return 'middleware';
        if (str_contains($path, 'Job')) return 'job';
        if (str_contains($path, 'Event')) return 'event';
        if (str_contains($path, 'Listener')) return 'listener';
        if (str_contains($path, 'Command')) return 'command';
        if (str_contains($path, 'Policy')) return 'policy';
        if (str_contains($path, 'Request')) return 'request';
        if (str_contains($path, 'Resource')) return 'resource';
        if (str_contains($path, 'Provider')) return 'provider';
        
        return 'other';
    }

    protected function determineJsNodeType(string $path, string $name): string
    {
        if (str_contains($path, 'component')) return 'component';
        if (str_contains($path, 'page')) return 'view';
        if (str_contains($path, 'hook')) return 'helper';
        if (str_contains($path, 'util')) return 'helper';
        
        return 'component';
    }

    protected function determineLayer(string $path, string $type): string
    {
        if (in_array($type, ['component', 'view'])) return 'frontend';
        if (in_array($type, ['api_route', 'route'])) return 'api';
        if (in_array($type, ['controller', 'service', 'middleware'])) return 'backend';
        if (in_array($type, ['model', 'table', 'migration'])) return 'database';
        if (in_array($type, ['config', 'provider'])) return 'infrastructure';
        
        return 'other';
    }

    protected function extractDescription(string $content): ?string
    {
        // Try to extract docblock comment
        preg_match('/\/\*\*\s*\n\s*\*\s*(.+?)\n/', $content, $match);
        return $match[1] ?? null;
    }

    protected function calculateComplexity(string $content): int
    {
        // Simple complexity calculation based on control structures
        $complexity = 1;
        $complexity += substr_count($content, 'if ');
        $complexity += substr_count($content, 'else');
        $complexity += substr_count($content, 'for ');
        $complexity += substr_count($content, 'foreach ');
        $complexity += substr_count($content, 'while ');
        $complexity += substr_count($content, 'case ');
        $complexity += substr_count($content, 'catch ');
        
        return $complexity;
    }

    protected function findNodeByDependency(string $dependency): ?Node
    {
        // Try to find node by namespace or class name
        foreach ($this->nodes as $node) {
            if ($node->namespace === $dependency || $node->class_name === basename(str_replace('\\', '/', $dependency))) {
                return $node;
            }
        }
        
        return null;
    }
}

// Made with Bob
