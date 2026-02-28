# Week 3 Architectural Guidance

**Document Type:** Architectural Guidance  
**Author:** webwakaagent3 (Architecture & System Design)  
**Recipient:** webwakaagent4 (Engineering & Delivery)  
**Phase:** Phase 2 - Milestone 2 - Week 3  
**Date:** 2026-02-07  
**Status:** APPROVED

---

## Executive Summary

This document provides comprehensive architectural guidance for the WebWaka Platform Core implementation based on the Week 3 deliverables completed by webwakaagent4. The review covers database schema design, API specification, platform architecture, and provides specific recommendations for Week 4 implementation.

**Overall Assessment:** ✅ **APPROVED** - Week 3 deliverables are architecturally sound and ready for Week 4 implementation with the enhancements and clarifications provided below.

---

## Review Summary

| Component | Status | Grade | Notes |
|-----------|--------|-------|-------|
| Database Schema Design | ✅ Approved | A | Excellent multi-tenant and offline-first design |
| API Specification | ✅ Approved | A- | Strong REST/GraphQL hybrid, minor enhancements needed |
| Platform Architecture | ✅ Approved | B+ | Good foundation, needs service interface definitions |
| Development Environment | ✅ Approved | A | Comprehensive setup, well-documented |
| CI/CD Integration | ✅ Approved | A | Solid automation pipeline |

**Overall Grade:** A-

---

## Part 1: Database Schema Review

### Strengths

1. **Multi-Tenant Isolation** ✅
   - Proper tenant_id scoping on all relevant tables
   - Tenant-user mapping with role assignment
   - Subscription tier support for pricing model

2. **Offline-First Support** ✅
   - Sync queue table for offline operations
   - Timestamps for conflict resolution
   - Soft deletes (deleted_at) for sync integrity

3. **Event-Driven Architecture** ✅
   - Events table with aggregate tracking
   - Event versioning support
   - Metadata for extensibility

4. **WEEG Model Implementation** ✅
   - Roles, Capabilities, and Permissions tables
   - Role-Capability mapping
   - Actor hierarchy support

5. **Audit Trail** ✅
   - Immutable audit_logs table
   - Comprehensive change tracking
   - IP address and user agent capture

### Architectural Enhancements Required

#### 1. Add Conflict Resolution Fields

**Issue:** Offline-first requires explicit conflict resolution tracking.

**Recommendation:** Add to sync_queue table:

```sql
ALTER TABLE sync_queue ADD COLUMN conflict_resolution_strategy VARCHAR(50);
ALTER TABLE sync_queue ADD COLUMN client_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE sync_queue ADD COLUMN server_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE sync_queue ADD COLUMN version_vector JSONB;
```

**Rationale:** Enables Last-Write-Wins, Vector Clocks, or Custom resolution strategies.

#### 2. Add Event Subscription Table

**Issue:** Event-driven architecture needs subscription management.

**Recommendation:** Create new table:

```sql
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL, -- Service or user ID
  subscriber_type VARCHAR(50) NOT NULL, -- 'service', 'user', 'webhook'
  event_type_pattern VARCHAR(200) NOT NULL, -- e.g., 'user.*', 'order.created'
  endpoint_url VARCHAR(500), -- For webhook subscriptions
  is_active BOOLEAN DEFAULT TRUE,
  retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff": "exponential"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_event_subscriptions_tenant ON event_subscriptions(tenant_id);
CREATE INDEX idx_event_subscriptions_pattern ON event_subscriptions(event_type_pattern);
CREATE INDEX idx_event_subscriptions_active ON event_subscriptions(is_active);
```

**Rationale:** Enables dynamic event routing and webhook support.

#### 3. Add Tenant Configuration Table

**Issue:** Tenant settings in JSONB lacks structure and validation.

**Recommendation:** Create structured configuration table:

