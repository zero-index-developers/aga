@echo off
echo 🚀 Setting up AGA environment variables...
echo.

REM Root .env for Docker
if not exist .env (
    echo 📝 Creating root .env from .env.example...
    copy .env.example .env >nul
    echo ✅ Root .env created
) else (
    echo ⏭️  Root .env already exists
)

echo.

REM Backend .env
if not exist api\.env (
    echo 📝 Creating api\.env from api\.env.example...
    copy api\.env.example api\.env >nul
    echo 🔑 Generating Laravel application key...
    cd api
    php artisan key:generate
    cd ..
    echo ✅ Backend .env created
    echo.
    echo ⚠️  IMPORTANT: Update api\.env with your credentials:
    echo    - GITHUB_CLIENT_ID (from https://github.com/settings/developers^)
    echo    - GITHUB_CLIENT_SECRET
    echo    - DB_* variables (if not using Docker^)
) else (
    echo ⏭️  Backend .env already exists
)

echo.

REM Frontend .env
if not exist client\.env.local (
    echo 📝 Creating client\.env.local from client\.env.example...
    copy client\.env.example client\.env.local >nul
    echo ✅ Frontend .env created
) else (
    echo ⏭️  Frontend .env already exists
)

echo.
echo ✨ Environment setup complete!
echo.
echo 📚 Next steps:
echo.
echo 1. Configure GitHub OAuth:
echo    - Go to: https://github.com/settings/developers
echo    - Create OAuth App with callback: http://127.0.0.1:3000/auth-callback
echo    - Copy Client ID and Secret to api\.env
echo.
echo 2. Start the application:
echo.
echo    Option A - Docker (Recommended^):
echo    $ docker-compose up -d
echo.
echo    Option B - Local Development:
echo    Terminal 1: cd api ^&^& php artisan serve
echo    Terminal 2: cd client ^&^& npm run dev
echo.
echo 3. Access the application:
echo    - Frontend: http://127.0.0.1:3000
echo    - Backend API: http://127.0.0.1:8000
echo.
echo 📖 For more information, see:
echo    - docs\GITHUB_OAUTH_FIX.md
echo    - docs\ENVIRONMENT_VARIABLES_ANALYSIS.md
echo.
pause

@REM Made with Bob
