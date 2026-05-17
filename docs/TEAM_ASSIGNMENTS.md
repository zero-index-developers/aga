# AGA Team Assignments - 48-Hour Sprint

## 🎯 Quick Reference

| Team Member | Primary Focus | Key Deliverables |
|-------------|---------------|------------------|
| **Backend Dev 1** | Graph Data Model | `demo-architecture.json`, Graph API enhancement |
| **Backend Dev 2** | Oracle API | `OracleController.php`, Intelligent responses |
| **Frontend Dev 1** | Graph Visualization | Blast radius, Layer legend, Reset button |
| **Frontend Dev 2** | Oracle Integration | API client, Panel enhancements, UI polish |

---

## 👨‍💻 Backend Developer 1: Graph Data Architect

### Hour 1-4: Foundation
**Priority**: Create the dummy architecture dataset that tells the demo story

#### Files to Create/Modify:
1. `api/storage/app/demo-architecture.json` - Complete graph dataset
2. `api/app/Http/Controllers/Api/RepositoryController.php` - Enhance graph endpoint

#### Detailed Tasks:

**Task 1: Create Demo Architecture JSON** (2 hours)
```json
{
  "nodes": [
    {
      "id": "user-dashboard",
      "type": "custom",
      "layer": "frontend",
      "label": "UserDashboard",
      "path": "src/components/UserDashboard.tsx",
      "description": "Main user interface component",
      "metadata": {
        "lineCount": 180,
        "complexity": "medium",
        "lastModified": "2024-03-10",
        "author": "Frontend Team"
      },
      "dependencies": {
        "upstream": [],
        "downstream": ["api-route-user", "api-route-auth"]
      },
      "position": { "x": 100, "y": 100 },
      "style": { "width": 180, "height": 80 }
    },
    {
      "id": "auth-controller",
      "type": "custom",
      "layer": "controller",
      "label": "AuthController",
      "path": "app/Http/Controllers/AuthController.php",
      "description": "Handles authentication and session management",
      "metadata": {
        "lineCount": 245,
        "complexity": "high",
        "lastModified": "2024-03-15",
        "author": "Senior Dev Team",
        "intentNote": "⚠️ CRITICAL: Contains intentional 500ms delay added in March 2024 to prevent race condition during concurrent login attempts. DO NOT REMOVE without refactoring the session queuing system. See ticket #1247."
      },
      "dependencies": {
        "upstream": ["api-route-auth", "auth-middleware"],
        "downstream": ["user-service", "session-service", "auth-database"]
      },
      "position": { "x": 400, "y": 200 },
      "style": { "width": 180, "height": 80 }
    }
    // Add 13-18 more nodes following the pattern in AGA_48HR_SPRINT_PLAN.md
  ],
  "edges": [
    {
      "id": "e1",
      "source": "user-dashboard",
      "target": "api-route-user",
      "type": "smoothstep",
      "animated": false
    }
    // Add corresponding edges
  ]
}
```

**Task 2: Enhance Graph Endpoint** (1 hour)
Modify `RepositoryController@graph` to serve the demo data:

```php
public function graph(Request $request)
{
    $repo = $request->query('repo');
    
    // For demo purposes, serve the curated dataset
    $demoPath = storage_path('app/demo-architecture.json');
    
    if (file_exists($demoPath)) {
        $data = json_decode(file_get_contents($demoPath), true);
        return response()->json($data);
    }
    
    // Fallback to empty graph
    return response()->json([
        'nodes' => [],
        'edges' => []
    ]);
}
```

**Task 3: Add Node Color Logic** (1 hour)
Ensure nodes have correct colors based on layer:

```php
private function getLayerColor(string $layer): string
{
    return match($layer) {
        'frontend' => '#3b82f6',    // Blue
        'api' => '#10b981',          // Green
        'controller' => '#f59e0b',   // Amber
        'service' => '#8b5cf6',      // Purple
        'database' => '#ef4444',     // Red
        'middleware' => '#ec4899',   // Pink
        default => '#6b7280'         // Gray
    };
}
```

### Hour 5-8: Testing & Refinement
- Test graph endpoint returns valid JSON
- Verify all 15-20 nodes have correct structure
- Ensure edges connect properly
- Add more intentNote fields for demo stories

---

## 👨‍💻 Backend Developer 2: Oracle Intelligence

### Hour 1-4: Oracle Controller
**Priority**: Build the intelligent response engine

#### Files to Create:
1. `api/app/Http/Controllers/Api/OracleController.php`
2. Update `api/routes/api.php`

#### Detailed Tasks:

**Task 1: Create OracleController** (3 hours)
Copy the complete controller from `AGA_48HR_SPRINT_PLAN.md` Phase 1, Task 2.1

Key scenarios to implement:
- Auth delay (500ms) → Returns explanation with ticket reference
- Payment service → Shows impact on 3 routes, 2 components
- PostgreSQL rationale → Explains ACID compliance
- Middleware bypass → Security warning
- Generic architecture → Fallback response

**Task 2: Add Route** (15 minutes)
```php
Route::post('/oracle', [OracleController::class, 'query']);
```

**Task 3: Test Responses** (45 minutes)
Use Postman or curl to test:
```bash
curl -X POST http://localhost:8000/api/oracle \
  -H "Content-Type: application/json" \
  -d '{"query": "Why is there a 500ms delay?", "repo": "demo"}'
```

### Hour 5-8: Enhanced Responses
- Add more query patterns (case variations)
- Improve confidence scoring
- Add response caching for performance
- Test edge cases

---

## 👨‍💻 Frontend Developer 1: Graph Visualization Master