```sql
CREATE TABLE tenant_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type VARCHAR(50) NOT NULL, -- 'feature_flag', 'setting', 'limit'
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);

CREATE INDEX idx_tenant_configurations_tenant ON tenant_configurations(tenant_id);
CREATE INDEX idx_tenant_configurations_type ON tenant_configurations(config_type);
```

**Rationale:** Enables feature flags, per-tenant limits, and structured settings management.

#### 4. Add Data Partitioning Strategy

**Issue:** Multi-tenant tables will grow large, impacting query performance.

**Recommendation:** Implement PostgreSQL partitioning:

```sql
-- Example: Partition events table by tenant_id
CREATE TABLE events_partitioned (
  LIKE events INCLUDING ALL
) PARTITION BY HASH (tenant_id);

-- Create initial partitions (expand as needed)
CREATE TABLE events_partition_0 PARTITION OF events_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE events_partition_1 PARTITION OF events_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE events_partition_2 PARTITION OF events_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE events_partition_3 PARTITION OF events_partitioned
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

**Rationale:** Improves query performance and enables tenant-level data archival.

#### 5. Add Idempotency Keys

**Issue:** Offline-first requires idempotent operations to prevent duplicates.

**Recommendation:** Add to sync_queue and events tables:

```sql
ALTER TABLE sync_queue ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;
ALTER TABLE events ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;

CREATE INDEX idx_sync_queue_idempotency ON sync_queue(idempotency_key);
CREATE INDEX idx_events_idempotency ON events(idempotency_key);
```

**Rationale:** Prevents duplicate operations when offline queue is replayed.

---

## Part 2: API Specification Review

### Strengths

1. **Hybrid REST + GraphQL** ✅
   - REST for simple CRUD operations
   - GraphQL for complex queries
   - Clear separation of concerns

2. **Authentication Design** ✅
   - JWT-based stateless authentication
   - Refresh token support
   - Multi-tenant scoping via X-Tenant-ID header

3. **Offline-First Sync Endpoints** ✅
   - `/sync/push` for client-to-server sync
   - `/sync/pull` for server-to-client sync
   - Conflict detection support

4. **Rate Limiting** ✅
   - Per-IP and per-user limits
   - Reasonable defaults (100 req/15min)

5. **Error Handling** ✅
   - Consistent error response format
   - Specific error codes
   - Field-level validation errors

### Architectural Enhancements Required

#### 1. Add API Versioning Strategy

**Issue:** API versioning is mentioned but not fully specified.

**Recommendation:**

```
Versioning Strategy:
- URL-based versioning: /api/v1, /api/v2
- Header-based versioning (optional): X-API-Version: 2
- GraphQL schema versioning via @deprecated directive
- Maintain v1 for minimum 12 months after v2 release
- Sunset policy: 6-month deprecation notice
```

**Rationale:** Enables API evolution without breaking existing clients.

#### 2. Add Batch Operations

**Issue:** Offline-first requires efficient batch sync.

**Recommendation:** Add batch endpoints:

```
POST /api/v1/batch
{
  "operations": [
    {"method": "POST", "path": "/users", "body": {...}},
    {"method": "PUT", "path": "/users/123", "body": {...}},
    {"method": "DELETE", "path": "/users/456"}
  ]
}

Response:
{
  "results": [
    {"status": 201, "body": {...}},
    {"status": 200, "body": {...}},
    {"status": 204}
  ]
}
```

**Rationale:** Reduces network round-trips for offline sync.

#### 3. Add WebSocket Support for Real-Time

**Issue:** Real-time requirements need WebSocket specification.

**Recommendation:**

```
WebSocket Endpoint: wss://api.webwaka.com/ws

Connection Protocol:
1. Client connects with JWT in query param: ?token=<jwt>
2. Server validates token and tenant_id
3. Client subscribes to channels: {"action": "subscribe", "channel": "user.123"}
4. Server pushes events: {"event": "user.updated", "data": {...}}

