# AGA Backend - Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- GitHub Personal Access Token
- (Optional) IBM Bob API credentials

## Quick Setup (5 minutes)

### 1. Start Docker Services

From the project root:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5433)
- Laravel API (port 8000)
- Next.js client (port 3000)

### 2. Install Dependencies

```bash
docker-compose exec api composer install
```

### 3. Configure Environment

```bash
docker-compose exec api cp .env.example .env
docker-compose exec api php artisan key:generate
```

Edit `api/.env` and add your GitHub token:

```env
GITHUB_TOKEN=ghp_your_github_token_here
```

**Get GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `repo` or `public_repo`
4. Copy token to `.env`

### 4. Run Migrations

```bash
docker-compose exec api php artisan migrate
```

### 5. Start Queue Worker

```bash
docker-compose exec api php artisan queue:work &
```

### 6. Test the API

```bash
# Health check
curl http://localhost:8000/api/health

# Connect a repository
curl -X POST http://localhost:8000/api/repositories/connect \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/laravel/laravel"}'

# Check status (use the ID from previous response)
curl http://localhost:8000/api/repositories/1/status

# Get graph data (wait until status is "completed")
curl http://localhost:8000/api/repositories/1/graph

# Query AI
curl -X POST http://localhost:8000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "repository_id": 1,
    "question": "What is the authentication system?"
  }'
```

## API Endpoints Summary

### Repositories
- `GET /api/repositories` - List all repositories
- `POST /api/repositories/connect` - Connect new repository
- `GET /api/repositories/{id}` - Get repository details
- `GET /api/repositories/{id}/status` - Check processing status
- `GET /api/repositories/{id}/graph` - Get graph visualization data
- `POST /api/repositories/{id}/rescan` - Trigger rescan
- `DELETE /api/repositories/{id}` - Delete repository

### AI Oracle
- `POST /api/ai/query` - Ask AI about the codebase
- `POST /api/ai/blast-radius` - Get impact analysis for a node
- `GET /api/ai/history/{repositoryId}` - Get query history
- `GET /api/ai/status` - Check AI service status

## Repository Status Flow

1. **pending** → Repository record created
2. **cloning** → Downloading from GitHub
3. **analyzing** → Parsing code structure
4. **completed** → Ready for queries ✅
5. **failed** → Error occurred ❌

## Demo Mode (Without IBM Bob)

The system works perfectly without IBM Bob credentials! It provides intelligent demo responses for:

- **Authentication questions**: "Why is there a delay in auth?"
- **Payment questions**: "How does payment processing work?"
- **Database questions**: "Why use PostgreSQL?"
- **Security questions**: "What if I bypass the middleware?"

Perfect for hackathon demos and development!

## Troubleshooting

### "Repository clone failed"
- Check GitHub token permissions
- Verify repository is public or token has access
- Check disk space

### "Queue not processing"
- Ensure queue worker is running: `php artisan queue:work`
- Check database connection
- Review logs: `storage/logs/laravel.log`

### "Database connection refused"
- Wait for database to be ready (check with `docker-compose ps`)
- Verify database credentials in `.env`

## Next Steps

1. ✅ Connect a test repository
2. ✅ Wait for analysis to complete
3. ✅ Query the graph data
4. ✅ Test AI queries
5. 🚀 Integrate with frontend

## Full Documentation

See `IMPLEMENTATION_GUIDE.md` for complete documentation including:
- Detailed architecture
- All API endpoints
- Service descriptions
- Production deployment
- Advanced troubleshooting

## Support

- Check logs: `docker-compose logs api`
- Laravel logs: `api/storage/logs/laravel.log`
- Database: `docker-compose exec database psql -U aga_user -d aga_db`