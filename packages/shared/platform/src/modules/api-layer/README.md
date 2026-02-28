# API Layer Module

**Module ID:** Module 7  
**Version:** 1.0  
**Status:** Core Implementation Complete

## Overview

The API Layer is the unified entry point for all external communication with the WebWaka platform. It provides a consistent, secure, and scalable interface for all clients, including the WebWaka frontend, mobile applications, and third-party integrations.

## Features

### Core Functionality

- **API Gateway** - Single entry point for all API requests
- **Authentication** - JWT-based authentication with tenantId/userId extraction
- **Authorization** - Integration with WEEG (Permission System) for permission checks
- **Rate Limiting** - Redis-based distributed rate limiting per tenant/user
- **Request Validation** - Comprehensive request validation with detailed error messages
- **Request Routing** - Dynamic routing to downstream modules with pattern matching
- **Response Transformation** - Consistent response formatting for success and errors
- **API Versioning** - Support for multiple API versions (e.g., /api/v1/...)

### Compliance

- **Nigerian-First** - NDPR compliance, Nigerian data center support
- **Mobile-First & PWA-First** - Bandwidth optimization, latency tolerance
- **Multi-Tenant** - All requests scoped by tenantId
- **Audit-Ready** - All requests logged with full context

## Architecture

```
Client Request
    ↓
API Gateway
    ↓
Authentication (JWT)
    ↓
Rate Limiting (Redis)
    ↓
Authorization (WEEG)
    ↓
Request Validation
    ↓
Request Routing
    ↓
Downstream Module
    ↓
Response Transformation
    ↓
Client Response
```

## Components

### 1. API Gateway Service (`gateway/api-gateway.service.ts`)

Main orchestration service that coordinates all API Layer components.

**Key Methods:**
- `processRequest(request)` - Process incoming API request through full pipeline
- `getStatistics()` - Get gateway statistics
- `close()` - Cleanup resources

### 2. Authentication Service (`auth/authentication.service.ts`)

Handles JWT-based authentication.

**Key Methods:**
- `authenticate(authHeader, ipAddress, userAgent)` - Validate JWT and extract context
- `extractTenantId(authHeader)` - Extract tenant ID without full validation

### 3. Authorization Service (`auth/authorization.service.ts`)

Integrates with WEEG for permission checks.

**Key Methods:**
- `checkPermission(request)` - Check single permission
- `checkPermissionBatch(requests)` - Check multiple permissions
- `hasAnyPermission(tenantId, userId, permissions)` - Check if user has any permission
- `hasAllPermissions(tenantId, userId, permissions)` - Check if user has all permissions

### 4. Rate Limiter Service (`rate-limit/rate-limiter.service.ts`)

Redis-based distributed rate limiting.

**Key Methods:**
- `checkRateLimit(tenantId, userId, rule)` - Check if request is within limits
- `resetRateLimit(tenantId, userId)` - Reset rate limit counter
- `getRateLimitStatus(tenantId, userId)` - Get current rate limit status

### 5. Request Validator Service (`validation/request-validator.service.ts`)

Validates request format and content.

**Key Methods:**
- `validateBody(body, schema)` - Validate request body
- `validateQuery(query, schema)` - Validate query parameters
- `validateParams(params, schema)` - Validate path parameters
- `validateTenantId(tenantId)` - Validate tenant ID format
- `validateUserId(userId)` - Validate user ID format

### 6. Request Router Service (`routing/request-router.service.ts`)

Routes requests to downstream modules.

**Key Methods:**
- `registerRoute(route)` - Register new route
- `findRoute(path, method)` - Find route configuration
- `extractPathParams(pattern, path)` - Extract path parameters
- `getAllRoutes()` - Get all registered routes

## Usage

### Basic Usage

```typescript
import { initializeApiLayer } from './modules/api-layer';

// Initialize API Layer
const gateway = initializeApiLayer();

// Process a request
const response = await gateway.processRequest({
  method: 'GET',
  path: '/api/v1/health',
  headers: {
    'authorization': 'Bearer eyJhbGc...',
    'user-agent': 'WebWaka-Client/1.0',
  },
  ipAddress: '192.168.1.1',
});

console.log(response);
// {
//   statusCode: 200,
//   body: {
//     data: { status: 'healthy', timestamp: '...' },
//     meta: { timestamp: '...', requestId: '...', version: 'v1' }
//   }
// }
```

### Advanced Usage

```typescript
import {
  ApiGatewayService,
  AuthenticationService,
  AuthorizationService,
  RateLimiterService,
} from './modules/api-layer';

// Create custom gateway with specific configuration
const gateway = new ApiGatewayService({
  port: 3000,
  host: '0.0.0.0',
  corsEnabled: true,
  corsOrigins: ['https://app.webwaka.com'],
  jwtSecret: process.env.JWT_SECRET,
  rateLimitEnabled: true,
  defaultRateLimit: {
    maxRequests: 100,
    windowSeconds: 60,
  },
});

// Use individual services
const authService = new AuthenticationService(process.env.JWT_SECRET);
const authResult = await authService.authenticate(authHeader);

const rateLimiter = new RateLimiterService();
const rateLimitResult = await rateLimiter.checkRateLimit(tenantId, userId);
```

## Configuration

Configuration is loaded from environment variables:

```bash
# API Gateway
API_GATEWAY_PORT=3000
API_GATEWAY_HOST=0.0.0.0
API_CORS_ENABLED=true
API_CORS_ORIGINS=https://app.webwaka.com,https://admin.webwaka.com

# Authentication
JWT_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_ENABLED=true
DEFAULT_RATE_LIMIT_MAX=100
DEFAULT_RATE_LIMIT_WINDOW=60
REDIS_URL=redis://localhost:6379

# Authorization
WEEG_SERVICE_URL=http://localhost:3001/weeg
```

## Performance

**Targets:**
- **Throughput:** 10,000 requests/second
- **Latency:** <100ms P99 (excluding downstream module latency)

**Optimizations:**
- Redis-based distributed rate limiting
- Efficient JWT validation
- Pattern-based route matching
- Minimal overhead in request pipeline

## Security

**Features:**
- JWT-based authentication
- WEEG-based authorization
- Rate limiting to prevent abuse
- Request validation to prevent injection attacks
- Audit logging for all requests

**Compliance:**
- OWASP Top 10 protection
- NDPR compliance
- Multi-tenant data isolation

## Testing

Testing strategy is defined in `API_LAYER_TEST_STRATEGY.md`.

**Coverage Targets:**
- Unit Tests: 100%
- Integration Tests: 90%
- End-to-End Tests: 80%

## Next Steps

1. **Week 23 (Current):** Core implementation complete ✅
2. **Week 24:** Complete implementation, testing, and documentation
3. **Future:** Add support for GraphQL, WebSocket, gRPC

## Dependencies

- **WEEG (Permission System)** - For authorization
- **Redis** - For rate limiting
- **PostgreSQL** - For configuration data (future)

## License

PROPRIETARY - WebWaka Platform
