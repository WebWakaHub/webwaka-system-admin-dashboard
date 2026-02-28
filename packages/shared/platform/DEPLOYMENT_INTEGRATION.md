# WebWaka Platform - Deployment Integration Guide

## Overview

This guide describes how the WebWaka Platform application is integrated with the deployment infrastructure, including Docker containerization, ECS deployment, and GitHub Actions CI/CD workflows.

## Architecture

The deployment pipeline consists of the following components:

1. **GitHub Actions** - CI/CD orchestration
2. **Docker** - Application containerization
3. **Amazon ECR** - Docker image registry
4. **Amazon ECS** - Container orchestration
5. **Application Load Balancer** - Traffic distribution
6. **CloudFront** - CDN for static assets
7. **Cloudflare** - DNS and security

## Docker Configuration

### Dockerfile

The application is containerized using a multi-stage Dockerfile:

**Stage 1: Builder**
- Node.js 18 Alpine base image
- Installs dependencies using pnpm
- Builds the application
- Runs tests

**Stage 2: Runtime**
- Node.js 18 Alpine base image
- Copies built application from builder stage
- Creates non-root user for security
- Exposes port 3000
- Includes health check

### Docker Compose

For local development and testing:

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f app

# Run specific service
docker-compose up -d postgres
```

Services included:
- **app** - WebWaka application
- **postgres** - PostgreSQL database
- **redis** - Redis cache
- **pgadmin** - Database management UI

## Deployment Configuration

### ECS Task Definition

The `task-definition.json` file defines how the application runs in ECS:

**Key Configuration:**
- **Image:** ECR image URL with version tag
- **Port:** 3000 (container port)
- **Memory:** 1024 MB
- **CPU:** 512 units
- **Environment Variables:** NODE_ENV, LOG_LEVEL
- **Secrets:** Database URL, Redis URL (from Secrets Manager)
- **Logging:** CloudWatch Logs
- **Health Check:** HTTP endpoint at /health

### Environment-Specific Configuration

**Production:**
- Instance Type: t3.large
- Auto-scaling: 2-10 instances
- Multi-AZ RDS: Enabled
- Backup Retention: 30 days

**Staging:**
- Instance Type: t3.medium
- Auto-scaling: 1-5 instances
- Single-AZ RDS: Enabled
- Backup Retention: 7 days

**Development:**
- Instance Type: t3.small
- Auto-scaling: 1-2 instances
- Micro RDS: Enabled
- Backup Retention: 1 day

## Deployment Scripts

### Deploy Script (`scripts/deploy.sh`)

Deploys the application to a specific environment.

**Usage:**
```bash
./scripts/deploy.sh [environment] [version]
```

**Parameters:**
- `environment` - dev, staging, or prod (default: staging)
- `version` - Docker image version (default: latest)

**Steps:**
1. Build Docker image
2. Login to ECR
3. Push image to ECR
4. Update ECS task definition
5. Update ECS service
6. Wait for deployment to stabilize
7. Verify deployment

**Example:**
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy specific version to production
./scripts/deploy.sh prod v1.2.3
```

### Rollback Script (`scripts/rollback.sh`)

Rolls back to the previous task definition.

**Usage:**
```bash
./scripts/rollback.sh [environment]
```

**Parameters:**
- `environment` - dev, staging, or prod (default: staging)

**Steps:**
1. Get current task definition
2. Get previous task definition
3. Verify previous task definition exists
4. Update ECS service with previous task definition
5. Wait for rollback to stabilize
6. Verify rollback

**Example:**
```bash
# Rollback staging deployment
./scripts/rollback.sh staging

# Rollback production deployment
./scripts/rollback.sh prod
```

### Health Check Script (`scripts/health-check.sh`)

Checks the health of the deployed application.

**Usage:**
```bash
./scripts/health-check.sh [environment]
```

**Parameters:**
- `environment` - dev, staging, or prod (default: staging)

**Checks:**
1. ECS service running task count
2. ALB target health
3. API endpoint health
4. RDS database status
5. CloudFront distribution status

**Example:**
```bash
# Check staging health
./scripts/health-check.sh staging

# Check production health
./scripts/health-check.sh prod
```

## GitHub Actions Integration

### CI Workflow (`.github/workflows/ci.yml`)

