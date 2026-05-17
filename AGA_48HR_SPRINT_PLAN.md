# AGA 48-Hour Sprint Plan
**Architecture Governance Agent - "Google Maps for Software Architecture"**

## Team Structure
- **Backend Team 1** (1 person): Graph data model & dummy architecture dataset
- **Backend Team 2** (1 person): Oracle API endpoint & intelligent response engine
- **Frontend Team 1** (1 person): Graph visualization & blast-radius features
- **Frontend Team 2** (1 person): Oracle integration, panels & UI polish

---

## Executive Summary

Transform the current v0 scaffold into a demo-ready product that wins hackathons. The app already has Next.js, React Flow, dark UI, and basic graph rendering. The sprint focuses on:

1. **Unified Graph Data Model** - Single source of truth with rich metadata
2. **Intelligent Oracle System** - Deterministic AI responses that never fail
3. **Blast Radius Analysis** - Visual dependency tracking with impact metrics
4. **Demo-Ready Story** - Curated architecture with compelling narratives

---

## Phase 1: Foundation (Hours 1-8)

### BACKEND TEAM 1: Graph Data Model & Dummy Dataset

#### Task 1.1: Create Shared Graph Data Model
**File**: `api/app/Models/GraphNode.php` (conceptual - can be JSON)

```php
// Node structure with metadata
{
  "id": "auth-controller",
  "type": "controller",
  "layer": "api",
  "label": "AuthController",
  "path": "app/Http/Controllers/AuthController.php",
  "description": "Handles user authentication and session management",
  "metadata": {
    "lineCount": 245,
    "complexity": "medium",
    "lastModified": "2024-03-15",
    "author": "Senior Dev Team",
    "intentNote": "Added 500ms delay in 2024 to prevent race condition during concurrent login attempts"
  },
  "dependencies": {
    "upstream": ["api-route-auth", "middleware-auth"],
    "downstream": ["user-service", "session-service", "auth-database"]
  },
  "position": { "x": 400, "y": 200 }
}
```

**Layer Types**:
- `frontend` - React components, pages
- `api` - API routes, endpoints
- `controller` - Business logic controllers
- `service` - Service layer classes
- `database` - Database models, tables
- `middleware` - Authentication, validation middleware

**Color Coding**:
- Frontend: `#3b82f6` (Blue)
- API: `#10b981` (Green)
- Controller: `#f59e0b` (Amber)
- Service: `#8b5cf6` (Purple)
- Database: `#ef4444` (Red)
- Middleware: `#ec4899` (Pink)

#### Task 1.2: Build Dummy Architecture Dataset
**File**: `api/storage/app/demo-architecture.json`

Create a curated architecture with these key components:

**The Auth Delay Story**:
```json
{
  "id": "auth-controller",
  "label": "AuthController",
  "type": "controller",
  "layer": "api",
  "metadata": {
    "intentNote": "⚠️ CRITICAL: Contains intentional 500ms delay added in March 2024 to prevent race condition during concurrent database writes. DO NOT REMOVE without refactoring the session queuing system. See ticket #1247."
  }
}
```

**The Payment Service Story**:
```json
{
  "id": "payment-service",
  "label": "PaymentService",
  "type": "service",
  "layer": "service",
  "metadata": {
    "intentNote": "Integrates with Stripe API. Changing this impacts 3 API routes, 2 frontend components, and the transaction database model."
  },
  "dependencies": {
    "upstream": ["checkout-controller", "subscription-controller"],
    "downstream": ["payment-database", "stripe-api", "notification-service"]
  }
}
```

**The PostgreSQL Rationale**:
```json
{
  "id": "user-database",
  "label": "Users Table",
  "type": "database",
  "layer": "database",
  "metadata": {
    "intentNote": "Uses PostgreSQL for ACID compliance and complex query support. Migration from MySQL in 2023 due to transaction isolation requirements."
  }
}
```

