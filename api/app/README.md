# Backend Application Structure

Laravel remains the backend source of truth for auth, authorization, validation, persistence, scanning, jobs, and AI logic.

- `Http/Controllers`: thin request/response controllers grouped by `Auth`, `Api`, and `OAuth`.
- `Http/Requests`: Form Requests for backend validation. These are the source of truth for accepted payloads.
- `Actions`: single-purpose business flows such as connecting repositories, rescanning, deleting, and asking the Oracle.
- `Services`: domain services grouped by feature area (`AI`, `Graph`, `Repositories`, `Settings`, `ScanLogs`).
- `Jobs`: queue/background work. Repository scanning remains here.
- `Models`: Eloquent models and relationships.
- `DTOs`: optional typed payloads for cross-layer data structures.