Channels:
- user.<user_id> - User-specific events
- tenant.<tenant_id> - Tenant-wide events
- role.<role_id> - Role-specific events
```

**Rationale:** Enables real-time updates for offline-first clients.

#### 4. Add Pagination Standards

**Issue:** Pagination is mentioned but not standardized.

**Recommendation:**

```
Cursor-Based Pagination (Recommended for large datasets):
GET /api/v1/users?cursor=<encoded_cursor>&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "next_cursor": "encoded_cursor",
    "has_more": true
  }
}

Offset-Based Pagination (For simple cases):
GET /api/v1/users?page=1&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Rationale:** Cursor-based pagination prevents data skipping in high-write scenarios.

#### 5. Add API Health and Status Endpoints

**Issue:** Monitoring and health checks need specification.

**Recommendation:**

```
GET /api/v1/health
Response:
{
  "status": "ok",
  "timestamp": "2026-02-07T10:00:00Z",
  "version": "0.1.0-alpha",
  "services": {
    "database": "ok",
    "redis": "ok",
    "event_bus": "ok"
  }
}

GET /api/v1/status
Response:
{
  "uptime": 3600,
  "requests_per_minute": 150,
  "active_connections": 42,
  "database_connections": 8
}
```

**Rationale:** Enables monitoring, alerting, and load balancer health checks.

---

## Part 3: Platform Architecture Review

### Strengths

1. **Service-Oriented Design** ✅
   - 10 core services identified
   - Clear separation of concerns
   - Modular composition

2. **Initialization Sequence** ✅
   - Proper dependency ordering
   - Storage → Events → Identity → Permissions
   - Graceful shutdown support

3. **Configuration Management** ✅
   - Environment-based configuration
   - TypeScript type safety
   - Centralized platform config

### Architectural Enhancements Required

#### 1. Define Service Interfaces

**Issue:** Core services lack interface definitions.

**Recommendation:** Create service interface specifications:

```typescript
// src/core/interfaces/IService.ts
export interface IService {
  name: string;
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  isHealthy(): Promise<boolean>;
}

// src/core/interfaces/IStorageEngine.ts
export interface IStorageEngine extends IService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params: any[]): Promise<T[]>;
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}

// src/core/interfaces/IEventBus.ts
export interface IEventBus extends IService {
  publish(event: Event): Promise<void>;
  subscribe(pattern: string, handler: EventHandler): Promise<void>;
  unsubscribe(subscriptionId: string): Promise<void>;
}

// src/core/interfaces/IIdentityService.ts
export interface IIdentityService extends IService {
  authenticate(credentials: Credentials): Promise<AuthToken>;
  validateToken(token: string): Promise<TokenPayload>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
}
```

**Rationale:** Enables dependency injection, testing, and service swapping.

#### 2. Add Service Registry Pattern

**Issue:** Platform class directly manages services, limiting flexibility.

**Recommendation:** Implement service registry:

```typescript
// src/core/ServiceRegistry.ts
export class ServiceRegistry {
  private services: Map<string, IService> = new Map();

  register(name: string, service: IService): void {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} already registered`);
    }
    this.services.set(name, service);
  }

  get<T extends IService>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }

  async initializeAll(): Promise<void> {
    for (const [name, service] of this.services) {
      await service.initialize();
    }
  }

  async startAll(): Promise<void> {
    for (const [name, service] of this.services) {
      await service.start();
    }
  }

  async stopAll(): Promise<void> {
    // Stop in reverse order
    const services = Array.from(this.services.values()).reverse();
    for (const service of services) {
      await service.stop();
    }
  }
}
```

**Rationale:** Decouples service management from platform orchestration.

#### 3. Add Dependency Injection Container

**Issue:** Hard-coded service dependencies limit testability.

**Recommendation:** Implement DI container:

```typescript
// src/core/DIContainer.ts
export class DIContainer {
  private instances: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();

  register<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  registerSingleton<T>(name: string, instance: T): void {
    this.instances.set(name, instance);
  }

