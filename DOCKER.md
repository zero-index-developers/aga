# Docker Setup Guide

This project includes Docker configurations for both **development** and **production** environments with hot reload support.

## 📁 Project Structure

```
aga/
├── docker-compose.yml      # Development configuration with hot reload
├── .env.docker                 # Environment variables template
├── api/
│   ├── Dockerfile          # Development API image
│   └── .dockerignore
├── client/
│   ├── Dockerfile          # Development client image
│   └── .dockerignore
└── database/                   # PostgreSQL (uses official image)
```

## 🚀 Quick Start

### Development Mode (with Hot Reload)

1. **Copy environment file:**
   ```bash
   cp .env.docker .env
   ```

2. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **View logs:**
   ```bash
   docker-compose -f docker-compose.yml logs -f
   ```

4. **Access services:**
   - Frontend: use the host defined by `CLIENT_PORT`
   - Backend API: use the host defined by `API_PORT`
   - Database: use the host defined by `DB_PORT`

### Development

```bash
# Start services
docker-compose -f docker-compose.yml up -d

# Stop services
docker-compose -f docker-compose.yml down

# Rebuild containers
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose -f docker-compose.yml logs -f

# View specific service logs
docker-compose -f docker-compose.yml logs -f client
docker-compose -f docker-compose.yml logs -f api

# Execute commands in containers
docker-compose -f docker-compose.yml exec api php artisan migrate
docker-compose -f docker-compose.yml exec api php artisan db:seed
docker-compose -f docker-compose.yml exec client npm install

# Access container shell (Alpine uses 'sh', not 'bash')
docker-compose -f docker-compose.yml exec api sh
docker-compose -f docker-compose.yml exec client sh

# Or use bash if installed (for API container with bash installed)
docker-compose -f docker-compose.yml exec api bash

# Access database shell
docker-compose -f docker-compose.yml exec database psql -U "$DB_USERNAME" -d "$DB_DATABASE"
```

## 🔥 Hot Reload Features

### Next.js Client (Development)
- **File watching enabled** with polling for Docker compatibility
- Changes to `.tsx`, `.ts`, `.jsx`, `.js` files trigger automatic reload
- Changes to `tailwind.config.js` and CSS files reload instantly
- Environment variables: `WATCHPACK_POLLING=true` and `CHOKIDAR_USEPOLLING=true`

### Laravel API (Development)
- **Automatic reload** via `php artisan serve`
- Changes to PHP files, routes, and controllers reload automatically
- Database migrations can be run without restarting containers
- Composer dependencies are installed on container start

## 📦 Container Details

### Database (PostgreSQL 16)
- **Image:** `postgres:16-alpine`
- **Port:** 5432
- **Volume:** Persistent data storage
- **Health check:** Ensures database is ready before starting dependent services

### API (Laravel)
- **Base Image:** `php:8.3-fpm-alpine`
- **Port:** 8000
- **Features:**
  - PHP extensions: PDO, PostgreSQL, mbstring, zip, bcmath, gd
  - Composer for dependency management
  - Node.js and npm for asset compilation
  - Hot reload in development mode

### Client (Next.js)
- **Base Image:** `node:20-alpine`
- **Port:** 3000
- **Features:**
  - Multi-stage build for production (optimized size)
  - Standalone output for minimal runtime
  - Hot reload with file watching in development
  - Automatic dependency installation

## 🔧 Environment Variables

Key environment variables in `.env`:

```env
# Application
APP_NAME=AGA
APP_ENV=local                    # local for dev, production for prod
APP_DEBUG=true                   # true for dev, false for prod
APP_URL=http://your-api-host

# Database
DB_CONNECTION=pgsql
DB_HOST=database                 # Container name
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Ports
API_PORT=8000
CLIENT_PORT=3000

# Next.js
NODE_ENV=development             # development for dev, production for prod
NEXT_PUBLIC_API_URL=http://your-api-host
```

## 🐛 Troubleshooting

### Hot Reload Not Working

**Next.js:**
```bash
# Ensure polling is enabled
docker-compose -f docker-compose.yml exec client sh
echo $WATCHPACK_POLLING  # Should output: true
echo $CHOKIDAR_USEPOLLING  # Should output: true
```

**Laravel:**
```bash
# Check if artisan serve is running
docker-compose -f docker-compose.yml logs api
```

### Permission Issues

```bash
# Fix permissions on host
sudo chown -R $USER:$USER api/ client/

# Rebuild containers
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d --build
```

### Database Connection Issues

```bash
# Check database health
docker-compose -f docker-compose.yml ps

# View database logs
docker-compose -f docker-compose.yml logs database

# Restart database
docker-compose -f docker-compose.yml restart database
```

### Port Already in Use

```bash
# Change ports in .env file
API_PORT=8001
CLIENT_PORT=3001
DB_PORT=5433

# Restart services
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d
```

## 🧹 Cleanup

```bash
# Stop and remove containers, networks
docker-compose -f docker-compose.yml down

# Remove volumes (WARNING: deletes database data)
docker-compose -f docker-compose.yml down -v

# Remove images
docker-compose -f docker-compose.yml down --rmi all

# Complete cleanup
docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans
```

## 📝 Notes

- **Development mode** mounts source code as volumes for hot reload
- Database data persists in named volumes
- Node modules and vendor directories use anonymous volumes to avoid conflicts
- Health checks ensure services start in correct order

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Docker Documentation](https://laravel.com/docs/deployment#docker)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