**The Dangerous Middleware Bypass**:
```json
{
  "id": "auth-middleware",
  "label": "AuthMiddleware",
  "type": "middleware",
  "layer": "middleware",
  "metadata": {
    "intentNote": "⛔ SECURITY: All API routes MUST pass through this middleware. Bypassing it exposes unauthenticated endpoints."
  },
  "dependencies": {
    "downstream": ["auth-controller", "user-service", "session-database"]
  }
}
```

**Complete Dataset Structure** (15-20 nodes total):
- 3 Frontend components (UserDashboard, CheckoutPage, ProfileSettings)
- 4 API routes (auth, payment, user, admin)
- 4 Controllers (Auth, Payment, User, Admin)
- 3 Services (User, Payment, Notification)
- 3 Database tables (Users, Payments, Sessions)
- 2 Middleware (Auth, RateLimit)

**Deliverable**: `GET /api/repositories/graph` returns this complete dataset

---

### BACKEND TEAM 2: Oracle API Endpoint

#### Task 2.1: Create Oracle Controller
**File**: `api/app/Http/Controllers/Api/OracleController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OracleController extends Controller
{
    public function query(Request $request)
    {
        $query = $request->input('query', '');
        $repo = $request->input('repo', '');
        
        // Deterministic response engine
        $response = $this->generateResponse($query, $repo);
        
        return response()->json([
            'answer' => $response['answer'],
            'highlightedNodeIds' => $response['highlightedNodeIds'],
            'confidence' => $response['confidence'],
            'timestamp' => now()->toIso8601String()
        ]);
    }
    
    private function generateResponse(string $query, string $repo): array
    {
        $queryLower = strtolower($query);
        
        // Auth delay scenario
        if (str_contains($queryLower, '500ms') || 
            str_contains($queryLower, 'delay') || 
            str_contains($queryLower, 'auth') && str_contains($queryLower, 'slow')) {
            return [
                'answer' => "The AuthController contains an intentional 500ms delay added in March 2024 to prevent a race condition during concurrent login attempts. This delay ensures that database writes are properly queued and prevents session corruption. Removing this delay without refactoring the session queuing system will cause authentication failures under high load. See ticket #1247 for the original incident report.",
                'highlightedNodeIds' => ['auth-controller', 'session-service', 'auth-database'],
                'confidence' => 0.95
            ];
        }
        
        // Payment service scenario
        if (str_contains($queryLower, 'payment') || str_contains($queryLower, 'stripe')) {
            return [
                'answer' => "PaymentService is a critical integration point with the Stripe API. It handles all payment processing, subscription management, and transaction logging. Modifying this service impacts 3 API routes (checkout, subscription, refund), 2 frontend components (CheckoutPage, SubscriptionManager), and the Payments database table. Any changes require thorough testing in the Stripe sandbox environment.",
                'highlightedNodeIds' => ['payment-service', 'checkout-controller', 'subscription-controller', 'payment-database'],
                'confidence' => 0.92
            ];
        }
        
        // PostgreSQL rationale scenario
        if (str_contains($queryLower, 'postgres') || str_contains($queryLower, 'database') || str_contains($queryLower, 'why')) {
            return [
                'answer' => "The system uses PostgreSQL for its robust ACID compliance and advanced query capabilities. The migration from MySQL occurred in 2023 due to transaction isolation requirements for the payment processing system. PostgreSQL's MVCC (Multi-Version Concurrency Control) prevents read locks during high-traffic periods, which is critical for the user authentication and payment flows.",
                'highlightedNodeIds' => ['user-database', 'payment-database', 'session-database'],
                'confidence' => 0.88
            ];
        }
        
        // Middleware bypass scenario
        if (str_contains($queryLower, 'bypass') || 
            str_contains($queryLower, 'middleware') || 
            str_contains($queryLower, 'skip auth')) {
            return [
                'answer' => "⛔ SECURITY WARNING: Bypassing AuthMiddleware exposes unauthenticated API endpoints and creates a critical security vulnerability. All protected routes MUST pass through this middleware to validate JWT tokens and enforce role-based access control. Historical incident: In 2023, a developer accidentally bypassed this middleware during a hotfix, resulting in a 2-hour security breach. Always verify middleware chains before deployment.",
                'highlightedNodeIds' => ['auth-middleware', 'auth-controller', 'api-route-auth', 'api-route-user'],
                'confidence' => 0.98
            ];
        }
        
        // Generic architecture query
        if (str_contains($queryLower, 'architecture') || str_contains($queryLower, 'structure')) {
            return [
                'answer' => "This is a layered architecture following the MVC pattern with additional service and middleware layers. The frontend communicates with API routes, which delegate to controllers. Controllers use services for business logic, and services interact with database models. Middleware provides cross-cutting concerns like authentication and rate limiting. This separation ensures maintainability and testability.",
                'highlightedNodeIds' => [],
                'confidence' => 0.85
            ];
        }
        
        // Default response
        return [
            'answer' => "I analyzed the architecture but couldn't find specific information about that query. Try asking about: authentication delays, payment processing, database choices, or middleware security. You can also click on any component in the graph to see its blast radius and dependencies.",
            'highlightedNodeIds' => [],
            'confidence' => 0.60
        ];
    }
}
```