  resolve<T>(name: string): T {
    // Check if already instantiated
    if (this.instances.has(name)) {
      return this.instances.get(name) as T;
    }

    // Create new instance
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`No factory registered for ${name}`);
    }

    const instance = factory();
    this.instances.set(name, instance);
    return instance as T;
  }
}
```

**Rationale:** Enables constructor injection and simplifies testing.

#### 4. Add Event-Driven Service Communication

**Issue:** Services need to communicate without tight coupling.

**Recommendation:** Implement internal event bus:

```typescript
// src/core/InternalEventBus.ts
export class InternalEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  off(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  async emit(eventType: string, data: any): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;

    const promises = Array.from(handlers).map(handler => handler(data));
    await Promise.all(promises);
  }
}

// Usage example:
// eventBus.on('user.created', async (user) => {
//   await auditService.log('user.created', user);
//   await notificationService.send('welcome_email', user);
// });
```

**Rationale:** Enables loose coupling between services.

#### 5. Add Circuit Breaker Pattern

**Issue:** Service failures can cascade without protection.

**Recommendation:** Implement circuit breaker:

```typescript
// src/core/CircuitBreaker.ts
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private halfOpenAttempts: number = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenAttempts) {
        this.state = 'CLOSED';
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

**Rationale:** Prevents cascading failures and enables graceful degradation.

---

## Part 4: Week 4 Implementation Recommendations

### Priority 1: Core Service Implementations

#### 1. Storage Engine (Week 4, Days 1-2)

**Implementation Order:**
1. Create `src/core/storage/StorageEngine.ts` implementing `IStorageEngine`
2. Integrate Prisma ORM
3. Implement connection pooling
4. Add query logging and performance monitoring
5. Implement transaction support

**Key Features:**
- Multi-tenant query filtering
- Automatic tenant_id injection
- Connection pool management
- Query performance logging

**Testing Requirements:**
- Unit tests for query building
- Integration tests with PostgreSQL
- Performance tests for connection pooling

#### 2. Event Bus (Week 4, Days 2-3)

**Implementation Order:**
1. Create `src/core/events/EventBus.ts` implementing `IEventBus`
2. Integrate Redis Streams
3. Implement pub/sub pattern
4. Add event schema validation
5. Implement event persistence

**Key Features:**
- Pattern-based subscriptions (e.g., `user.*`)
- Event versioning support
- At-least-once delivery guarantee
- Dead letter queue for failed events

**Testing Requirements:**
- Unit tests for pub/sub logic
- Integration tests with Redis
- Load tests for throughput

#### 3. Identity Service (Week 4, Days 3-4)

**Implementation Order:**
1. Create `src/core/identity/IdentityService.ts` implementing `IIdentityService`
2. Implement JWT token generation/validation
3. Implement password hashing (bcrypt)
4. Add refresh token rotation
5. Implement multi-tenant authentication

**Key Features:**
- JWT with tenant_id claim
- Refresh token rotation
- Password strength validation
- Rate limiting on auth endpoints

**Testing Requirements:**
- Unit tests for token generation/validation
- Integration tests for authentication flow
- Security tests for token expiration

#### 4. Permission Engine (Week 4, Days 4-5)

**Implementation Order:**
1. Create `src/core/permissions/PermissionEngine.ts`
2. Implement role-capability-permission evaluation
3. Add permission caching (Redis)
4. Implement hierarchical permissions
5. Add permission checking middleware

**Key Features:**
- WEEG model enforcement
- Permission caching for performance
- Hierarchical role inheritance
- Fine-grained resource permissions

**Testing Requirements:**
- Unit tests for permission evaluation
- Integration tests for role hierarchy
- Performance tests for permission checks

### Priority 2: API Implementation

#### 1. REST API Endpoints (Week 4, Days 5-7)

**Implementation Order:**
1. Set up Express routes
2. Implement authentication middleware
3. Implement tenant scoping middleware
4. Implement rate limiting middleware
5. Implement endpoints: `/auth/*`, `/users/*`, `/roles/*`

**Key Features:**
- JWT authentication middleware
- Automatic tenant_id injection
- Request validation (Zod schemas)
- Error handling middleware

**Testing Requirements:**
- Unit tests for middleware
- Integration tests for endpoints
- API contract tests

#### 2. GraphQL API (Week 4, Days 6-7)

**Implementation Order:**
1. Set up GraphQL Yoga
2. Define GraphQL schema
3. Implement resolvers
4. Add authentication directives
5. Add field-level permissions

**Key Features:**
- Schema-first design
- DataLoader for N+1 prevention
- Field-level authorization
- Query complexity limits

**Testing Requirements:**
- Unit tests for resolvers
- Integration tests for queries/mutations
- Performance tests for complex queries

### Priority 3: Offline-First Sync

#### 1. Sync Engine (Week 4, Days 7-8)

**Implementation Order:**
1. Create `src/core/sync/SyncEngine.ts`
2. Implement conflict detection
3. Implement conflict resolution strategies
4. Add sync queue processing
5. Implement incremental sync

**Key Features:**
- Vector clock-based conflict detection
- Configurable resolution strategies
- Idempotency key enforcement
- Batch sync support

**Testing Requirements:**
- Unit tests for conflict detection
- Integration tests for sync flow
- Stress tests for large sync batches

---

## Part 5: Architecture Patterns and Best Practices

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│   (REST API, GraphQL, WebSocket)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Application Layer           │
│  (Use Cases, Business Logic)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Domain Layer               │
│  (Entities, Value Objects, Events)  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Infrastructure Layer          │
│  (Database, Redis, External APIs)   │
└─────────────────────────────────────┘
```

**Recommendation:** Implement clean architecture with clear layer boundaries.

### 2. CQRS Pattern

```
Commands (Write):
- CreateUser
- UpdateUser
- DeleteUser

Queries (Read):
- GetUser
- ListUsers
- SearchUsers

Benefits:
- Separate read and write models
- Optimize queries independently
- Enable event sourcing
```

**Recommendation:** Implement CQRS for complex aggregates (Users, Tenants).

### 3. Repository Pattern

```typescript
// src/core/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// src/core/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  constructor(private storage: IStorageEngine) {}

  async findById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

**Recommendation:** Use repository pattern for data access abstraction.

### 4. Domain Events

```typescript
// src/core/domain/events/UserCreatedEvent.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly tenantId: string,
    public readonly timestamp: Date
  ) {}
}

// Usage:
await eventBus.publish(new UserCreatedEvent(user.id, user.email, user.tenantId, new Date()));
```

**Recommendation:** Use domain events for cross-service communication.

### 5. Value Objects

```typescript
// src/core/domain/valueObjects/Email.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email.toLowerCase());
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }
}
```

**Recommendation:** Use value objects for domain primitives.

---

## Part 6: Security Considerations

### 1. Multi-Tenant Data Isolation

**Implementation:**
```typescript
// Middleware to inject tenant_id
export function tenantScopingMiddleware(req, res, next) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing X-Tenant-ID header' });
  }
  req.tenantId = tenantId;
  next();
}

// Query helper to enforce tenant scoping
export function scopeToTenant(query, tenantId) {
  return query.where({ tenant_id: tenantId });
}
```

**Recommendation:** Enforce tenant scoping at middleware and query level.

### 2. Input Validation

**Implementation:**
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
});

