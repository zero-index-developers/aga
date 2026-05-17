# Environment Variables Setup Guide

## Overview

AGA uses a three-file environment setup:

1. Root `.env` for Docker Compose orchestration only
2. `api/.env` for Laravel backend secrets and service configuration
3. `client/.env.local` for Next.js frontend runtime values

Keep all real secrets out of version control. Only commit placeholder values in `.env.example` files.

## Quick Setup

### Manual Setup

1. Copy the root template:
   ```bash
   cp .env.example .env
   ```
2. Copy the backend template and generate the Laravel key:
   ```bash
   cp api/.env.example api/.env
   cd api
   php artisan key:generate
   cd ..
   ```
3. Copy the frontend template:
   ```bash
   cp client/.env.example client/.env.local
   ```

## Environment Variable Reference

### Root `.env`

Use this file for Docker Compose only.

```env
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
DB_PORT=5432

API_PORT=8000
CLIENT_PORT=3000
```

### Backend `api/.env`

Use this file for Laravel-only configuration and secrets.

```env
APP_NAME=AGA
APP_ENV=local
APP_KEY=base64:generated-by-artisan
APP_DEBUG=true
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
GITHUB_API_URL=https://api.github.com

IBM_BOB_ENABLED=false
IBM_BOB_API_KEY=your_ibm_bob_api_key
IBM_BOB_API_URL=https://your-ibm-endpoint
IBM_BOB_MODEL=your_model_name
```

### Frontend `client/.env.local`

Use this file for frontend runtime values only. Never place secrets in any `NEXT_PUBLIC_*` variable.

```env
NEXT_PUBLIC_API_URL=http://your-api-host
NEXT_PUBLIC_APP_URL=http://your-app-host
LARAVEL_API_URL=http://your-api-host
```

## GitHub OAuth Setup

1. Create an OAuth app in GitHub Developer Settings.
2. Set the homepage URL to the value you use for `NEXT_PUBLIC_APP_URL`.
3. Set the callback URL to the value you use for `GITHUB_REDIRECT_URI`.
4. Copy the generated client ID and client secret into `api/.env`.

Example:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://your-app-host/auth-callback
```

## Application Usage

When you need these values in code:

### Laravel

```php
config([
    'services.github.client_id' => env('GITHUB_CLIENT_ID'),
    'services.github.client_secret' => env('GITHUB_CLIENT_SECRET'),
    'app.url' => env('APP_URL'),
]);
```

### Next.js

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const internalApiUrl = process.env.LARAVEL_API_URL;
```

## Security Rules

- Commit only placeholder values in `.env.example`
- Keep `.env`, `api/.env`, and `client/.env.local` untracked
- Never put secrets in `NEXT_PUBLIC_*` variables
- Rotate any credential that was previously exposed
- Treat OAuth client secrets, API keys, tokens, and database passwords as compromised if they ever appeared in the repo

## Troubleshooting

### Missing `APP_KEY`

```bash
cd api
php artisan key:generate
```

### OAuth redirect mismatch

Make sure these two values match exactly:

- `api/.env` value for `GITHUB_REDIRECT_URI`
- GitHub OAuth app callback URL

### Frontend cannot reach backend

Check:

- `NEXT_PUBLIC_API_URL` in `client/.env.local`
- `LARAVEL_API_URL` in `client/.env.local`
- `APP_URL` in `api/.env`

---

**Last Updated:** 2026-05-17