#### Task 2.2: Add Oracle Route
**File**: `api/routes/api.php`

```php
use App\Http\Controllers\Api\OracleController;

Route::post('/oracle', [OracleController::class, 'query']);
```

**Deliverable**: `POST /api/oracle` with `{ query: string, repo: string }` returns intelligent responses

---

## Phase 2: Frontend Integration (Hours 9-18)

### FRONTEND TEAM 1: Graph Visualization & Blast Radius

#### Task 3.1: Create TypeScript Types
**File**: `client/types/graph.ts`

```typescript
export type NodeLayer = 'frontend' | 'api' | 'controller' | 'service' | 'database' | 'middleware';

export interface NodeMetadata {
  lineCount?: number;
  complexity?: 'low' | 'medium' | 'high';
  lastModified?: string;
  author?: string;
  intentNote?: string;
}

export interface NodeDependencies {
  upstream: string[];
  downstream: string[];
}

export interface GraphNodeData {
  id: string;
  type: string;
  layer: NodeLayer;
  label: string;
  path: string;
  description: string;
  metadata: NodeMetadata;
  dependencies: NodeDependencies;
}

export interface OracleResponse {
  answer: string;
  highlightedNodeIds: string[];
  confidence: number;
  timestamp: string;
}
```

#### Task 3.2: Upgrade Blast Radius Hook
**File**: `client/hooks/use-flow-interactions.ts`