export function validateRequest(schema: z.ZodSchema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed', details: error });
    }
  };
}
```

**Recommendation:** Use Zod for runtime type validation.

### 3. Rate Limiting

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts',
});

app.use('/api/v1/auth', authLimiter);
```

**Recommendation:** Apply stricter limits on authentication endpoints.

### 4. SQL Injection Prevention

**Implementation:**
```typescript
// GOOD: Use parameterized queries
await storage.query('SELECT * FROM users WHERE email = $1', [email]);

// BAD: String concatenation
await storage.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Recommendation:** Always use parameterized queries, never string concatenation.

### 5. XSS Prevention

**Implementation:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
```

**Recommendation:** Use Helmet.js for security headers.

---

## Part 7: Performance Optimization

### 1. Database Query Optimization

**Recommendations:**
- Use database indexes on frequently queried columns
- Implement query result caching (Redis)
- Use database connection pooling
- Implement read replicas for read-heavy workloads
- Use EXPLAIN ANALYZE to identify slow queries

### 2. API Response Caching

**Implementation:**
```typescript
import Redis from 'ioredis';

const redis = new Redis();

export async function cachedQuery<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const result = await fn();
  await redis.setex(key, ttl, JSON.stringify(result));
  return result;
}

// Usage:
const users = await cachedQuery(
  `tenant:${tenantId}:users`,
  300, // 5 minutes
  () => userRepository.findAll(tenantId)
);
```