Triggered on push and pull requests.

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Lint code
5. Build application
6. Run unit tests
7. Run integration tests
8. Generate coverage report
9. Upload coverage to Codecov

**Artifacts:**
- Coverage report
- Build artifacts

### CD Workflow (`.github/workflows/cd.yml`)

Triggered on push to main, staging, develop branches.

**Steps:**
1. Checkout code
2. Configure AWS credentials
3. Login to ECR
4. Build Docker image
5. Push image to ECR
6. Update ECS task definition
7. Deploy to ECS
8. Run smoke tests
9. Send Slack notification

**Deployment Environments:**
- **main** → production
- **staging** → staging
- **develop** → development

### Security Workflow (`.github/workflows/security.yml`)

Triggered daily and on pull requests.

**Scans:**
- SAST (SonarQube)
- Dependency scanning (Snyk)
- Container scanning (Trivy)
- Secret scanning (TruffleHog)
- CodeQL analysis

### Performance Workflow (`.github/workflows/performance.yml`)

Triggered daily and on pull requests.

**Tests:**
- k6 load testing
- Performance baseline comparison
- Response time analysis
- Throughput measurement

## Application Requirements

### Environment Variables

The application requires the following environment variables:

**Required:**
- `NODE_ENV` - Environment (development, staging, production)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**Optional:**
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `PORT` - Application port (default: 3000)
- `API_KEY` - API authentication key
- `JWT_SECRET` - JWT signing secret

### Health Check Endpoint

The application must expose a health check endpoint at `/health`:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});
```

### Graceful Shutdown

The application should handle SIGTERM signal for graceful shutdown:

```javascript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

### Logging

Use structured logging for better observability:

```javascript
const logger = require('./logger');

logger.info('Application started', { version: '1.0.0' });
logger.error('Error occurred', { error: err.message });
```

## Deployment Workflow

### Development Deployment

1. Create feature branch
2. Make code changes
3. Push to GitHub
4. CI workflow runs automatically
5. Create pull request
6. Code review
7. Merge to develop branch
8. CD workflow deploys to development environment

### Staging Deployment

1. Create release branch from develop
2. Update version number
3. Create pull request to staging branch
4. Code review
5. Merge to staging branch
6. CD workflow deploys to staging environment
7. Run smoke tests
8. Verify in staging

### Production Deployment

1. Create release branch from staging
2. Update version number
3. Create pull request to main branch
4. Code review and approval
5. Merge to main branch
6. CD workflow deploys to production environment
7. Run smoke tests
8. Monitor in production

## Monitoring and Logging

### CloudWatch Logs

Application logs are sent to CloudWatch:

- Log Group: `/aws/ecs/webwaka-app`
- Log Stream: `ecs/<task-id>`

### CloudWatch Metrics

Custom metrics are published to CloudWatch:

- Request count
- Response time
- Error rate
- Database query time
- Cache hit rate

### Alerts

Alerts are configured for:

- High error rate (>5% in 5 minutes)
- High response time (>500ms p95)
- Database connection failures
- Memory usage >80%
- Disk usage >80%

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify Docker image builds successfully
3. Check ECR image exists
4. Verify ECS task definition is valid
5. Check IAM permissions

### Application Not Starting

1. Check CloudWatch logs
2. Verify environment variables are set
3. Check database connectivity
4. Check Redis connectivity
5. Review application startup logs

### Health Check Fails

1. Verify application is listening on port 3000
2. Check `/health` endpoint is accessible
3. Verify security groups allow traffic
4. Check ALB target group configuration
5. Review application logs

### Performance Issues

1. Check CloudWatch metrics
2. Review application logs
3. Check database query performance
4. Monitor memory and CPU usage
5. Review cache hit rates

## Best Practices

1. **Version Control:** Always tag releases with version numbers
2. **Testing:** Run all tests before deployment
3. **Monitoring:** Monitor application metrics continuously
4. **Logging:** Use structured logging for better observability
5. **Secrets:** Store secrets in Secrets Manager, not in code
6. **Health Checks:** Implement proper health check endpoints
7. **Graceful Shutdown:** Handle shutdown signals properly
8. **Documentation:** Keep deployment documentation up to date

## References

- [Docker Documentation](https://docs.docker.com/)
- [Amazon ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)
