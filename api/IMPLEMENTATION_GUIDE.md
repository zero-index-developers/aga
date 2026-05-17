# AGA Backend Implementation Guide

## Overview

This document provides a comprehensive guide to implementing and using the AGA (Architecture Governance Agent) backend API, specifically focusing on GitHub repository connection and analysis.

## Architecture

The backend is built with Laravel and follows a service-oriented architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  /api/repositories/* | /api/ai/*                            │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐    ┌──────────────────────┐
│ RepositoryController │    │    AIController      │
└──────────────────────┘    └──────────────────────┘
                │                       │
        ┌───────┴───────┐       ┌──────┴──────┐
        ▼               ▼       ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ GitHubService│ │ ParserService│ │ IBMBobService│
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        └───────────────┴───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │  Database (PostgreSQL)        │
        │  - repositories               │
        │  - nodes                      │
        │  - edges                      │
        │  - ai_cache                   │
        └───────────────────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
composer install
```

This will install:
- `knplabs/github-api` - GitHub API client
- `php-http/guzzle7-adapter` - HTTP adapter for GitHub API
- `symfony/process` - For running Git commands

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=database
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# GitHub API
GITHUB_TOKEN=your_github_token
GITHUB_API_URL=https://api.github.com
REPO_STORAGE_PATH=storage/repositories

# IBM Bob AI
IBM_BOB_ENABLED=true
IBM_BOB_API_KEY=your_ibm_bob_api_key
IBM_BOB_API_URL=https://your-ibm-endpoint
IBM_BOB_MODEL=your_model_name
```

**Getting a GitHub Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (for private repos) or `public_repo` (for public only)
4. Copy the token to your `.env` file

### 3. Run Migrations

```bash
php artisan migrate
```

This creates four main tables:
- `repositories` - Stores GitHub repository metadata
- `nodes` - Stores architectural components (controllers, models, etc.)
- `edges` - Stores relationships between nodes
- `ai_cache` - Caches AI responses for performance

### 4. Start the Queue Worker

The repository analysis runs asynchronously via Laravel queues:

```bash
php artisan queue:work --tries=3 --timeout=600
```

## API Endpoints

### Repository Management

#### 1. List Repositories
```http
GET /api/repositories
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "my-app",
      "full_name": "owner/my-app",
      "owner": "owner",
      "status": "completed",
      "language": "PHP",
      "last_scanned_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2. Connect Repository
```http
POST /api/repositories/connect
Content-Type: application/json

{
  "url": "https://github.com/owner/repo"
}
```

Supported URL formats:
- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`
- `git@github.com:owner/repo.git`
- `owner/repo`

Response:
```json
{
  "success": true,
  "message": "Repository connection initiated",
  "data": {
    "id": 1,
    "name": "repo",
    "full_name": "owner/repo",
    "status": "pending"
  }
}
```

**Status Flow:**
1. `pending` - Repository record created
2. `cloning` - Git clone in progress
3. `analyzing` - Parsing code structure
4. `completed` - Ready for queries
5. `failed` - Error occurred (check `error_message`)

#### 3. Get Repository Details
```http
GET /api/repositories/{id}
```

Response includes:
- Repository metadata
- Statistics (node count, edge count)
- Breakdown by layer and type

#### 4. Get Graph Data
```http
GET /api/repositories/{id}/graph
```

Returns nodes and edges for visualization:
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "node_hash_123",
        "label": "UserController",
        "type": "controller",
        "layer": "backend",
        "filePath": "app/Http/Controllers/UserController.php"
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node_hash_123",
        "target": "node_hash_456",
        "type": "depends_on",
        "weight": 1
      }
    ]
  }
}
```

#### 5. Check Repository Status
```http
GET /api/repositories/{id}/status
```

#### 6. Rescan Repository
```http
POST /api/repositories/{id}/rescan
```

Triggers a fresh analysis of the repository.

#### 7. Delete Repository
```http
DELETE /api/repositories/{id}
```

Removes repository, all nodes, edges, and local files.

### AI Oracle

#### 1. Query AI
```http
POST /api/ai/query
Content-Type: application/json

{
  "repository_id": 1,
  "question": "Why is there a 500ms delay in the User Auth controller?",
  "context": "Optional additional context"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "answer": "The 500ms delay was added in 2024 to prevent race conditions...",
    "highlighted_nodes": ["node_hash_123", "node_hash_456"],
    "cached": false,
    "model": "ibm/granite-13b-chat-v2",
    "tokens_used": 1234,
    "response_time": 2.5
  }
}
```

**Demo Fallback Responses:**

If IBM Bob is not configured, the system provides intelligent demo responses for:
- Questions about "auth" or "authentication"
- Questions about "payment" or "payments"
- Questions about "database" or "PostgreSQL"
- Questions about "bypass" (security warnings)

#### 2. Get Blast Radius
```http
POST /api/ai/blast-radius
Content-Type: application/json

{
  "repository_id": 1,
  "node_id": "node_hash_123"
}
```

Returns:
- Upstream dependencies (what depends on this)
- Downstream dependencies (what this depends on)
- Impact summary
- Detailed affected nodes

#### 3. Get Query History
```http
GET /api/ai/history/{repositoryId}
```

Returns last 50 AI queries for the repository.

#### 4. Check AI Status
```http
GET /api/ai/status
```

## How It Works

### 1. Repository Connection Flow

```
User submits GitHub URL
        ↓
Parse URL to extract owner/repo
        ↓
Fetch metadata from GitHub API
        ↓
Create Repository record (status: pending)
        ↓
Dispatch CloneAndAnalyzeRepository job
        ↓
Job clones repo to storage/repositories/owner/repo
        ↓
RepositoryParserService analyzes files
        ↓
Creates Node records for each component
        ↓
Creates Edge records for dependencies
        ↓
Repository status → completed
```

### 2. Repository Parser

The `RepositoryParserService` analyzes different file types:

**PHP Files:**
- Controllers, Models, Services, Middleware
- Extracts: namespace, class name, methods, properties
- Determines layer: backend, api, database

**JavaScript/TypeScript:**
- Components, Pages, Hooks
- Extracts: component names, imports
- Layer: frontend

**Database:**
- Migration files
- Extracts: table names
- Layer: database

**Routes:**
- API route definitions
- Extracts: route paths, HTTP methods
- Layer: api

**Node Types:**
- `controller`, `model`, `service`, `middleware`
- `component`, `view`, `helper`
- `table`, `migration`
- `api_route`, `route`
- `config`, `provider`

**Layers:**
- `frontend` - UI components
- `api` - API routes
- `backend` - Business logic
- `database` - Data layer
- `infrastructure` - Config, providers

### 3. Relationship Building

The parser builds edges between nodes based on:
- `use` statements (PHP imports)
- `import` statements (JS/TS)
- Route → Controller connections
- Model → Table connections

**Edge Types:**
- `depends_on` - General dependency
- `uses` - Direct usage
- `extends` - Class inheritance
- `implements` - Interface implementation
- `calls` - Method calls
- `routes_to` - Route to controller

### 4. AI Integration

**With IBM Bob:**
1. User asks question
2. System builds context from repository structure
3. Sends to IBM Bob with system prompt
4. Extracts node references from response
5. Caches result for future queries

**Without IBM Bob (Demo Mode):**
- Provides pre-written responses for common questions
- Highlights relevant nodes
- Perfect for hackathon demos

**Caching Strategy:**
- Query hash based on question + repository
- Cached responses served instantly
- Hit count tracked for analytics
- Old cache cleared after 30 days

## Performance Optimization

### 1. Async Processing
- Repository cloning and analysis runs in background
- User gets immediate response
- Poll status endpoint for progress

### 2. Caching
- AI responses cached indefinitely
- Graph data cached at model level
- Reduces API calls and processing time

### 3. Selective Parsing
- Excludes vendor, node_modules, build directories
- Focuses on application code
- Faster analysis, smaller database

### 4. Database Indexing
- Indexes on frequently queried fields
- Optimized for graph traversal queries
- Fast blast radius calculations

## Testing

### Manual Testing

1. **Connect a Repository:**
```bash
curl -X POST "${APP_URL}/api/repositories/connect" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/laravel/laravel"}'
```

2. **Check Status:**
```bash
curl "${APP_URL}/api/repositories/1/status"
```

3. **Get Graph Data:**
```bash
curl "${APP_URL}/api/repositories/1/graph"
```

4. **Query AI:**
```bash
curl -X POST "${APP_URL}/api/ai/query" \
  -H "Content-Type: application/json" \
  -d '{
    "repository_id": 1,
    "question": "What is the authentication flow?"
  }'
```

### Automated Testing

```bash
php artisan test
```

## Troubleshooting

### Repository Clone Fails

**Issue:** "Failed to clone repository"

**Solutions:**
1. Check GitHub token has correct permissions
2. Verify repository is accessible
3. Check disk space in storage directory
4. Review logs: `storage/logs/laravel.log`

### Parser Fails

**Issue:** "Repository parsing failed"

**Solutions:**
1. Check file permissions on cloned directory
2. Verify PHP has enough memory (increase in php.ini)
3. Check for corrupted files in repository
4. Review parser logs for specific errors

### AI Queries Timeout

**Issue:** IBM Bob requests timeout

**Solutions:**
1. Increase timeout in config/services.php
2. Check IBM Bob API credentials
3. Verify network connectivity
4. Use demo mode for testing

### Queue Not Processing

**Issue:** Jobs stuck in pending

**Solutions:**
1. Ensure queue worker is running
2. Check database connection
3. Verify queue configuration in .env
4. Restart queue worker

## Production Deployment

### 1. Environment Setup
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2. Queue Management
Use Supervisor to keep queue worker running:

```ini
[program:aga-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/api/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
numprocs=2
user=www-data
```

### 3. Storage Permissions
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 4. Monitoring
- Monitor queue length: `php artisan queue:monitor`
- Check failed jobs: `php artisan queue:failed`
- Monitor disk space for cloned repositories
- Set up log rotation for Laravel logs

## Next Steps

1. **Install Dependencies:** Run `composer install`
2. **Configure Environment:** Set up `.env` with GitHub token
3. **Run Migrations:** Create database tables
4. **Start Queue Worker:** Process background jobs
5. **Test API:** Connect a test repository
6. **Integrate Frontend:** Connect Next.js client to API

## Support

For issues or questions:
- Check logs in `storage/logs/laravel.log`
- Review this guide
- Check Laravel documentation: https://laravel.com/docs
- GitHub API docs: https://docs.github.com/en/rest
