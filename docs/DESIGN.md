# AGA System Design Documentation

## Overview

This document provides comprehensive design specifications for the AGA (Architecture Governance Agent) system, covering architecture patterns, component design, data structures, API contracts, and UI/UX guidelines.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Design](#component-design)
3. [Data Structures](#data-structures)
4. [API Design](#api-design)
5. [UI/UX Design](#uiux-design)
6. [Security Design](#security-design)
7. [Performance Design](#performance-design)
8. [Error Handling](#error-handling)

---

## System Architecture

### Architectural Pattern

AGA follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  (Next.js Frontend - React Components)                   │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   API Gateway Layer                      │
│  (Next.js API Routes - Proxy & Transformation)           │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  (Laravel Controllers - Business Logic)                  │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  (Laravel Services - Domain Logic)                       │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  (Eloquent Models - Data Access)                         │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  Persistence Layer                       │
│  (PostgreSQL Database)                                   │
└─────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Interface Segregation**: Clients shouldn't depend on interfaces they don't use
4. **Single Responsibility**: Each class/component has one reason to change
5. **Open/Closed**: Open for extension, closed for modification

### Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend Framework | Next.js 14 | SSR, API routes, excellent DX |
| UI Library | React 18 | Component-based, large ecosystem |
| Graph Visualization | React Flow | Performant, customizable, interactive |
| Styling | Tailwind CSS | Utility-first, consistent design |
| Backend Framework | Laravel 11 | Robust, batteries-included, PHP ecosystem |
| Database | PostgreSQL 16 | ACID compliance, JSON support, performance |
| Authentication | Laravel Sanctum | Token-based, SPA-friendly |
| Queue System | Laravel Queues | Built-in, reliable, scalable |
| AI Integration | IBM Watsonx | Enterprise-grade, customizable |

---

## Component Design

### Frontend Components

#### 1. Architecture Visualization Component

**Purpose**: Main graph visualization canvas

**Props**:
```typescript
interface ArchitectureVisualizationProps {
  repositoryId: number;
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  highlightedNodeIds: string[];
  onNodeSelect: (nodeId: string | null) => void;
  onNodeClick: (node: Node) => void;
}
```

**State Management**:
- Local state for viewport (zoom, pan)
- Props for nodes/edges (controlled by parent)
- React Flow internal state for interactions

**Key Features**:
- Smooth zoom/pan animations
- Node selection with visual feedback
- Edge highlighting on hover
- Layer-based coloring
- Minimap for navigation

#### 2. AI Oracle Panel Component

**Purpose**: Natural language query interface

**Props**:
```typescript
interface AIOraclePanelProps {
  repositoryId: number;
  onResponse: (answer: string) => void;
  onHighlight: (nodeIds: string[]) => void;
  isLoading?: boolean;
}
```

**State Management**:
- Query input state
- Loading state
- Response history
- Suggested queries

**Key Features**:
- Auto-complete suggestions
- Query history
- Loading indicators
- Response formatting (markdown)
- Node highlighting integration

#### 3. Dependency Panel Component

**Purpose**: Display blast radius and impact analysis

**Props**:
```typescript
interface DependencyPanelProps {
  node: Node | null;
  upstream: Node[];
  downstream: Node[];
  onNodeClick: (nodeId: string) => void;
}
```

**Key Features**:
- Impact summary metrics
- Upstream/downstream lists
- Intent notes display
- Security warnings
- Quick navigation to related nodes

#### 4. Layer Legend Component

**Purpose**: Visual guide for node layers

**Design**:
```typescript
interface LayerInfo {
  name: string;
  color: string;
  count: number;
  description: string;
}
```

**Position**: Bottom-left corner with backdrop blur

**Styling**:
- Glassmorphism effect
- Smooth fade-in animation
- Responsive sizing
- Collapsible on mobile

### Backend Components

#### 1. Repository Controller

**Responsibilities**:
- Handle repository CRUD operations
- Coordinate repository analysis
- Serve graph data
- Manage repository status

**Key Methods**:
```php
public function index(): JsonResponse
public function store(Request $request): JsonResponse
public function show(int $id): JsonResponse
public function graph(int $id): JsonResponse
public function status(int $id): JsonResponse
public function rescan(int $id): JsonResponse
public function destroy(int $id): JsonResponse
```

#### 2. Oracle Controller

**Responsibilities**:
- Process natural language queries
- Generate intelligent responses
- Highlight relevant nodes
- Cache responses

**Key Methods**:
```php
public function query(Request $request): JsonResponse
public function blastRadius(Request $request): JsonResponse
public function history(int $repositoryId): JsonResponse
```

**Response Generation Strategy**:
1. Check cache for identical query
2. If cached, return immediately
3. If not cached, build context from graph
4. Query IBM Bob with system prompt
5. Parse response and extract node references
6. Cache result
7. Return response with highlighted nodes

#### 3. Repository Parser Service

**Responsibilities**:
- Analyze code structure
- Extract components
- Build dependency graph
- Classify layers

**Parsing Strategy**:
```php
class RepositoryParserService
{
    public function parse(string $path): array
    {
        $nodes = [];
        $edges = [];
        
        // 1. Scan directory structure
        $files = $this->scanDirectory($path);
        
        // 2. Parse each file
        foreach ($files as $file) {
            $parser = $this->getParser($file);
            $result = $parser->parse($file);
            $nodes = array_merge($nodes, $result['nodes']);
            $edges = array_merge($edges, $result['edges']);
        }
        
        // 3. Build relationships
        $edges = array_merge($edges, $this->buildRelationships($nodes));
        
        return compact('nodes', 'edges');
    }
}
```

**File Type Parsers**:
- `PHPParser`: Controllers, Models, Services
- `JavaScriptParser`: Components, Hooks
- `TypeScriptParser`: TypeScript files
- `RouteParser`: API routes
- `MigrationParser`: Database migrations

#### 4. GitHub Service

**Responsibilities**:
- Interact with GitHub API
- Clone repositories
- Fetch metadata
- Handle OAuth

**Key Methods**:
```php
public function getRepository(string $owner, string $repo): array
public function cloneRepository(string $url, string $path): bool
public function fetchMetadata(string $owner, string $repo): array
public function validateAccess(string $url): bool
```

---

## Data Structures

### Graph Data Model

#### Node Structure

```typescript
interface Node {
  id: string;                    // Unique hash identifier
  type: 'custom';                // React Flow node type
  position: { x: number; y: number };
  data: {
    id: string;
    label: string;               // Display name
    type: NodeType;              // Component type
    layer: NodeLayer;            // Architectural layer
    filePath: string;            // Source file path
    description?: string;        // Component description
    metadata: NodeMetadata;      // Additional metadata
    dependencies: {
      upstream: string[];        // Consumers
      downstream: string[];      // Dependencies
    };
  };
  style?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    border?: string;
  };
}
```

#### Node Types

```typescript
type NodeType = 
  | 'controller'
  | 'model'
  | 'service'
  | 'middleware'
  | 'component'
  | 'view'
  | 'helper'
  | 'table'
  | 'migration'
  | 'api_route'
  | 'route'
  | 'config'
  | 'provider';
```

#### Node Layers

```typescript
type NodeLayer = 
  | 'frontend'      // UI components, pages
  | 'api'           // API routes, endpoints
  | 'backend'       // Controllers, services
  | 'database'      // Models, tables
  | 'infrastructure' // Config, providers
  | 'middleware';   // Middleware components
```

#### Node Metadata

```typescript
interface NodeMetadata {
  lineCount?: number;
  complexity?: 'low' | 'medium' | 'high';
  lastModified?: string;
  author?: string;
  intentNote?: string;          // Architectural decision note
  securityLevel?: 'public' | 'protected' | 'private';
  testCoverage?: number;
}
```

#### Edge Structure

```typescript
interface Edge {
  id: string;                    // Unique identifier
  source: string;                // Source node ID
  target: string;                // Target node ID
  type: EdgeType;                // Relationship type
  animated?: boolean;            // Animation state
  style?: {
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
  };
  data?: {
    weight?: number;             // Relationship strength
    label?: string;              // Edge label
  };
}
```

#### Edge Types

```typescript
type EdgeType = 
  | 'smoothstep'    // Default smooth edge
  | 'straight'      // Direct line
  | 'step';         // Step edge
```

### Database Schema

#### repositories Table

```sql
CREATE TABLE repositories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    language VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    node_count INTEGER DEFAULT 0,
    edge_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, full_name)
);
```

#### nodes Table

```sql
CREATE TABLE nodes (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    layer VARCHAR(100) NOT NULL,
    file_path TEXT,
    description TEXT,
    metadata JSONB,
    position_x FLOAT,
    position_y FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, node_id)
);

CREATE INDEX idx_nodes_repository_id ON nodes(repository_id);
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_layer ON nodes(layer);
```

#### edges Table

```sql
CREATE TABLE edges (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    source_node_id VARCHAR(255) NOT NULL,
    target_node_id VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    weight INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, source_node_id, target_node_id, type)
);

CREATE INDEX idx_edges_repository_id ON edges(repository_id);
CREATE INDEX idx_edges_source ON edges(source_node_id);
CREATE INDEX idx_edges_target ON edges(target_node_id);
```

#### ai_cache Table

```sql
CREATE TABLE ai_cache (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    query_hash VARCHAR(64) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    highlighted_nodes JSONB,
    metadata JSONB,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, query_hash)
);

CREATE INDEX idx_ai_cache_repository_id ON ai_cache(repository_id);
CREATE INDEX idx_ai_cache_query_hash ON ai_cache(query_hash);
```

---

## API Design

### RESTful API Conventions

**Base URL**: `${APP_URL}/api`

**Authentication**: Bearer token in `Authorization` header

**Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

**Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": ["Error message"]
    }
  }
}
```

### API Endpoints

#### Repository Endpoints

```
GET    /api/repositories              List all repositories
POST   /api/repositories/connect      Connect new repository
GET    /api/repositories/{id}         Get repository details
GET    /api/repositories/{id}/graph   Get graph data
GET    /api/repositories/{id}/status  Get analysis status
POST   /api/repositories/{id}/rescan  Trigger rescan
DELETE /api/repositories/{id}         Delete repository
```

#### AI Oracle Endpoints

```
POST   /api/oracle                    Query AI Oracle
POST   /api/ai/query                  Alternative query endpoint
POST   /api/ai/blast-radius           Get blast radius
GET    /api/ai/history/{repoId}       Get query history
GET    /api/ai/status                 Check AI service status
```

#### Authentication Endpoints

```
POST   /api/auth/register             Register new user
POST   /api/auth/login                Login user
POST   /api/auth/logout               Logout user
GET    /api/auth/user                 Get current user
POST   /api/auth/forgot-password      Request password reset
POST   /api/auth/reset-password       Reset password
GET    /api/auth/github               Get GitHub OAuth URL
GET    /api/auth/github/callback      Handle OAuth callback
POST   /api/auth/github/disconnect    Disconnect GitHub
```

### Request/Response Examples

#### Connect Repository

**Request**:
```http
POST /api/repositories/connect
Content-Type: application/json
Authorization: Bearer {token}

{
  "url": "https://github.com/laravel/laravel"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Repository connection initiated",
  "data": {
    "id": 1,
    "name": "laravel",
    "full_name": "laravel/laravel",
    "owner": "laravel",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Query Oracle

**Request**:
```http
POST /api/oracle
Content-Type: application/json
Authorization: Bearer {token}

{
  "query": "Why is there a 500ms delay in the auth controller?",
  "repo": "my-app"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "answer": "The AuthController contains an intentional 500ms delay...",
    "highlightedNodeIds": ["auth-controller", "session-service"],
    "confidence": 0.95,
    "cached": false,
    "metadata": {
      "model": "ibm/granite-13b-chat-v2",
      "tokens_used": 1234,
      "response_time": 2.5
    }
  }
}
```

#### Get Graph Data

**Request**:
```http
GET /api/repositories/1/graph
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "auth-controller",
        "type": "custom",
        "position": { "x": 400, "y": 200 },
        "data": {
          "label": "AuthController",
          "type": "controller",
          "layer": "backend",
          "filePath": "app/Http/Controllers/AuthController.php",
          "metadata": {
            "lineCount": 245,
            "complexity": "high",
            "intentNote": "Contains 500ms delay for race condition prevention"
          },
          "dependencies": {
            "upstream": ["api-route-auth"],
            "downstream": ["user-service", "session-service"]
          }
        }
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "api-route-auth",
        "target": "auth-controller",
        "type": "smoothstep"
      }
    ]
  }
}
```

---

## UI/UX Design

### Design System

#### Color Palette

**Layer Colors**:
```css
--layer-frontend: #3b82f6;    /* Blue */
--layer-api: #10b981;          /* Green */
--layer-backend: #f59e0b;      /* Amber */
--layer-service: #8b5cf6;      /* Purple */
--layer-database: #ef4444;     /* Red */
--layer-middleware: #ec4899;   /* Pink */
```

**UI Colors**:
```css
--background: #0a0a0a;         /* Deep black */
--foreground: #fafafa;         /* Off-white */
--primary: #3b82f6;            /* Blue */
--secondary: #6b7280;          /* Gray */
--accent: #8b5cf6;             /* Purple */
--muted: #1f2937;              /* Dark gray */
--border: #374151;             /* Border gray */
```

**Status Colors**:
```css
--success: #10b981;            /* Green */
--warning: #f59e0b;            /* Amber */
--error: #ef4444;              /* Red */
--info: #3b82f6;               /* Blue */
```

#### Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

#### Spacing

```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-12: 3rem;    /* 48px */
```

#### Animations

```css
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;

--animation-fade-in: fadeIn 300ms ease;
--animation-slide-up: slideUp 300ms ease;
--animation-pulse: pulse 2s infinite;
```

### Component Styling

#### Node Styling

**Default Node**:
```css
.node {
  width: 180px;
  height: 80px;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid var(--border);
  background: var(--background);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 300ms ease;
}
```

**Selected Node**:
```css
.node.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2),
              0 8px 16px rgba(0, 0, 0, 0.2);
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
}
```

**Dimmed Node**:
```css
.node.dimmed {
  opacity: 0.2;
  filter: grayscale(0.5);
}
```

#### Edge Styling

**Default Edge**:
```css
.edge {
  stroke: var(--border);
  stroke-width: 1.5px;
  opacity: 0.4;
  transition: all 300ms ease;
}
```

**Active Edge**:
```css
.edge.active {
  stroke: var(--primary);
  stroke-width: 3px;
  opacity: 1;
  animation: dash 1s linear infinite;
}
```

#### Panel Styling

**Glass Morphism Effect**:
```css
.panel {
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Interaction Patterns

#### Node Selection
1. Click node → Highlight with glow
2. Show dependency panel
3. Dim unrelated nodes
4. Animate edges
5. Update URL with node ID

#### Oracle Query
1. Type query → Show suggestions
2. Click "Ask Bob" → Show loading spinner
3. Response appears → Fade in animation
4. Nodes highlight → Smooth transition
5. Add to history

#### Blast Radius
1. Hover node → Show tooltip
2. Click node → Calculate dependencies
3. Highlight upstream (green)
4. Highlight downstream (blue)
5. Show impact metrics

### Responsive Design

**Breakpoints**:
```css
--mobile: 640px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

**Mobile Adaptations**:
- Collapsible panels
- Bottom sheet for dependencies
- Simplified graph controls
- Touch-optimized interactions
- Reduced node sizes

---

## Security Design

### Authentication Flow

```
User Login
    ↓
Validate Credentials
    ↓
Generate JWT Token
    ↓
Store in localStorage
    ↓
Include in API Requests
    ↓
Validate Token
    ↓
Return Protected Data
```

### Authorization Levels

1. **Public**: Unauthenticated access
   - Login, Register, Password Reset

2. **Authenticated**: Logged-in users
   - View own repositories
   - Query AI Oracle
   - Manage profile

3. **Admin**: System administrators
   - View all repositories
   - Manage users
   - System configuration

### Security Measures

**Input Validation**:
- Sanitize all user inputs
- Validate URL formats
- Escape SQL queries
- Prevent XSS attacks

**Token Security**:
- JWT with expiration
- Refresh token rotation
- Secure storage (httpOnly cookies in production)
- Token revocation on logout

**API Security**:
- Rate limiting (60 requests/minute)
- CORS configuration
- CSRF protection
- SQL injection prevention

**Data Protection**:
- Encrypt GitHub tokens
- Hash passwords (bcrypt)
- Secure environment variables
- HTTPS in production

---

## Performance Design

### Optimization Strategies

#### Frontend Optimization

**Code Splitting**:
```typescript
// Lazy load heavy components
const ArchitectureVisualization = lazy(() => 
  import('./components/architecture-visualization')
);
```

**Memoization**:
```typescript
// Prevent unnecessary re-renders
const MemoizedNode = memo(CustomNode, (prev, next) => {
  return prev.data.id === next.data.id &&
         prev.data.highlighted === next.data.highlighted;
});
```

**Virtual Scrolling**:
- Use react-window for large lists
- Render only visible nodes
- Lazy load off-screen content

#### Backend Optimization

**Database Indexing**:
```sql
CREATE INDEX idx_nodes_repository_id ON nodes(repository_id);
CREATE INDEX idx_edges_source_target ON edges(source_node_id, target_node_id);
```

**Query Optimization**:
```php
// Eager load relationships
$repository = Repository::with(['nodes', 'edges'])->find($id);

// Use select to limit columns
$nodes = Node::select('id', 'label', 'type')->get();
```

**Caching Strategy**:
```php
// Cache graph data for 1 hour
Cache::remember("graph:{$repoId}", 3600, function () use ($repoId) {
    return $this->buildGraph($repoId);
});
```

#### Queue Optimization

**Job Prioritization**:
```php
// High priority for small repos
CloneAndAnalyzeRepository::dispatch($repo)
    ->onQueue($repo->size < 1000 ? 'high' : 'default');
```

**Batch Processing**:
```php
// Process nodes in batches
Node::chunk(100, function ($nodes) {
    foreach ($nodes as $node) {
        $this->processNode($node);
    }
});
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load | < 2s | First Contentful Paint |
| Graph Render | < 1s | Time to Interactive |
| API Response | < 200ms | Server Response Time |
| AI Query | < 5s | End-to-end Response |
| Repository Analysis | < 5min | For repos < 10k files |

---

## Error Handling

### Error Categories

1. **Validation Errors**: Invalid input data
2. **Authentication Errors**: Invalid credentials
3. **Authorization Errors**: Insufficient permissions
4. **Not Found Errors**: Resource doesn't exist
5. **Server Errors**: Internal server issues
6. **External Service Errors**: GitHub API, IBM Bob failures

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
  };
}
```

### Error Handling Strategy

**Frontend**:
```typescript
try {
  const response = await api.queryOracle(query);
  // Handle success
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    toast.error('Please check your input');
  } else if (error.code === 'UNAUTHORIZED') {
    router.push('/login');
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

**Backend**:
```php
try {
    $repository = $this->repositoryService->connect($url);
    return response()->json([
        'success' => true,
        'data' => $repository
    ]);
} catch (ValidationException $e) {
    return response()->json([
        'success' => false,
        'error' => [
            'code' => 'VALIDATION_ERROR',
            'message' => 'Validation failed',
            'details' => $e->errors()
        ]
    ], 422);
} catch (\Exception $e) {
    Log::error('Repository connection failed', [
        'url' => $url,
        'error' => $e->getMessage()
    ]);
    
    return response()->json([
        'success' => false,
        'error' => [
            'code' => 'SERVER_ERROR',
            'message' => 'Failed to connect repository'
        ]
    ], 500);
}
```

### User-Friendly Error Messages

| Error Code | User Message |
|------------|--------------|
| VALIDATION_ERROR | Please check your input and try again |
| UNAUTHORIZED | Please log in to continue |
| FORBIDDEN | You don't have permission to access this |
| NOT_FOUND | The requested resource was not found |
| RATE_LIMIT | Too many requests. Please try again later |
| SERVER_ERROR | Something went wrong. Our team has been notified |
| GITHUB_ERROR | Unable to connect to GitHub. Please try again |
| AI_ERROR | AI service is temporarily unavailable |

---

## Design Patterns

### Frontend Patterns

**1. Container/Presenter Pattern**:
```typescript
// Container (logic)
function RepositoryPageContainer() {
  const { data, loading } = useRepository(id);
  return <RepositoryPage data={data} loading={loading} />;
}

// Presenter (UI)
function RepositoryPage({ data, loading }) {
  if (loading) return <Spinner />;
  return <div>{/* Render UI */}</div>;
}
```

**2. Custom Hooks Pattern**:
```typescript
function useArchitectureData(repositoryId: number) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchGraphData(repositoryId).then(data => {
      setNodes(data.nodes);
      setEdges(data.edges);
      setLoading(false);
    });
  }, [repositoryId]);
  
  return { nodes, edges, loading };
}
```

**3. Compound Components Pattern**:
```typescript
<SearchPanel>
  <SearchPanel.Header />
  <SearchPanel.Tabs>
    <SearchPanel.Tab name="oracle">
      <OraclePanel />
    </SearchPanel.Tab>
    <SearchPanel.Tab name="explorer">
      <ExplorerPanel />
    </SearchPanel.Tab>
  </SearchPanel.Tabs>
</SearchPanel>
```

### Backend Patterns

**1. Service Layer Pattern**:
```php
class RepositoryService
{
    public function __construct(
        private GitHubService $github,
        private ParserService $parser
    ) {}
    
    public function connect(string $url): Repository
    {
        $metadata = $this->github->fetchMetadata($url);
        $repository = Repository::create($metadata);
        CloneAndAnalyzeRepository::dispatch($repository);
        return $repository;
    }
}
```

**2. Repository Pattern**:
```php
interface RepositoryInterface
{
    public function find(int $id): ?Repository;
    public function findByFullName(string $fullName): ?Repository;
    public function create(array $data): Repository;
    public function update(int $id, array $data): Repository;
    public function delete(int $id): bool;
}
```

**3. Strategy Pattern**:
```php
interface ParserStrategy
{
    public function canParse(string $file): bool;
    public function parse(string $file): array;
}

class PHPParser implements ParserStrategy { /* ... */ }
class JavaScriptParser implements ParserStrategy { /* ... */ }
class TypeScriptParser implements ParserStrategy { /* ... */ }
```

---

## Testing Strategy

### Frontend Testing

**Unit Tests** (Jest):
```typescript
describe('useFlowInteractions', () => {
  it('should highlight selected node', () => {
    const { result } = renderHook(() => useFlowInteractions({
      selectedNode: 'node-1',
      setNodes: mockSetNodes,
      setEdges: mockSetEdges
    }));
    
    expect(mockSetNodes).toHaveBeenCalled();
  });
});
```

**Integration Tests** (React Testing Library):
```typescript
test('clicking node shows dependency panel', async () => {
  render(<ArchitectureVisualization {...props} />);
  
  const node = screen.getByText('AuthController');
  fireEvent.click(node);
  
  expect(screen.getByText('Dependencies')).toBeInTheDocument();
});
```

**E2E Tests** (Playwright):
```typescript
test('complete oracle query flow', async ({ page }) => {
  await page.goto('/repos/1');
  await page.fill('[data-testid="oracle-input"]', 'Why 500ms delay?');
  await page.click('[data-testid="ask-button"]');
  
  await expect(page.locator('[data-testid="oracle-response"]'))
    .toContainText('intentional delay');
});
```

### Backend Testing

**Unit Tests** (PHPUnit):
```php
public function test_repository_parser_extracts_nodes()
{
    $parser = new RepositoryParserService();
    $result = $parser->parse(__DIR__ . '/fixtures/sample-repo');
    
    $this->assertNotEmpty($result['nodes']);
    $this->assertArrayHasKey('label', $result['nodes'][0]);
}
```

**Feature Tests**:
```php
public function test_user_can_connect_repository()
{
    $response = $this->actingAs($user)
        ->postJson('/api/repositories/connect', [
            'url' => 'https://github.com/laravel/laravel'
        ]);
    
    $response->assertStatus(200)
        ->assertJsonStructure(['success', 'data']);
}
```

---

## Deployment Design

### Environment Configuration

**Development**:
- Docker Compose
- Hot reload enabled
- Debug mode on
- Local database

**Staging**:
- Kubernetes cluster
- Production-like data
- Performance monitoring
- Integration testing

**Production**:
- Kubernetes cluster
- Auto-scaling enabled
- CDN for static assets
- Database replication
- Monitoring and alerting

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd api && php artisan test
          cd client && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          kubectl apply -f k8s/
          kubectl rollout status deployment/aga-api
```

---

## Conclusion

This design document provides a comprehensive blueprint for the AGA system. It should be treated as a living document and updated as the system evolves.

**Key Takeaways**:
1. Layered architecture for separation of concerns
2. RESTful API design with consistent patterns
3. Component-based frontend with React Flow
4. Service-oriented backend with Laravel
5. Performance optimization at every layer
6. Comprehensive error handling
7. Security-first approach
8. Scalable deployment strategy

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-17  
**Maintained By**: AGA Development Team  
**Status**: Living Document
