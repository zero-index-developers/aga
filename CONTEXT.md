# AGA: Architecture Discovery Engine - Project Context

## 🚀 Overview
AGA is a high-performance, repository-aware architecture visualization platform. It enables developers to discover, analyze, and interact with the physical structure of a codebase through dynamic graphs and contextual AI analysis.

---

## 🏗️ System Architecture

### 1. Modular Routing (Next.js App Router)
The platform is organized into a nested, hierarchical structure to separate global insights from deep-dive analysis:
- **Overview (`/`)**: Global console showing system-wide health, aggregate stats, and recent activity.
- **Repository Library (`/repos`)**: Centralized management for all connected repositories.
- **Graph Discovery (`/repos/[slug]`)**: Dedicated, full-screen environment for architectural exploration of a specific project.

### 2. Core Components
- **ArchitectureVisualization**: The primary engine utilizing ReactFlow for node-link diagrams. Features coordinate persistence and optimized re-rendering.
- **SearchPanel ("Ask Bob")**: Contextual Oracle that provides dynamic, repo-aware suggestions and simulated AI analysis of project files.
- **DependencyPanel**: Real-time "Live Blast Radius" analyzer that visualizes impact analysis for selected components.
- **FlowToolbar**: Glassmorphic "pill" layout (bottom-center) for viewport controls, layering, and "Explode" view.
- **DynamicBreadcrumbs**: Automated navigation system that synchronizes with the URL segments to provide a clean `Repositories > Project` path.

### 3. Logic & State Management
- **Persistence**: Managed via `data/local-db.json` and served through custom API routes.
- **URL Handling**: Implements clean, hyphenated **slugs** (e.g., `/repos/aga-self-scan`) instead of raw, encoded names.
- **Hooks**:
    - `useRepos`: Manages repository lifecycle and connection state.
    - `useGlobalStats`: Memoized aggregator for cross-project analytics.
    - `useArchitectureData`: Handles coordinate "baking" and graph data fetching.

---

## ✨ Recent Technical Achievements
- **Modularization**: Successfully decoupled the monolithic dashboard into distinct, purpose-built routes.
- **Performance**: Resolved "Maximum update depth" infinite loops by breaking circular dependencies in graph interactions.
- **UX Refinement**: Implemented a "premium" theme transition using the View Transition API and `resolvedTheme`.
- **Navigation**: Integrated a fully dynamic breadcrumb system and legacy URL redirects for backwards compatibility.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Visualization**: ReactFlow
- **Styling**: Tailwind CSS (Glassmorphism, Modern Palettes)
- **Icons**: Lucide React
- **Data**: Local file-based JSON persistence

---

## 📅 Roadmap / Next Steps
1. **Layout Persistence**: Implement writing manual node positions back to `local-db.json`.
2. **Advanced Scanner**: Enhance `lib/scanner.ts` to support complex alias resolution and cross-module dependency detection.
3. **Interactive Oracle**: Transition "Ask Bob" from simulated responses to a live LLM integration for deep code reasoning.
