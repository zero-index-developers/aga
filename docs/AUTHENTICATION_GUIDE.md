# Authentication System Guide

## Overview
Complete authentication system implemented with Laravel Sanctum (backend) and Next.js (frontend).

## Backend (Laravel API)

### Endpoints

#### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Protected Endpoints (Require Bearer Token)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get authenticated user
- All `/api/repositories/*` routes
- All `/api/ai/*` routes

### Authentication Flow

1. **Register/Login**: Returns user object and Bearer token
2. **Token Storage**: Frontend stores token in localStorage
3. **API Requests**: Token sent in `Authorization: Bearer {token}` header
4. **Logout**: Revokes current token

### Testing with cURL

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get User (with token)
curl -X GET http://127.0.0.1:8000/api/auth/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Logout
curl -X POST http://127.0.0.1:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend (Next.js)

### Pages

- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Request password reset
- `/reset-password?token=xxx&email=xxx` - Reset password form
- `/app/*` - Protected dashboard routes

### Authentication Context

```typescript
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, loading, login, register, logout, isAuthenticated } = useAuth();
  
  // Use authentication methods
}
```

### Protected Routes

The middleware automatically:
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages
- Protects all `/app/*` routes

### Auth Service

```typescript
import { authService } from '@/lib/auth';

// Direct API calls (if not using context)
await authService.login({ email, password });
await authService.register({ name, email, password, password_confirmation });
await authService.logout();
await authService.getUser();
await authService.forgotPassword({ email });
await authService.resetPassword({ token, email, password, password_confirmation });
```

## Password Reset Flow

1. User clicks "Forgot Password" on login page
2. User enters email address
3. Backend sends reset link to email (check logs in development)
4. User clicks link: `/reset-password?token=xxx&email=xxx`
5. User enters new password
6. Password updated, user redirected to login

## Security Features

- ✅ Password hashing with bcrypt
- ✅ Token-based authentication (Sanctum)
- ✅ CSRF protection
- ✅ Rate limiting on auth endpoints
- ✅ Password confirmation required
- ✅ Minimum password length (8 characters)
- ✅ Protected routes middleware
- ✅ Token revocation on logout

## Environment Variables

### Backend (.env)
```env
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=aga
DB_USERNAME=postgres
DB_PASSWORD=admin

MAIL_MAILER=log
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Testing Checklist

- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Access protected route when authenticated
- [ ] Redirect to login when accessing protected route unauthenticated
- [ ] Request password reset
- [ ] Reset password with valid token
- [ ] Logout successfully
- [ ] Token revoked after logout

## Common Issues

### CORS Errors
- Ensure `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain
- Check that API URL is correct in frontend `.env`

### Token Not Working
- Verify token is being sent in `Authorization` header
- Check token is stored in localStorage
- Ensure token hasn't expired or been revoked

### Password Reset Email Not Received
- In development, check `storage/logs/laravel.log` for email content
- Configure SMTP settings for production

## File Structure

### Backend
```
api/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php
│   │   └── PasswordResetController.php
│   └── Models/
│       └── User.php (with HasApiTokens trait)
├── routes/
│   └── api.php (auth routes)
└── config/
    └── sanctum.php
```

### Frontend
```
client/
├── app/
│   ├── app/(auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   └── layout.tsx (with AuthProvider)
├── contexts/
│   └── auth-context.tsx
├── lib/
│   └── auth.ts (authService)
└── middleware.ts (route protection)
```

## Next Steps

1. Configure email service (Mailtrap, SendGrid, etc.)
2. Add email verification (optional)
3. Implement OAuth (GitHub, GitLab) (optional)
4. Add two-factor authentication (optional)
5. Implement remember me functionality (optional)

## Support

For issues or questions, refer to:
- Laravel Sanctum: https://laravel.com/docs/sanctum
- Next.js Authentication: https://nextjs.org/docs/authentication