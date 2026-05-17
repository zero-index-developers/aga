#!/bin/bash

echo "🚀 Setting up AGA environment variables..."
echo ""

# Root .env for Docker
if [ ! -f .env ]; then
    echo "📝 Creating root .env from .env.example..."
    cp .env.example .env
    echo "✅ Root .env created"
else
    echo "⏭️  Root .env already exists"
fi

echo ""

# Backend .env
if [ ! -f api/.env ]; then
    echo "📝 Creating api/.env from api/.env.example..."
    cp api/.env.example api/.env
    echo "🔑 Generating Laravel application key..."
    cd api && php artisan key:generate && cd ..
    echo "✅ Backend .env created"
    echo ""
    echo "⚠️  IMPORTANT: Update api/.env with your credentials:"
    echo "   - GITHUB_CLIENT_ID (from https://github.com/settings/developers)"
    echo "   - GITHUB_CLIENT_SECRET"
    echo "   - DB_* variables (if not using Docker)"
else
    echo "⏭️  Backend .env already exists"
fi

echo ""

# Frontend .env
if [ ! -f client/.env.local ]; then
    echo "📝 Creating client/.env.local from client/.env.example..."
    cp client/.env.example client/.env.local
    echo "✅ Frontend .env created"
else
    echo "⏭️  Frontend .env already exists"
fi

echo ""
echo "✨ Environment setup complete!"
echo ""
echo "📚 Next steps:"
echo ""
echo "1. Configure GitHub OAuth:"
echo "   - Go to: https://github.com/settings/developers"
echo "   - Create OAuth App with callback: http://127.0.0.1:3000/auth-callback"
echo "   - Copy Client ID and Secret to api/.env"
echo ""
echo "2. Start the application:"
echo ""
echo "   Option A - Docker (Recommended):"
echo "   $ docker-compose up -d"
echo ""
echo "   Option B - Local Development:"
echo "   Terminal 1: cd api && php artisan serve"
echo "   Terminal 2: cd client && npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://127.0.0.1:3000"
echo "   - Backend API: http://127.0.0.1:8000"
echo ""
echo "📖 For more information, see:"
echo "   - docs/GITHUB_OAUTH_FIX.md"
echo "   - docs/ENVIRONMENT_VARIABLES_ANALYSIS.md"
echo ""

# Made with Bob
