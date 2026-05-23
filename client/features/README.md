# Frontend Feature Modules

Feature modules hold frontend-only behavior that belongs to one product area. Keep routes in `client/app`, reusable UI in `client/components`, and move feature-owned hooks, schemas, API helpers, and local utilities here.

Current feature boundaries:

- `auth`: login/register/password-reset UI behavior and client-side schemas.
- `repositories`: repository list, connection, switching, deletion, and dashboard statistics hooks.
- `graph`: architecture graph data, React Flow interactions, dependency analysis, and graph-local utilities.
- `ai-oracle`: AI Oracle client helpers and feature-specific types.
- `settings`: settings hooks and client-side settings helpers.
- `scan-logs`: scan log and AI history hooks/types used by the logs pages.

Compatibility re-exports remain in `client/hooks` and `client/lib/types` so existing imports continue to work while new code imports from `client/features/*` or `client/types`.
