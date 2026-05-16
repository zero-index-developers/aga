# AGA — Architecture & Context Reference

> **Google Maps for Software Architecture** — an AI-powered, interactive knowledge graph that visualizes a software repository's architecture, dependencies, and historical intent for developers and architects.

> [!IMPORTANT]
> **Living Document Rules:**
> - **CONTEXT.md** — update when project structure, routing, layout, tech stack, or constraints change.
> - **README.md** — update when a feature ships, a dev command changes, or an env variable is added/removed. (DESIGN.md is currently out of scope).
> - No code change that affects any of the above is complete until the relevant doc is updated.

> [!WARNING]
> **Environment Variable Policy:** `.env` / `.env.local` is strictly reserved for infrastructure connections. All third-party API credentials **must** be managed via the UI if possible, or stored securely. Never commit secrets.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Status](#project-status)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Routing & Page Map](#routing--page-map)
6. [Data Access Layer (DAL)](#data-access-layer-dal)
7. [Database Schema](#database-schema)
8. [Server Actions Contract](#server-actions-contract)
9. [API Routes](#api-routes)
10. [Component Standards](#component-standards)
11. [Loading & Feedback Strategy](#loading--feedback-strategy)
12. [Security Standards](#security-standards)
13. [Error Handling Standards](#error-handling-standards)
14. [Auth & Session](#auth--session)
15. [Form Architecture](#form-architecture)
16. [Render Mode Rules](#render-mode-rules)
17. [Key Constraints & Gotchas](#key-constraints--gotchas)
18. [Development Setup](#development-setup)
19. [Checklist for Adding a New Feature (v1)](#checklist-for-adding-a-new-feature-v1)

---

## Project Overview

**AGA (Architecture Governance Agent)** is an AI-powered knowledge graph that visualizes a software repository's architecture, dependencies, and historical intent. Built for developers and architects to understand complex codebases through interactive visualization.

**Current Scope:**
- Interactive node-based graph visualization of components, services, and routes.
- Blast Radius Analyzer: click any node to highlight its upstream/downstream dependency chain.
- Search & Insight: Find components and see their relationships in the graph.

**Planned Scope (v1):**
- Persistent database storage using Supabase.
- Real-time repository parsing and file ingestion.
- Multi-user authentication and saved graph sessions.
- AI Integration (e.g., IBM Bob or similar) for natural language queries.

**Design philosophy:** Clarity and interactivity. The graph is the primary interface for understanding architecture.

---

## Project Status

| Version | Status | URL |
| :--- | :--- | :--- |
| `v0.1` | Initial Implementation | localhost:3000 |

**Completed milestones:**
- [x] Project scaffold — Next.js 16 app with Tailwind 4
- [x] React Flow integration for graph visualization
- [x] Blast-radius highlighting (upstream/downstream traversal)
- [x] Search panel for node discovery
- [x] Dependency panel for detailed node info
- [x] Theme support (Dark mode default)

**In progress / Planned:**
- [ ] Shared typed graph data model refinement
- [ ] Real-time parsing of local repositories
- [ ] API integration for dynamic data fetching
- [ ] UI Polish and layout refinements

---

## Tech Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2 (App Router) | Cutting edge Next.js with React 19 support |
| **UI Library** | React 19 | |
| **Styling** | Tailwind CSS 4 | Native CSS variables, performance-focused |
| **Components** | Radix UI / Shadcn UI | Accessible, unstyled primitives |
| **Typography** | Geist | via `next/font` |
| **Icons** | `lucide-react` | Tree-shakeable icons |
| **Graph Library** | React Flow 11 | Powerful node-based graph engine |
| **Forms** | `react-hook-form` + `zod` | [PLANNED] Type-safe form management |
| **Notifications** | `sonner` | Modern toast notifications |
| **Theme** | `next-themes` | Dark/Light mode support (Dark default) |
| **Database** | Supabase | [PLANNED] Persistent storage for graphs |
| **Validation** | `zod` | Schema-based validation |

---

## Project Structure

```text
/
├── app/                              # Next.js App Router root
│   ├── globals.css                   # Tailwind 4 global styles
│   ├── layout.tsx                    # Root layout (fonts, theme provider)
│   └── page.tsx                      # Main dashboard page (Client component)
│
├── components/                       # React components
│   ├── ui/                           # Shadcn/Radix UI primitives
│   ├── architecture-visualization.tsx # Main React Flow graph component
│   ├── custom-node.tsx               # Custom React Flow node renderer
│   ├── dependency-panel.tsx          # Side panel showing node details
│   ├── header.tsx                    # App header with logo/title
│   ├── search-panel.tsx              # Sidebar search and discovery
│   └── theme-provider.tsx            # Theme management wrapper
│
├── lib/                              # Utility functions and shared logic
│   └── utils.ts                      # Tailwind merge and class utility
│
├── public/                           # Static assets
└── types/                            # TypeScript type definitions
```

---

## Routing & Page Map

| Route | Guard | Description |
| :--- | :--- | :--- |
| `/` | Public | Main dashboard: graph visualization + search + details |
| `/api/graph` | [PLANNED] | `GET` — returns the full typed architecture graph JSON |
| `/api/analyze` | [PLANNED] | `POST { query }` — returns analysis or node highlight IDs |

---

## Data Access Layer (DAL)

> **Current Status:** All graph data is currently hardcoded in `components/architecture-visualization.tsx`. 

### [PLANNED] DAL Rules (v1)
In the next iteration, graph data will move to a persistent store (e.g., Supabase) and use a standard DAL pattern to separate data fetching from UI components.

- Every query **must** include `.eq('user_id', userId)` — even if RLS is enabled (defense in depth)
- Return `null` or `[]` on error — never throw from DAL functions (let callers decide)
- Log errors with the function name as context prefix: `console.error('[functionName]', ...)`
- Never return raw database `error` objects to the client
- Use `select('col1, col2')` — never `select('*')` in production paths (reduces payload)

---

## Database Schema

> **Current Status:** No database in the current iteration. The schema below documents the target state for Supabase.

### [PLANNED] `graph_nodes`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users`, indexed |
| `node_key` | `text` | Stable string ID used by the graph |
| `label` | `text` | Display name |
| `type` | `text` | `route`, `controller`, `middleware`, `service`, `database` |
| `color` | `text` | Tailwind color class |
| `position_x` | `float4` | Graph canvas X coordinate |
| `position_y` | `float4` | Graph canvas Y coordinate |

### [PLANNED] `graph_edges`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `source_node_key` | `text` | FK → `graph_nodes.node_key` |
| `target_node_key` | `text` | FK → `graph_nodes.node_key` |

---

## Server Actions Contract

> **Current Status:** No Server Actions in the current iteration. All state is managed client-side. This section documents the planned v1 standard.

### [PLANNED] Return Type Standard

Every Server Action **must** return this shape:

```typescript
type ActionResult<T = void> = 
  | { data: T; error: null }
  | { data: null; error: string }
```

### [PLANNED] Server Action Rules
- Always authenticate first before mutations.
- Always validate with Zod — never trust raw `FormData` or object payloads.
- Always return `{ data, error }` — never throw, never redirect inside try/catch.
- Always call `revalidatePath` after successful mutations.
- Use `unknown` + type guards in catch blocks.

---

## API Routes

> **Current Status:** No API routes currently implemented. All interaction is client-side.

### [PLANNED] API Route Rules
- Always wrap in try/catch — never let unhandled exceptions bubble
- Return consistent shapes: `{ data? }` or `{ error: string }`
- Log with route name prefix: `console.error('[POST /api/analyze]', ...)`

---

## Component Standards

### Component Categories

| Category | Location | Rules |
| :--- | :--- | :--- |
| **Primitives** | `components/ui/` | Shadcn UI primitives. Zero feature-awareness. |
| **Feature components** | `components/` | Main components like `architecture-visualization.tsx` and `search-panel.tsx`. |
| **Pages** | `app/page.tsx` | Entry point, composes the layout and holds shared state. |

### Component Rules
- Every primitive accepts a `className` prop — always merge with `cn()` from `lib/utils.ts`.
- Never hardcode colors inline — use Tailwind tokens.
- Co-locate component-specific types in the same file unless shared across features.
- Components use kebab-case file names (e.g., `search-panel.tsx`).

---

## Loading & Feedback Strategy

### Layer 1 — Toast Feedback
- **Tool:** `sonner`
- Use for global success/error notifications.

### Layer 2 — Empty States
- Evidence panel: hidden by default until a node is selected.
- Graph interaction provides immediate feedback (node highlighting/dimming).

### [PLANNED] Layer 3 — Async Operations
- Buttons trigger transitions via `useTransition` and display an `isLoading` spinner state.
- Fallback UI uses React `<Suspense>` to stream content.

---

## Security Standards

> **Current Status:** No authentication or backend security in the current iteration.

### [PLANNED] Authentication
- Use `supabase.auth.getUser()` in all server contexts.
- Redirect to `/login` at the middleware level for unauthenticated requests.

### [PLANNED] Authorization
- RLS enabled on all tables; all DAL queries include `.eq('user_id', userId)`.

### [PLANNED] Input Validation
- All API route bodies validated with Zod before processing.
- Query inputs sanitized before forwarding to AI endpoints.

---

## Error Handling Standards

### Current State
- Basic React Error Boundaries should be used for component failures.
- Global errors can be surfaced using the `sonner` toast notification system.

### [PLANNED] Hierarchy
```
User-facing error (toast)
  ↑
API Route / Server Action (catches + returns { error: string })
  ↑
Adapter / Lib function (catches + returns fallback)
```

### [PLANNED] User-Friendly Error Messages
- Translate raw API/external errors into plain English before surfacing to users.

---

## Auth & Session

> **Current Status:** Authentication is out of scope for the current iteration.

### [PLANNED] Session Rules
- Use `supabase.auth.getUser()` in all server contexts.
- Store session in cookies via Supabase SSR helpers — never `localStorage`.
- Route groups `(auth)`, `(dashboard)` enforce access at the middleware level.

---

## Form Architecture

> **Current Status:** Minimal form usage. The search panel handles local state.

### [PLANNED] Standard Stack
`react-hook-form` + `zod` resolver.

### [PLANNED] Rules
- Shared Zod schemas in `types/` — same schema validates on client and server.
- Always show field-level errors below the input.
- Global success/error via `sonner`.

---

## Render Mode Rules

| What | Where | Client or Server |
| :--- | :--- | :--- |
| Main Page | `app/page.tsx` | Client Component |
| Graph Visualization | `components/architecture-visualization.tsx` | Client Component |
| Search Panel | `components/search-panel.tsx` | Client Component |
| Dependency Panel | `components/dependency-panel.tsx` | Client Component |
| Graph data module | `lib/graph-data.ts` | [PLANNED] Server-safe pure module |

### Import Rules
- Keep components focused and modular.
- Radix primitives stay in `components/ui`.
- [PLANNED] Never import server-only logic into Client Components.

---

## Key Constraints & Gotchas

### React Flow
- **React Flow requires a fixed-height parent** — the graph canvas container must have an explicit height (e.g., `h-[calc(100vh-64px)]`); `height: 100%` without a defined parent height renders nothing.
- **Custom node types must be defined outside the component** — defining `nodeTypes` inside the render function causes React Flow to re-register types on every render, breaking drag and selection.
- **`fitView` on load** — call `reactFlowInstance.fitView()` after nodes are set to avoid a blank canvas on first render.

---

## Development Setup

### Prerequisites
- Node.js 18+
- `npm`

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```

---

## Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Checklist for Adding a New Feature (v1)

**Schema**
- [ ] Migration file created in `supabase/migrations/`
- [ ] RLS policies added for all four operations (select, insert, update, delete)
- [ ] Types + Zod schema added to `types/`
- [ ] DB schema section of this document updated

**Data Layer & Server Actions**
- [ ] DAL functions added
- [ ] Return types explicitly declared
- [ ] Auth check at the top of every action
- [ ] Zod validation before any DB operation
- [ ] `revalidatePath` called after mutations

**Components**
- [ ] Server page handles data fetching with Suspense
- [ ] Skeleton component exists for the loading state
- [ ] Empty state component exists for the zero-data state
- [ ] All buttons use `isLoading` during async operations
- [ ] All mutations produce a toast (success and error)

---

_This document is the single source of truth for the AGA project context. Update it whenever architectural decisions are made._