```typescript
import { useEffect } from 'react';
import { Node, Edge } from 'reactflow';

interface UseFlowInteractionsProps {
  selectedNode: string | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onShowDependencies: (show: boolean) => void;
  highlightedNodeIds?: string[];
}

export function useFlowInteractions({
  selectedNode,
  setNodes,
  setEdges,
  onShowDependencies,
  highlightedNodeIds = []
}: UseFlowInteractionsProps) {
  
  useEffect(() => {
    if (!selectedNode && highlightedNodeIds.length === 0) {
      // Reset all nodes and edges
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          data: { ...node.data, dimmed: false, highlighted: false },
          style: { ...node.style, opacity: 1 }
        }))
      );
      setEdges((edges) =>
        edges.map((edge) => ({
          ...edge,
          animated: false,
          style: { ...edge.style, opacity: 0.4, strokeWidth: 1.5 }
        }))
      );
      onShowDependencies(false);
      return;
    }

    const activeNodeIds = selectedNode ? [selectedNode] : highlightedNodeIds;
    
    setNodes((nodes) => {
      const relatedNodeIds = new Set<string>();
      
      // Find all upstream and downstream nodes
      nodes.forEach((node) => {
        if (activeNodeIds.includes(node.id)) {
          relatedNodeIds.add(node.id);
          node.data.dependencies?.upstream?.forEach((id: string) => relatedNodeIds.add(id));
          node.data.dependencies?.downstream?.forEach((id: string) => relatedNodeIds.add(id));
        }
      });

      return nodes.map((node) => {
        const isActive = activeNodeIds.includes(node.id);
        const isRelated = relatedNodeIds.has(node.id);
        const isDimmed = !isActive && !isRelated;

        return {
          ...node,
          data: {
            ...node.data,
            dimmed: isDimmed,
            highlighted: isActive || isRelated
          },
          style: {
            ...node.style,
            opacity: isDimmed ? 0.2 : 1,
            filter: isActive ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none'
          }
        };
      });
    });

    setEdges((edges) =>
      edges.map((edge) => {
        const isActive = activeNodeIds.some(id => edge.source === id || edge.target === id);
        
        return {
          ...edge,
          animated: isActive,
          style: {
            ...edge.style,
            opacity: isActive ? 1 : 0.1,
            strokeWidth: isActive ? 3 : 1.5,
            stroke: isActive ? '#3b82f6' : '#334155'
          }
        };
      })
    );

    if (selectedNode) {
      onShowDependencies(true);
    }
  }, [selectedNode, highlightedNodeIds, setNodes, setEdges, onShowDependencies]);
}
```

#### Task 3.3: Add Layer Legend Component
**File**: `client/components/architecture/layer-legend.tsx`

```typescript
'use client';

import { Badge } from '@client/components/ui/badge';

const LAYERS = [
  { name: 'Frontend', color: 'bg-blue-500', count: 3 },
  { name: 'API', color: 'bg-green-500', count: 4 },
  { name: 'Controller', color: 'bg-amber-500', count: 4 },
  { name: 'Service', color: 'bg-purple-500', count: 3 },
  { name: 'Database', color: 'bg-red-500', count: 3 },
  { name: 'Middleware', color: 'bg-pink-500', count: 2 }
];

export function LayerLegend() {
  return (
    <div className="absolute bottom-6 left-6 z-50 bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-2xl">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Architecture Layers
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {LAYERS.map((layer) => (
          <div key={layer.name} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${layer.color}`} />
            <span className="text-xs text-foreground">{layer.name}</span>
            <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">
              {layer.count}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### FRONTEND TEAM 2: Oracle Integration & Panel Enhancements

#### Task 4.1: Create Oracle API Client
**File**: `client/lib/oracle.ts`

```typescript
import { OracleResponse } from '@client/types/graph';

export async function queryOracle(query: string, repo: string): Promise<OracleResponse> {
  const response = await fetch('/api/repo/oracle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, repo })
  });

  if (!response.ok) {
    throw new Error('Oracle query failed');
  }

  return response.json();
}
```

#### Task 4.2: Create Oracle API Route
**File**: `client/app/api/repo/oracle/route.ts`

```typescript
import { backendFetch, jsonResponse } from "@client/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await backendFetch('/api/oracle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  return jsonResponse(response);
}
```

#### Task 4.3: Upgrade AI Oracle Panel
**File**: `client/components/architecture/ai-oracle-panel.tsx`

Replace the mock response logic with real API call:

```typescript
const handleSearch = async (overrideQuery?: string) => {
  const activeQuery = overrideQuery || query;
  if (!activeQuery.trim()) return;

  setLoading(true);
  try {
    const response = await queryOracle(activeQuery, repoName);
    
    if (onResponse) {
      onResponse(response.answer);
    }
    
    if (onHighlight && response.highlightedNodeIds.length > 0) {
      onHighlight(response.highlightedNodeIds);
    }
  } catch (error) {
    console.error('Oracle query failed:', error);
    if (onResponse) {
      onResponse('Failed to get response from Oracle. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
```

