# AGA (Architecture Governance Agent)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-11.11-FF007F?style=for-the-badge&logo=react)](https://reactflow.dev/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

> A powerful monorepo system containing an **Architecture Governance Agent (AGA)**. It clones, analyzes, maps, and queries codebases using interactive graph-based visualizations and AI-assisted analysis.

---

## 🌟 Overview

**AGA** automatically maps codebase dependencies and structural elements into an interactive, layered architecture graph. It enables developers, architects, and product managers to interactively explore code paths, analyze the impact/blast-radius of changing specific files, and converse with an AI Oracle to understand complex architectural decisions.

---

## ✨ Features

- 🌐 **Interactive Graph Visualization**: Layered representation of UI components, API endpoints, middlewares, controllers, services, and databases using React Flow.
- 🤖 **AI Oracle**: Ask natural-language questions about codebase structure, auth mechanisms, and patterns, powered by IBM Bob / Granite or deterministic demo fallbacks.
- 💥 **Blast Radius & Dependency Analysis**: Calculate upstream/downstream impact when a given component changes.
- 🚀 **Asynchronous Code Analysis**: Background cloning and code parsing using Laravel Queue worker.
- 🐳 **Dockerized Dev Environment**: Multi-service Docker Compose setup running PostgreSQL, Next.js, and Laravel.

---

## 📁 Repository Structure

```text
/
├── client/          # Next.js 16 (React 19) Frontend Application
│   ├── app/         # Dashboard views, dynamic routes (/repos/[name]), and proxy endpoints
│   ├── components/  # Shared layouts, visualizer panels, legend, and toolbar components
│   ├── hooks/       # Custom React hooks (useArchitectureData, useFlowInteractions, useDependencyAnalysis)
│   ├── lib/         # API clients and helpers
│   └── types/       # TypeScript type declarations
├── api/            # Laravel 11 Backend API Service
│   ├── app/         # Controllers (RepositoryController, OracleController) and Services (GitHubService, ParserService)
│   ├── config/      # Core service configurations
│   ├── database/    # Migrations and database schemas (repositories, nodes, edges, ai_cache)
│   ├── routes/      # Laravel API route definitions
│   └── storage/     # Cloned repositories and seed data (demo-architecture.json)
├── docs/           # Comprehensive design, architecture, and sprint documentation
├── scripts/        # Multi-platform environment setup tools (setup-env.sh, setup-env.bat)
├── docker-compose.yml # Dev environment orchestration
└── package.json    # Monorepo workspaces definition (client, api)
```

---

## 🛠️ Getting Started

### Prerequisites

- **Docker** and **Docker Compose**
- **GitHub Personal Access Token (PAT)** (for cloning repositories)
- **IBM Bob API credentials** (optional, demo mode fallback enabled by default)

### 🚀 Quick Start (Docker Setup)

1. **Clone the repository** and navigate to the project root:
   ```bash
   git clone <repo-url>
   cd aga
   ```

2. **Generate Environment Files**:
   Run the setup script corresponding to your operating system to generate `.env` files in root, `api/`, and `client/`:
   - **Windows (PowerShell/CMD)**:
     ```cmd
     scripts\setup-env.bat
     ```
   - **Linux / macOS**:
     ```bash
     chmod +x scripts/setup-env.sh
     ./scripts/setup-env.sh
     ```

3. **Spin Up Containers**:
   ```bash
   docker-compose up -d
   ```
   This spins up:
   - **PostgreSQL Database** on port `5433`
   - **Laravel API** on port `8000`
   - **Next.js Client** on port `3000`

4. **Install Backend Dependencies & Setup Database**:
   ```bash
   docker-compose exec api composer install
   docker-compose exec api php artisan key:generate
   docker-compose exec api php artisan migrate
   ```

5. **Start Queue Worker** (crucial for background repository scanning):
   ```bash
   docker-compose exec api php artisan queue:work
   ```

---

## 💻 Manual Developer Setup (Local)

### Backend (Laravel API)
1. Navigate to the `api` folder and install packages:
   ```bash
   cd api
   composer install
   ```
2. Copy configuration and generate keys:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. Set up your database and migration:
   ```bash
   php artisan migrate
   ```
4. Run the local development server:
   ```bash
   php artisan serve --port=8000
   ```

### Frontend (Next.js Client)
1. Navigate to the `client` folder and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Environment Variables

### Root / Docker Compose (`.env`)
| Variable | Description |
| :--- | :--- |
| `DB_DATABASE` | PostgreSQL database name |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `API_PORT` | Port exposed by Laravel service (Default: `8000`) |
| `CLIENT_PORT` | Port exposed by Next.js service (Default: `3000`) |

### Backend Service (`api/.env`)
| Variable | Description |
| :--- | :--- |
| `GITHUB_TOKEN` | Your Personal Access Token (classic) with `repo` permission |
| `IBM_BOB_ENABLED` | Set `true` to enable real IBM Bob AI queries |
| `IBM_BOB_API_KEY` | IBM Bob model authentication key |

---

## 📝 CLI Reference

| Monorepo Command | Scope | Description |
| :--- | :--- | :--- |
| `npm run dev` | Frontend | Start client development build |
| `npm run build` | Frontend | Build production client bundle |
| `php artisan queue:work` | Backend | Start processing repo clone/parse background jobs |
| `php artisan test` | Backend | Run PHPUnit automated tests |

---

## 📚 Documentation Reference

For deep dives into codebase mechanics, consult files within the `docs/` and service subdirectories:
- 🏗️ **System Architecture**: [docs/ARCHITECTURE_DIAGRAM.md](file:///c:/Users/mfulguerinas/Documents/INTERN/aga/docs/ARCHITECTURE_DIAGRAM.md)
- 🎨 **Visual Design Guide**: [docs/DESIGN.md](file:///c:/Users/mfulguerinas/Documents/INTERN/aga/docs/DESIGN.md)
- 🔌 **API Integration & Parsing**: [api/IMPLEMENTATION_GUIDE.md](file:///c:/Users/mfulguerinas/Documents/INTERN/aga/api/IMPLEMENTATION_GUIDE.md)
- 🔑 **Auth Flow Guide**: [docs/AUTHENTICATION_GUIDE.md](file:///c:/Users/mfulguerinas/Documents/INTERN/aga/docs/AUTHENTICATION_GUIDE.md)

---

## ⚖️ License

This project is licensed under the MIT License.
