# Environment Variables Analysis

## Summary

The project should continue using separate environment files:

- Root `.env` for Docker Compose service wiring
- `api/.env` for Laravel backend secrets
- `client/.env.local` for Next.js runtime values

This separation prevents backend secrets from leaking into the frontend bundle.

## Sensitive Variables

The following values must never be committed with real data:

```env
APP_KEY=base64:generated-at-runtime
DB_PASSWORD=your_database_password
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_token
IBM_BOB_API_KEY=your_ibm_bob_api_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

## Safe Patterns

### Laravel

```php
env('APP_URL')
env('DB_USERNAME')
env('DB_PASSWORD')
env('GITHUB_CLIENT_ID')
env('GITHUB_CLIENT_SECRET')
```

### Next.js

```ts
process.env.NEXT_PUBLIC_API_URL
process.env.NEXT_PUBLIC_APP_URL
process.env.LARAVEL_API_URL
```

## Recommended Example Files

### Root `.env.example`

```env
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
DB_PORT=5432
API_PORT=8000
CLIENT_PORT=3000
```

### Backend `api/.env.example`

```env
APP_URL=http://your-api-host
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://your-app-host/auth-callback
GITHUB_TOKEN=your_github_token
IBM_BOB_API_KEY=your_ibm_bob_api_key
```

### Frontend `client/.env.example`

```env
NEXT_PUBLIC_API_URL=http://your-api-host
NEXT_PUBLIC_APP_URL=http://your-app-host
LARAVEL_API_URL=http://your-api-host
```

## Why Separation Matters

- Laravel expects secrets server-side only
- Next.js exposes `NEXT_PUBLIC_*` values to the browser
- Docker Compose needs orchestration values, but not application secrets
- Shared root secrets increase the risk of accidental frontend exposure

## Security Checklist

- No real credentials in markdown
- No real credentials in `.env.example`
- No hardcoded secrets in frontend code
- No hardcoded secrets in backend code
- No private callback secrets or client secrets in documentation

## Operational Follow-Up

If any real credentials were ever committed previously, rotate them:

1. Database passwords
2. GitHub OAuth client secret
3. GitHub personal access tokens
4. IBM or other AI provider API keys
5. Any webhook or callback signing secrets

---

**Status:** Sanitized for public repository use
