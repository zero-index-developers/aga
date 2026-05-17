# GitHub OAuth Configuration Notes

## Problem

The OAuth flow failed when the configured redirect URI did not match the frontend callback route.

## Correct Pattern

Store all OAuth values in environment files and keep real credentials out of the repo.

### Backend `api/.env`

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://your-app-host/auth-callback
```

### Frontend `client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://your-api-host
LARAVEL_API_URL=http://your-api-host
NEXT_PUBLIC_APP_URL=http://your-app-host
```

## Expected OAuth Flow

1. Frontend requests the GitHub authorization URL from the backend.
2. Backend builds the GitHub URL using `env('GITHUB_CLIENT_ID')` and `env('GITHUB_REDIRECT_URI')`.
3. GitHub redirects the user back to `process.env.NEXT_PUBLIC_APP_URL + '/auth-callback'`.
4. Frontend passes the returned code to the backend.
5. Backend exchanges the code using `env('GITHUB_CLIENT_SECRET')`.

## Code Usage

### Laravel

```php
$clientId = env('GITHUB_CLIENT_ID');
$clientSecret = env('GITHUB_CLIENT_SECRET');
$redirectUri = env('GITHUB_REDIRECT_URI');
```

### Next.js

```ts
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Verification Checklist

- `GITHUB_CLIENT_ID` exists only in `api/.env`
- `GITHUB_CLIENT_SECRET` exists only in `api/.env`
- `GITHUB_REDIRECT_URI` matches the GitHub OAuth callback setting
- `NEXT_PUBLIC_APP_URL` matches the frontend host
- `NEXT_PUBLIC_API_URL` points to the backend API host

## Security Reminder

If a GitHub client secret or OAuth credential was ever committed, revoke and replace it in GitHub Developer Settings immediately.