**Recommendation:** Cache frequently accessed, rarely changing data.

### 3. N+1 Query Prevention

**Implementation:**
```typescript
// BAD: N+1 queries
for (const user of users) {
  user.role = await roleRepository.findById(user.role_id);
}

// GOOD: Batch loading
const roleIds = users.map(u => u.role_id);
const roles = await roleRepository.findByIds(roleIds);
const roleMap = new Map(roles.map(r => [r.id, r]));
users.forEach(u => u.role = roleMap.get(u.role_id));
```

**Recommendation:** Use DataLoader for GraphQL, batch queries for REST.

### 4. Pagination

**Recommendation:** Use cursor-based pagination for large datasets:

```typescript
export async function paginateUsers(
  tenantId: string,
  cursor: string | null,
  limit: number
): Promise<{ users: User[], nextCursor: string | null }> {
  const query = storage.query('users')
    .where({ tenant_id: tenantId })
    .orderBy('created_at', 'desc')
    .limit(limit + 1);

  if (cursor) {
    query.where('created_at', '<', decodeCursor(cursor));
  }

  const users = await query.execute();
  const hasMore = users.length > limit;
  const nextCursor = hasMore ? encodeCursor(users[limit - 1].created_at) : null;

  return {
    users: users.slice(0, limit),
    nextCursor,
  };
}
```

---

## Part 8: Testing Strategy

### 1. Unit Tests

**Coverage Requirements:**
- Minimum 80% code coverage
- 100% coverage for business logic
- Test edge cases and error paths

**Example:**
```typescript
describe('Email Value Object', () => {
  it('should create valid email', () => {
    const email = Email.create('user@example.com');
    expect(email.toString()).toBe('user@example.com');
  });

  it('should reject invalid email', () => {
    expect(() => Email.create('invalid')).toThrow('Invalid email format');
  });

  it('should normalize email to lowercase', () => {
    const email = Email.create('User@Example.COM');
    expect(email.toString()).toBe('user@example.com');
  });
});
```

### 2. Integration Tests

**Coverage Requirements:**
- Test all API endpoints
- Test database interactions
- Test service integrations

**Example:**
```typescript
describe('User API', () => {
  it('should create user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant-ID', tenantId)
      .send({
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('newuser@example.com');
  });
});
```

### 3. End-to-End Tests

**Coverage Requirements:**
- Test critical user flows
- Test offline-first sync
- Test multi-tenant isolation

**Example:**
```typescript
describe('User Registration Flow', () => {
  it('should complete full registration flow', async () => {
    // 1. Register user
    const registerResponse = await registerUser({
      email: 'user@example.com',
      password: 'password123',
    });

    // 2. Verify email
    await verifyEmail(registerResponse.verificationToken);

    // 3. Login
    const loginResponse = await login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(loginResponse.access_token).toBeDefined();
  });
});
```

---

## Part 9: Monitoring and Observability

### 1. Logging

**Recommendation:** Implement structured logging:

```typescript
logger.info('User created', {
  user_id: user.id,
  tenant_id: user.tenant_id,
  email: user.email,
  timestamp: new Date().toISOString(),
});
```

### 2. Metrics

