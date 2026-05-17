# GitHub OAuth Authentication Guide

## Overview

This guide documents the GitHub OAuth implementation for the AGA (Architecture Governance Agent) system, allowing users to authenticate via GitHub and grant repository access permissions.

## Features

- ✅ GitHub OAuth 2.0 authentication
- ✅ Automatic user account creation/linking
- ✅ Repository access with `repo` scope
- ✅ Secure token storage
- ✅ OAuth-only accounts (no password required)
- ✅ Account linking for existing users

## Backend Implementation

### 1. Dependencies

```bash
composer require laravel/socialite
```

### 2. Configuration

#### Environment Variables (`api/.env`)

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://your-app-host/auth-callback
```

#### Services Configuration (`config/services.php`)
```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => env('GITHUB_REDIRECT_URI'),
    'scopes' => ['user:email', 'read:user', 'repo'],
],
```

### 3. Database Schema

Migration: `2026_05_17_045145_add_github_oauth_fields_to_users_table.php`

Added fields to `users` table:

- `github_id` (string, unique, nullable) - GitHub user ID
- `github_token` (text, nullable) - Access token for GitHub API
- `github_refresh_token` (text, nullable) - Refresh token
- `avatar` (string, nullable) - Profile picture URL
- `password` (nullable) - Allow OAuth-only accounts

### 4. Controller

**File:** `api/app/Http/Controllers/GitHubOAuthController.php`

**Methods:**

- `redirectToGitHub()` - Initiates OAuth flow, returns authorization URL
- `handleGitHubCallback()` - Processes callback, creates/updates user, returns token
- `disconnectGitHub()` - Removes GitHub connection (requires password set)

### 5. API Routes

**File:** `api/routes/api.php`

**Public Routes:**

```php
GET  /api/auth/github           - Get GitHub OAuth URL
GET  /api/auth/github/callback  - Handle OAuth callback
```

**Protected Routes:**

```php
POST /api/auth/github/disconnect - Disconnect GitHub account
```

## Frontend Implementation

### 1. Authentication Service

**File:** `client/lib/auth.ts`

**New Methods:**

```typescript
getGitHubAuthUrl(): Promise<{ url: string }>
handleGitHubCallback(code: string): Promise<AuthResponse>
disconnectGitHub(): Promise<{ message: string }>
```

**Updated User Interface:**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  github_id?: string | null;
  // ...
}
```

### 2. Login/Register Pages

**Files:**

- `client/app/(auth-pages)/login/page.tsx`
- `client/app/(auth-pages)/register/page.tsx`

**Features:**

- GitHub OAuth button with loading state
- Redirects to GitHub authorization page
- Error handling with toast notifications

### 3. OAuth Callback Page

**File:** `client/app/(auth-pages)/auth-callback/page.tsx`

**Functionality:**

- Receives authorization code from GitHub
- Exchanges code for access token
- Stores token and redirects to dashboard
- Handles errors gracefully

## OAuth Flow

### User Journey

1. **User clicks "GitHub" button** on login/register page
2. **Frontend requests OAuth URL** from backend (`GET /api/auth/github`)
3. **Backend generates URL** with scopes and redirects user to GitHub
4. **User authorizes** the application on GitHub
5. **GitHub redirects** to callback URL with authorization code
6. **Frontend callback page** receives code and sends to backend
7. **Backend exchanges code** for access token via GitHub API
8. **Backend creates/updates user** with GitHub data
9. **Backend returns** API token to frontend
10. **Frontend stores token** and redirects to dashboard

### Technical Flow

```
┌─────────┐      ┌──────────┐      ┌────────┐      ┌────────┐
│ Browser │      │ Frontend │      │ Backend│      │ GitHub │
└────┬────┘      └────┬─────┘      └───┬────┘      └───┬────┘
     │                │                 │               │
     │ Click GitHub   │                 │               │
     ├───────────────>│                 │               │
     │                │ GET /auth/github│               │
     │                ├────────────────>│               │
     │                │                 │ Generate URL  │
     │                │<────────────────┤               │
     │ Redirect to GitHub               │               │
     ├──────────────────────────────────┴──────────────>│
     │                                                   │
     │                User Authorizes                    │
     │<──────────────────────────────────────────────────┤
     │ Redirect with code                                │
     │                                                    │
     │ /auth-callback?code=xxx                           │
     ├───────────────>│                                  │
     │                │ GET /auth/github/callback?code=  │
     │                ├────────────────>│                │
     │                │                 │ Exchange code  │
     │                │                 ├───────────────>│
     │                │                 │<───────────────┤
     │                │                 │ Create/Update  │
     │                │                 │ User & Token   │
     │                │<────────────────┤                │
     │                │ Store token     │                │
     │                │ Redirect /app   │                │
     │<───────────────┤                 │                │
```

## Security Considerations

### Token Storage

- Access tokens stored encrypted in database
- Frontend stores API token in localStorage
- Tokens used for GitHub API calls to access repositories

### Scopes

- `user:email` - Read user email addresses
- `read:user` - Read user profile data
- `repo` - Full repository access (required for code analysis)

### Account Linking

- Existing users can link GitHub account via email match
- OAuth-only accounts have random password (can't login with password)
- Users must set password before disconnecting GitHub

## Testing the Implementation

### 1. Start Servers

```bash
# Backend
cd api
php artisan serve

# Frontend
cd client
npm run dev
```

### 2. Test OAuth Flow

1. Navigate to `${NEXT_PUBLIC_APP_URL}/login`
2. Click "GitHub" button
3. Authorize on GitHub
4. Verify redirect to dashboard
5. Check user profile shows GitHub avatar

### 3. Verify Database

```sql
SELECT id, name, email, github_id, avatar FROM users WHERE github_id IS NOT NULL;
```

### 4. Test API Endpoints

```bash
# Get OAuth URL
curl "${APP_URL}/api/auth/github"

# Test callback (with valid code)
curl "${APP_URL}/api/auth/github/callback?code=GITHUB_CODE"

# Disconnect GitHub (requires auth token)
curl -X POST "${APP_URL}/api/auth/github/disconnect" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

**1. "Invalid redirect URI"**

- Ensure GitHub App callback URL matches `GITHUB_REDIRECT_URI` in `.env`
- URL must be exact match (including protocol and port)

**2. "Insufficient scope"**

- Verify `repo` scope is included in `config/services.php`
- User may need to re-authorize with new scopes

**3. "User email not found"**

- GitHub user must have public email or grant email scope
- Check GitHub account email settings

**4. "Cannot disconnect GitHub"**

- OAuth-only accounts need password set first
- Use password reset flow to set password

### Debug Mode

Enable detailed error messages:

```php
// In GitHubOAuthController.php
catch (\Exception $e) {
    \Log::error('GitHub OAuth Error', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    // ...
}
```

## Future Enhancements

- [ ] Token refresh mechanism
- [ ] Multiple OAuth providers (GitLab, Bitbucket)
- [ ] Fine-grained repository permissions
- [ ] OAuth token expiration handling
- [ ] Admin panel for OAuth app management

## References

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Laravel Socialite Documentation](https://laravel.com/docs/11.x/socialite)
- [GitHub API Scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)

---

**Made with Bob** 🤖