### Hour 1-4: Core Graph Features
**Priority**: Make blast radius analysis work perfectly

#### Files to Create/Modify:
1. `client/types/graph.ts` - TypeScript types
2. `client/hooks/use-flow-interactions.ts` - Blast radius logic
3. `client/components/architecture/layer-legend.tsx` - New component

#### Detailed Tasks:

**Task 1: Create TypeScript Types** (30 minutes)
Copy from `AGA_48HR_SPRINT_PLAN.md` Phase 2, Task 3.1

**Task 2: Upgrade Blast Radius Hook** (2 hours)
Copy from `AGA_48HR_SPRINT_PLAN.md` Phase 2, Task 3.2

Key features:
- Highlight selected node with glow effect
- Dim unrelated nodes to 20% opacity
- Animate edges between related nodes
- Support both click selection and Oracle highlighting

**Task 3: Create Layer Legend** (1.5 hours)
Copy from `AGA_48HR_SPRINT_PLAN.md` Phase 2, Task 3.3

Position: Bottom-left corner with backdrop blur

### Hour 5-8: Polish & Reset
- Add reset button to toolbar
- Improve node styling (shadows, borders)
- Test blast radius with all node types
- Ensure animations are smooth (300ms transitions)

---

## 👨‍💻 Frontend Developer 2: Oracle Integration & Polish

### Hour 1-4: Oracle Integration
**Priority**: Connect frontend to Oracle API

#### Files to Create/Modify:
1. `client/lib/oracle.ts` - API client
2. `client/app/api/repo/oracle/route.ts` - Next.js API route
3. `client/components/architecture/ai-oracle-panel.tsx` - Update to use real API
4. `client/components/dependency-panel.tsx` - Add impact summary

#### Detailed Tasks:

**Task 1: Create Oracle Client** (30 minutes)
Copy from `AGA_48HR_SPRINT_PLAN.md` Phase 2, Task 4.1

**Task 2: Create API Route** (30 minutes)
Copy from `AGA_48HR_SPRINT_PLAN.md` Phase 2, Task 4.2

**Task 3: Update AI Oracle Panel** (1.5 hours)
Replace mock logic with real API call (see Phase 2, Task 4.3)

**Task 4: Enhance Dependency Panel** (1.5 hours)
Add impact summary section (see Phase 2, Task 4.4)

### Hour 5-8: UI Polish
- Add loading spinners
- Improve empty states
- Add error handling
- Test Oracle responses display correctly
- Ensure Oracle overlay looks premium

---

## 🤝 Team Collaboration Points

### Hour 8: First Integration Check
**All Teams Meet**
- Backend 1: Graph endpoint ready?
- Backend 2: Oracle returning responses?
- Frontend 1: Graph rendering?
- Frontend 2: Oracle panel working?

**Test Together**:
1. Load graph from API
2. Click node → blast radius works
3. Search query → Oracle responds
4. Oracle response → nodes highlight

### Hour 16: Second Integration Check
**All Teams Meet**
- Complete user flow works end-to-end
- All 5 demo scenarios return correct responses
- Graph highlighting syncs with Oracle
- Dependency panel shows impact summary

**Demo Rehearsal #1**: Run through complete demo script

### Hour 24: Polish Sprint
**All Teams**
- Fix any bugs found in rehearsal
- Improve animations and transitions
- Add final UI touches
- Test on projector resolution (1920x1080)

**Demo Rehearsal #2**: Time the demo (must be under 5 minutes)

### Hour 36: Final Testing
**All Teams**
- Deploy to production
- Test in production environment
- Record backup demo video
- Practice demo 5+ times

**Demo Rehearsal #3**: Perfect the presentation

### Hour 48: Presentation Ready
- App deployed and stable
- Demo script memorized
- Backup video ready
- Team confident

---

## 📋 Daily Standup Questions

### Morning (Hour 0, 12, 24, 36)
1. What did you complete?
2. What are you working on next?
3. Any blockers?

### Evening (Hour 8, 20, 32, 44)
1. What's working?
2. What's broken?
3. What needs help?

---

## 🚨 Emergency Contacts

If you get stuck:
- **Graph not rendering**: Check browser console, verify API returns valid JSON
- **Oracle not responding**: Check Laravel logs, verify route is registered
- **Blast radius not working**: Check node dependencies structure in JSON
- **Deployment failing**: Use localhost demo as backup

---

## ✅ Definition of Done

### Backend Team 1
- [ ] `demo-architecture.json` has 15-20 nodes
- [ ] All nodes have intentNote for key components
- [ ] Graph endpoint returns valid JSON
- [ ] Edges connect nodes correctly

### Backend Team 2
- [ ] Oracle endpoint responds to 5+ scenarios
- [ ] Responses include highlightedNodeIds
- [ ] Response time < 500ms
- [ ] No errors in Laravel logs

### Frontend Team 1
- [ ] Blast radius highlights correctly
- [ ] Layer legend displays all 6 layers
- [ ] Reset button clears selection
- [ ] Animations are smooth

### Frontend Team 2
- [ ] Oracle API integration works
- [ ] Dependency panel shows impact summary
- [ ] Loading states implemented
- [ ] UI looks premium

### All Teams
- [ ] Complete demo flow works
- [ ] No console errors
- [ ] App deployed to production
- [ ] Demo rehearsed 10+ times

---

## 🎯 Success Criteria

**Technical**: All features work without bugs
**Visual**: UI looks like a $100k enterprise product  
**Story**: Demo tells a compelling narrative
**Impact**: Judges say "I need this for my team"

**Remember**: You're not building a complete product. You're building a demo that wins hackathons. Focus on the story, not perfection.

Good luck! 🚀