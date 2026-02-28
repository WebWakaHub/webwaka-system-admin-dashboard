# Development Environment Setup Guide

**Document Type:** Developer Guide  
**Owner:** webwakaagent4 (Engineering & Delivery)  
**Status:** COMPLETE  
**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Phase:** Phase 2 - Milestone 2 - Week 3

---

## Overview

This guide provides step-by-step instructions for setting up a local development environment for the WebWaka Platform Core.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js 20+**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **pnpm 8+**
   - Install: `npm install -g pnpm`
   - Verify installation: `pnpm --version`

3. **Docker 24+**
   - Download from [docker.com](https://www.docker.com/)
   - Verify installation: `docker --version`

4. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Optional but Recommended

- **Visual Studio Code** - Recommended IDE
- **PostgreSQL Client** - For database management (pgAdmin, DBeaver, etc.)
- **Redis Client** - For Redis management (RedisInsight, etc.)

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/WebWakaHub/webwaka-platform-core.git

# Navigate to the project directory
cd webwaka-platform-core
```

---

## Step 2: Install Dependencies

```bash
# Install all project dependencies
pnpm install
```

This will install all required packages defined in `package.json`.

---

## Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your local configuration
nano .env  # or use your preferred editor
```

### Key Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://webwaka:webwaka@localhost:5432/webwaka_platform_core
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-local-secret-key
```

---

## Step 4: Start Development Services

### Option A: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

### Option B: Manual Installation

If you prefer to install PostgreSQL and Redis manually:

**PostgreSQL:**
```bash
# Install PostgreSQL 15+
# Create database
createdb webwaka_platform_core

# Create user
psql -c "CREATE USER webwaka WITH PASSWORD 'webwaka';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE webwaka_platform_core TO webwaka;"
```

**Redis:**
```bash
# Install Redis 7+
# Start Redis server
redis-server
```

---

## Step 5: Set Up the Database

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database with initial data
pnpm db:seed
```

---

## Step 6: Start the Development Server

```bash
# Start the development server with hot reload
pnpm dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

---

## Step 7: Verify Installation

### Check API Health

```bash
# Test the API health endpoint
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-07T10:00:00Z",
  "version": "0.1.0-alpha"
}
```

### Run Tests

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

---

## Development Workflow

### Running the Application

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Quality

```bash
# Run linter
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm typecheck
```

### Database Management

```bash
# Create a new migration
pnpm prisma migrate dev --name <migration_name>

# Apply migrations
pnpm db:migrate

# Reset database (WARNING: destroys all data)
pnpm prisma migrate reset

# Open Prisma Studio (database GUI)
pnpm prisma studio
```

### Testing

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run end-to-end tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

---

## IDE Setup (Visual Studio Code)

### Recommended Extensions

Install these VS Code extensions for the best development experience:

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **TypeScript** - Built-in
4. **Prisma** - `Prisma.prisma`
5. **GitLens** - `eamodio.gitlens`
6. **Docker** - `ms-azuretools.vscode-docker`
7. **REST Client** - `humao.rest-client`

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Docker Development

### Build Docker Image

```bash
# Build the Docker image
docker build -t webwaka-platform-core:dev .

# Run the container
docker run -p 3000:3000 --env-file .env webwaka-platform-core:dev
```

### Docker Compose

```bash
# Start all services (app, database, redis)
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=3001
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
psql -h localhost -U webwaka -d webwaka_platform_core
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test connection
redis-cli ping
```

### Dependency Issues

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules
pnpm install
```

---

## Project Structure

```
webwaka-platform-core/
├── .github/              # GitHub Actions workflows
├── docs/                 # Documentation
│   ├── architecture/     # Architecture docs
│   ├── api/              # API documentation
│   └── guides/           # Developer guides
├── src/                  # Source code
│   ├── core/             # Core services
│   ├── shared/           # Shared utilities
│   └── types/            # TypeScript types
├── tests/                # Test suites
├── scripts/              # Build/deployment scripts
├── config/               # Configuration files
├── .env.example          # Environment variables template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── docker-compose.yml    # Docker services
```

---

## Next Steps

After setting up your development environment:

1. Read the [Architecture Documentation](../architecture/DATABASE_SCHEMA_DESIGN.md)
2. Review the [API Specification](../api/API_SPECIFICATION.md)
3. Check the [Contributing Guidelines](../../CONTRIBUTING.md)
4. Join the development team on Slack/Discord
5. Pick up a task from the GitHub Issues

---

## Getting Help

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing GitHub Issues
3. Ask in the development team chat
4. Create a new GitHub Issue with details

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

**Status:** Week 3 Deliverable - Development Environment Setup Guide ✅ COMPLETE

**Maintained by:** webwakaagent4 (Engineering & Delivery)  
**Last Updated:** 2026-02-07