#### Task 4.4: Enhance Dependency Panel
**File**: `client/components/dependency-panel.tsx`

Add impact summary at the top:

```typescript
// After the header section, add:
<div className="px-6 py-4 bg-accent/20 border-b border-border/50">
  <p className="text-sm text-foreground font-medium">
    Changing <span className="font-bold text-primary">{node.data.label}</span> impacts{' '}
    <span className="font-bold text-emerald-500">{upstream.length} consumer(s)</span> and{' '}
    <span className="font-bold text-blue-500">{downstream.length} dependency(ies)</span>.
  </p>
  {node.data.metadata?.intentNote && (
    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
      <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
        {node.data.metadata.intentNote}
      </p>
    </div>
  )}
</div>
```

---

## Phase 3: Polish & Demo Prep (Hours 19-36)

### ALL TEAMS: Integration & Testing

#### Task 5.1: Update Main Repository Page
**File**: `client/app/app/(dashboard)/repos/[name]/page.tsx`

Add state for highlighted nodes:

```typescript
const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);

// Pass to ArchitectureVisualization
<ArchitectureVisualization
  highlightedNodeIds={highlightedNodeIds}
  // ... other props
/>

// Pass to SearchPanel
<SearchPanel
  onHighlight={setHighlightedNodeIds}
  // ... other props
/>
```

#### Task 5.2: Add Reset Button
**File**: `client/components/architecture/flow-toolbar.tsx`

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    onNodeSelect(null);
    setHighlightedNodeIds([]);
  }}
  className="gap-2"
>
  <X className="w-3.5 h-3.5" />
  Reset View
</Button>
```

#### Task 5.3: Create Demo Script
**File**: `DEMO_SCRIPT.md`

```markdown
# AGA Demo Script - 5 Minutes

## Setup (30 seconds)
- Open app on main dashboard
- Show repository list
- Click into "Demo Architecture" repository

## Act 1: The Chaos (45 seconds)
**SAY**: "This is what a legacy system looks like to a new developer: a complex web of dependencies with no context."

**DO**: 
- Show the full graph with 15-20 nodes
- Zoom in slightly to show detail
- Point out different colored layers

## Act 2: The Blast Radius (90 seconds)
**SAY**: "Before making any change, AGA shows you exactly what will break."

**DO**:
- Click on PaymentService node
- Watch the graph highlight upstream and downstream dependencies
- Show the right panel with impact summary
- **READ**: "Changing PaymentService impacts 3 API routes, 2 services, and 2 database models"

**SAY**: "Now let's look at a critical security component."

**DO**:
- Click on AuthMiddleware
- Show the blast radius
- Point out the security warning in the dependency panel

## Act 3: The Oracle (120 seconds)
**SAY**: "But AGA doesn't just show you WHAT will break. It tells you WHY things were built this way."

**DO**:
- Type in search: "Why is there a 500ms delay in the User Auth controller?"
- Click "Ask Bob"
- Wait for response to appear in overlay
- **READ THE RESPONSE**: "The AuthController contains an intentional 500ms delay added in March 2024 to prevent a race condition..."
- Show how the graph automatically highlights the relevant nodes

**SAY**: "Let's ask about a dangerous change."

**DO**:
- Type: "What happens if I bypass the AuthMiddleware?"
- Show the security warning response
- Highlight the affected nodes

## Act 4: The Closer (30 seconds)
**SAY**: "We didn't just map the code. We mapped the intent. AGA preserves the institutional knowledge that walks out the door when senior engineers leave."

**DO**:
- Show the layer legend
- Quick pan across the graph
- End on the AGA logo