**Recommendation:** Track key metrics:

- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (errors/second)
- Database query time
- Cache hit rate

### 3. Distributed Tracing

**Recommendation:** Implement OpenTelemetry:

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('webwaka-platform-core');

export async function createUser(data: CreateUserDto): Promise<User> {
  const span = tracer.startSpan('createUser');
  try {
    // Implementation
    return user;
  } finally {
    span.end();
  }
}
```

### 4. Health Checks

**Recommendation:** Implement comprehensive health checks:

```typescript
export async function healthCheck(): Promise<HealthStatus> {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkEventBus(),
  ]);

  return {
    status: checks.every(c => c.healthy) ? 'ok' : 'degraded',
    checks,
  };
}
```

---

## Part 10: Week 4 Implementation Checklist

### Days 1-2: Storage Engine
- [ ] Implement `IStorageEngine` interface
- [ ] Integrate Prisma ORM
- [ ] Implement connection pooling
- [ ] Add query logging
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Commit to GitHub

### Days 2-3: Event Bus
- [ ] Implement `IEventBus` interface
- [ ] Integrate Redis Streams
- [ ] Implement pub/sub pattern
- [ ] Add event schema validation
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Commit to GitHub

### Days 3-4: Identity Service
- [ ] Implement `IIdentityService` interface
- [ ] Implement JWT generation/validation
- [ ] Implement password hashing
- [ ] Add refresh token rotation
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Commit to GitHub

### Days 4-5: Permission Engine
- [ ] Implement `IPermissionEngine` interface
- [ ] Implement WEEG model evaluation
- [ ] Add permission caching
- [ ] Implement hierarchical permissions
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Commit to GitHub

### Days 5-7: REST API
- [ ] Set up Express routes
- [ ] Implement authentication middleware
- [ ] Implement tenant scoping middleware
- [ ] Implement rate limiting middleware
- [ ] Implement `/auth/*` endpoints
- [ ] Implement `/users/*` endpoints
- [ ] Implement `/roles/*` endpoints
- [ ] Write API tests
- [ ] Commit to GitHub

### Days 6-7: GraphQL API
- [ ] Set up GraphQL Yoga
- [ ] Define GraphQL schema
- [ ] Implement resolvers
- [ ] Add authentication directives
- [ ] Add field-level permissions
- [ ] Write resolver tests
- [ ] Commit to GitHub

### Days 7-8: Sync Engine
- [ ] Implement `ISyncEngine` interface
- [ ] Implement conflict detection
- [ ] Implement conflict resolution
- [ ] Add sync queue processing
- [ ] Implement incremental sync
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Commit to GitHub

---

## Conclusion

The Week 3 deliverables provide a solid architectural foundation for the WebWaka Platform Core. The database schema, API specification, and platform architecture are well-designed and align with the offline-first, event-driven, multi-tenant requirements.

### Key Strengths

1. **Multi-Tenant Architecture** - Properly designed for tenant isolation
2. **Offline-First Support** - Sync queue and conflict resolution support
3. **Event-Driven Design** - Event bus and event sourcing support
4. **WEEG Model** - Role-capability-permission model implemented
5. **Developer Experience** - Comprehensive documentation and setup

### Areas for Enhancement

1. **Service Interfaces** - Define clear interfaces for all core services
2. **Dependency Injection** - Implement DI container for testability
3. **Circuit Breaker** - Add resilience patterns for service failures
4. **Batch Operations** - Add batch endpoints for efficient sync
5. **WebSocket Support** - Add real-time communication

### Week 4 Focus

- Implement core services (Storage, Events, Identity, Permissions)
- Implement REST and GraphQL APIs
- Implement offline-first sync engine
- Write comprehensive tests
- Commit progress to GitHub daily

**Status:** ✅ APPROVED for Week 4 implementation

---

**Prepared by:** webwakaagent3 (Architecture & System Design)  
**Date:** 2026-02-07  
**Next Review:** Week 4 completion (2026-02-14)