## Backup Scenarios
If judges ask questions:
- "How does it handle large codebases?" → "The graph uses hierarchical clustering and can collapse/expand modules"
- "What about real-time updates?" → "We have a file watcher that triggers incremental scans"
- "Can it integrate with CI/CD?" → "Yes, we can generate blast radius reports in pull requests"
```

---

## Phase 4: Final Polish (Hours 37-48)

### Task 6.1: UI Polish Checklist
- [ ] Dark mode looks premium (deep blacks, subtle glows)
- [ ] All animations are smooth (300-500ms transitions)
- [ ] Loading states show spinners, not blank screens
- [ ] Empty states have helpful messages
- [ ] Buttons have hover effects
- [ ] Graph nodes have drop shadows when selected
- [ ] Oracle responses fade in smoothly
- [ ] Dependency panel has gradient backgrounds

### Task 6.2: Testing Checklist
- [ ] Click any node → blast radius highlights correctly
- [ ] Click reset → graph returns to default state
- [ ] Search "500ms delay" → correct Oracle response
- [ ] Search "payment" → highlights PaymentService and related nodes
- [ ] Search "bypass middleware" → shows security warning
- [ ] Dependency panel shows correct upstream/downstream counts
- [ ] Layer legend matches actual node colors
- [ ] App works on 1920x1080 projector resolution
- [ ] No console errors in browser

### Task 6.3: Deployment
- [ ] Build Next.js app: `npm run build`
- [ ] Test production build locally
- [ ] Deploy to Vercel/Netlify
- [ ] Deploy Laravel backend to cloud
- [ ] Verify API endpoints work in production
- [ ] Test complete demo flow in production
- [ ] Create backup video recording of demo

---

## Success Metrics

### Technical Completeness
- ✅ Graph renders 15-20 nodes with correct colors
- ✅ Blast radius highlights upstream/downstream dependencies
- ✅ Oracle returns intelligent responses for 5+ scenarios
- ✅ Dependency panel shows impact summary
- ✅ Layer legend displays all 6 layers
- ✅ Reset button clears all selections

### Demo Impact
- ✅ Judges say "wow" during blast radius demo
- ✅ Oracle responses feel intelligent and contextual
- ✅ UI looks like a $100k enterprise product
- ✅ Demo completes in under 5 minutes
- ✅ No bugs or crashes during presentation

### Story Clarity
- ✅ Auth delay story explains the "why"
- ✅ Payment service shows real impact metrics
- ✅ Middleware bypass demonstrates security value
- ✅ PostgreSQL rationale shows architectural decisions

---

## Risk Mitigation

### If Behind Schedule
**Priority 1 (Must Have)**:
- Blast radius highlighting
- Oracle with 3 demo responses
- Dependency panel with impact summary

**Priority 2 (Should Have)**:
- Layer legend
- Reset button
- UI polish

**Priority 3 (Nice to Have)**:
- Advanced animations
- Additional Oracle scenarios
- Mobile responsiveness

### If Demo Fails
- Have backup video recording
- Have screenshots of key features
- Have localhost version ready
- Practice demo 10+ times

---

## Next Steps

1. **Backend Team 1**: Start with `demo-architecture.json` - this is the foundation
2. **Backend Team 2**: Build Oracle controller with 5 deterministic responses
3. **Frontend Team 1**: Upgrade blast-radius hook and add layer legend
4. **Frontend Team 2**: Integrate Oracle API and enhance panels

**First Milestone** (Hour 12): Backend serves complete graph, Oracle returns responses
**Second Milestone** (Hour 24): Frontend displays graph with blast radius
**Third Milestone** (Hour 36): Complete integration with Oracle highlighting
**Final Milestone** (Hour 48): Polished demo ready for judges

---

## Questions?

- Backend: Focus on data structure first, API second
- Frontend: Get graph working, then add Oracle
- Integration: Test early and often
- Demo: Practice the story, not just the features

**Remember**: Judges don't care about perfect code. They care about:
1. Does it solve a real problem?
2. Is the demo impressive?
3. Can I understand it in 5 minutes?

Good luck! 🚀