# Identity System Architecture — Phase 2 Detailed Design

**Document Type:** Phase 2 Architecture Specification  
**Task ID:** WA3-P2-001  
**Department:** Architecture & System Design  
**Owning Agent:** webwakaagent3  
**Status:** DRAFT  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Phase 1 Reference:** WEBWAKA_IDENTITY_ACCESS_CONTROL_ARCHITECTURE.md  
**Version:** 1.0  
**Date:** 2026-02-06  
**Scope:** Detailed architecture and design for the Identity System including actor hierarchy, authentication, authorization, and delegation  
**GitHub Issue:** [WA3-P2-001](https://github.com/WebWakaHub/webwaka-governance/issues/1)

---

## 1. Executive Summary

This document provides the detailed architecture and design for the WebWaka Identity System, transitioning from the Phase 1 conceptual architecture (WEBWAKA_IDENTITY_ACCESS_CONTROL_ARCHITECTURE.md) to an implementation-ready specification. The Identity System is the foundational layer upon which all other platform services depend, managing the complete actor hierarchy from Super Admin through End User.

The design prioritizes Africa-first constraints: offline-capable identity verification, low-bandwidth token exchange, mobile-first authentication flows, and resilience under intermittent connectivity.

---

## 2. Architecture Overview

### 2.1 System Context

The Identity System sits at the foundation of the WebWaka platform, providing identity, authentication, and authorization services to all other platform components. Every API call, event emission, and data access passes through the Identity System for verification.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│  (Mobile App, Web App, Partner Portal, Admin Dashboard) │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway Layer                       │
│         (Token Validation, Rate Limiting)                │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Identity   │ │  AuthN   │ │    AuthZ     │
│   Service    │ │  Service │ │   Service    │
└──────┬───────┘ └────┬─────┘ └──────┬───────┘
       │              │              │
       ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│              Identity Data Store (PostgreSQL)            │
│       + Local Cache (Redis) + Event Bus Integration     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

The Identity System adheres to the following principles, derived from Phase 1 governance documents:

1. **Offline-First Identity:** Local identity tokens must be verifiable without server connectivity using asymmetric cryptography.
2. **Actor Hierarchy Enforcement:** The six-level actor hierarchy (Super Admin, Partner, Tenant, Vendor, Staff/Agent, End User) is enforced at the data model level.
3. **Capability-Based Permissions:** Fine-grained capabilities replace coarse-grained roles for authorization decisions.
4. **Delegation Algebra:** Authority delegation follows deterministic, auditable rules that prevent privilege escalation.
5. **Minimal Data Transfer:** Authentication and authorization payloads are optimized for low-bandwidth environments.
6. **Event-Driven State Changes:** All identity mutations emit events to the Event Engine for audit and cross-service synchronization.

---

## 3. Actor Hierarchy — Detailed Design

### 3.1 Actor Model

Each actor in the system is represented by a universal identity record. The actor hierarchy defines authority boundaries and data isolation.

| Level | Actor Type | Scope | Authority | Data Boundary |
|-------|-----------|-------|-----------|---------------|
| 0 | **Super Admin** | Platform-wide | Full platform control | All platform data |
| 1 | **Partner** | Organization | Manage tenants, billing, integrations | Own organization + tenants |
| 2 | **Tenant** | Business | Manage users, roles, data | Own business data |
| 3 | **Vendor** | Marketplace | Manage products, services | Own vendor data |
| 4 | **Staff / Agent** | Operational | Execute assigned tasks | Assigned scope only |
| 5 | **End User** | Consumer | Use platform services | Own user data |

### 3.2 Universal Identity Record

Every actor, regardless of type, is represented by a Universal Identity Record (UIR):

```json
{
  "id": "uid_<ulid>",
  "type": "super_admin | partner | tenant | vendor | staff | end_user",
  "status": "active | inactive | suspended | pending_verification",
  "profile": {
    "display_name": "string",
    "email": "string (optional)",
    "phone": "string (required for Africa-first)",
    "locale": "string",
    "timezone": "string"
  },
  "hierarchy": {
    "parent_id": "uid_<ulid> | null",
    "partner_id": "uid_<ulid> | null",
    "tenant_id": "uid_<ulid> | null",
    "depth": "integer (0-5)"
  },
  "capabilities": ["string"],
  "roles": ["string"],
  "delegations": [
    {
      "delegator_id": "uid_<ulid>",
      "capabilities": ["string"],
      "expires_at": "ISO8601",
      "constraints": {}
    }
  ],
  "credentials": {
    "password_hash": "string (bcrypt/argon2)",
    "mfa_enabled": "boolean",
    "mfa_methods": ["sms", "totp", "biometric"],
    "oauth_providers": ["google", "apple", "facebook"],
    "api_keys": [{"key_hash": "string", "scope": "string", "expires_at": "ISO8601"}]
  },
  "metadata": {
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "created_by": "uid_<ulid>",
    "last_login_at": "ISO8601",
    "login_count": "integer"
  },
  "version": "integer (optimistic concurrency)"
}
```

### 3.3 Hierarchy Enforcement Rules

1. **Downward Creation Only:** An actor can only create actors at a lower hierarchy level.
2. **Scope Containment:** An actor's data scope is always a subset of its parent's scope.
3. **No Cross-Branch Access:** Actors cannot access data belonging to actors in a different branch of the hierarchy tree.
4. **Upward Escalation:** Requests that exceed an actor's authority are escalated to the parent actor.
5. **Immutable Hierarchy Position:** An actor's position in the hierarchy cannot be changed after creation (only deactivation and re-creation).

---

## 4. Authentication Architecture

### 4.1 Authentication Methods

The Identity System supports multiple authentication methods, prioritized for the African market:

| Method | Priority | Use Case | Offline Support |
|--------|----------|----------|-----------------|
| **Phone + OTP (SMS)** | Primary | End users, staff | Partial (cached OTP) |
| **Phone + OTP (USSD)** | Primary | Feature phone users | Partial |
| **Password** | Secondary | Admin, partner portals | Yes (local hash) |
| **OAuth 2.0 / OIDC** | Secondary | Social login, enterprise SSO | No |
| **Biometric** | Tertiary | Mobile app users | Yes (local biometric) |
| **API Key** | Service | Machine-to-machine | Yes (local validation) |
| **Offline Token** | Emergency | No connectivity | Yes (asymmetric crypto) |

### 4.2 Token Architecture

The system uses a dual-token architecture optimized for offline operation:

**Access Token (Short-Lived):**
- Format: JWT (compact serialization)
- Lifetime: 15 minutes (online), 24 hours (offline mode)
- Signing: RS256 (asymmetric — enables offline verification)
- Payload: Actor ID, type, capabilities, tenant context, issued-at, expiry

**Refresh Token (Long-Lived):**
- Format: Opaque token (stored server-side)
- Lifetime: 30 days (configurable per tenant)
- Storage: Secure local storage (encrypted at rest)
- Rotation: Single-use with automatic rotation on refresh

**Offline Token (Extended):**
- Format: JWT with extended claims
- Lifetime: 7 days (configurable)
- Signing: RS256 with offline-specific key pair
- Payload: Full capability set, delegation chain, conflict resolution hints
- Issuance: Proactively issued when connectivity is available

### 4.3 Token Payload Structure

```json
{
  "sub": "uid_01HQXYZ...",
  "type": "tenant",
  "iss": "webwaka-identity",
  "aud": "webwaka-platform",
  "iat": 1707206400,
  "exp": 1707207300,
  "ctx": {
    "partner_id": "uid_01HQ...",
    "tenant_id": "uid_01HR...",
    "capabilities": ["read:orders", "write:orders", "read:inventory"],
    "delegated_capabilities": ["approve:refunds"],
    "delegation_chain": ["uid_01HS..."]
  },
  "offline": {
    "mode": "full | restricted",
    "sync_checkpoint": "2026-02-06T08:00:00Z",
    "conflict_strategy": "last_write_wins | manual_resolve"
  }
}
```

### 4.4 Authentication Flow — Phone + OTP

```
Client                    API Gateway           Identity Service        SMS Provider
  │                           │                       │                      │
  │── POST /auth/otp/request ─▶│                       │                      │
  │                           │── Validate phone ──────▶│                      │
  │                           │                       │── Generate OTP ──────▶│
  │                           │                       │   (6-digit, 5min TTL) │
  │                           │◀── 202 Accepted ──────│                      │
  │◀── 202 (OTP sent) ────────│                       │                      │
  │                           │                       │                      │
  │── POST /auth/otp/verify ──▶│                       │                      │
  │                           │── Verify OTP ─────────▶│                      │
  │                           │                       │── Validate & Issue ──│
  │                           │◀── Token Pair ────────│                      │
  │◀── 200 (access + refresh) │                       │                      │
```

### 4.5 Offline Authentication Flow

When the device has no connectivity, the system falls back to offline authentication:

1. **Pre-cached Credentials:** During online sessions, the system caches encrypted credential hashes locally.
2. **Local Verification:** The client verifies credentials against the local cache.
3. **Offline Token Issuance:** If credentials match, the client uses the pre-issued offline token.
4. **Capability Restriction:** Offline tokens may have a restricted capability set (configurable per tenant).
5. **Sync on Reconnect:** When connectivity returns, all offline actions are synced and verified server-side.

---

## 5. Authorization Architecture

### 5.1 Capability Model

Authorization is capability-based rather than role-based. Capabilities are fine-grained permissions that can be composed into roles for convenience.

**Capability Naming Convention:**
```
<action>:<resource>[:<scope>]
```

**Examples:**
- `read:orders` — Read orders in own scope
- `write:orders:all` — Write orders across all scopes
- `approve:refunds:own_tenant` — Approve refunds within own tenant
- `manage:users:own_tenant` — Manage users within own tenant
- `admin:platform:global` — Global platform administration

### 5.2 Role Composition

Roles are named collections of capabilities. Roles are defined per tenant and can be customized.

```json
{
  "role_id": "role_cashier",
  "tenant_id": "uid_01HR...",
  "display_name": "Cashier",
  "capabilities": [
    "read:orders:own_tenant",
    "write:orders:own_tenant",
    "read:inventory:own_tenant",
    "process:payments:own_tenant"
  ],
  "inherits_from": null,
  "is_system_role": false,
  "created_by": "uid_01HR..."
}
```

### 5.3 Authorization Decision Flow

```
Request ──▶ Extract Token ──▶ Validate Token ──▶ Extract Capabilities
                                                        │
                                                        ▼
                                                 Check Capability
                                                 Against Required
                                                        │
                                              ┌─────────┴─────────┐
                                              ▼                   ▼
                                         GRANTED              DENIED
                                              │                   │
                                              ▼                   ▼
                                      Check Delegation     Return 403
                                      Chain (if needed)
                                              │
                                              ▼
                                      Log Decision
                                      (Audit Trail)
```

### 5.4 Delegation Algebra

Delegation allows an actor to temporarily grant a subset of their capabilities to another actor. The delegation algebra enforces the following invariants:

1. **No Privilege Escalation:** A delegator cannot delegate capabilities they do not possess.
2. **Transitive Depth Limit:** Delegation chains have a maximum depth of 3 (configurable).
3. **Time-Bounded:** All delegations have an explicit expiry.
4. **Revocable:** Delegations can be revoked at any time by the delegator or any ancestor in the hierarchy.
5. **Auditable:** All delegation grants and revocations are logged as events.

**Delegation Record:**
```json
{
  "delegation_id": "del_<ulid>",
  "delegator_id": "uid_01HR...",
  "delegatee_id": "uid_01HS...",
  "capabilities": ["approve:refunds:own_tenant"],
  "constraints": {
    "max_amount": 50000,
    "valid_hours": "09:00-17:00",
    "valid_days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  },
  "chain_depth": 1,
  "max_chain_depth": 3,
  "created_at": "2026-02-06T08:00:00Z",
  "expires_at": "2026-02-13T08:00:00Z",
  "status": "active",
  "revoked_at": null,
  "revoked_by": null
}
```

---

## 6. Data Model

### 6.1 Entity-Relationship Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Actor      │────▶│    Role      │────▶│  Capability  │
│  (identity)   │     │ (collection) │     │ (permission) │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     ┌──────────────┐
│  Credential   │     │  Delegation  │
│ (auth method) │     │  (authority) │
└──────────────┘     └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│   Session     │
│  (active)     │
└──────────────┘
```

### 6.2 Database Schema (PostgreSQL)

**actors table:**
```sql
CREATE TABLE actors (
    id              VARCHAR(30) PRIMARY KEY,  -- ULID format: uid_<ulid>
    type            VARCHAR(20) NOT NULL CHECK (type IN ('super_admin','partner','tenant','vendor','staff','end_user')),
    status          VARCHAR(25) NOT NULL DEFAULT 'pending_verification',
    display_name    VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    locale          VARCHAR(10) DEFAULT 'en',
    timezone        VARCHAR(50) DEFAULT 'Africa/Lagos',
    parent_id       VARCHAR(30) REFERENCES actors(id),
    partner_id      VARCHAR(30) REFERENCES actors(id),
    tenant_id       VARCHAR(30) REFERENCES actors(id),
    hierarchy_depth INTEGER NOT NULL DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(30) REFERENCES actors(id)
);

CREATE INDEX idx_actors_type ON actors(type);
CREATE INDEX idx_actors_parent ON actors(parent_id);
CREATE INDEX idx_actors_tenant ON actors(tenant_id);
CREATE INDEX idx_actors_phone ON actors(phone);
CREATE INDEX idx_actors_email ON actors(email);
```

**roles table:**
```sql
CREATE TABLE roles (
    id              VARCHAR(30) PRIMARY KEY,
    tenant_id       VARCHAR(30) REFERENCES actors(id),
    name            VARCHAR(100) NOT NULL,
    display_name    VARCHAR(255) NOT NULL,
    capabilities    TEXT[] NOT NULL DEFAULT '{}',
    inherits_from   VARCHAR(30) REFERENCES roles(id),
    is_system_role  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(30) REFERENCES actors(id),
    UNIQUE(tenant_id, name)
);
```

**actor_roles table:**
```sql
CREATE TABLE actor_roles (
    actor_id    VARCHAR(30) REFERENCES actors(id),
    role_id     VARCHAR(30) REFERENCES roles(id),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by  VARCHAR(30) REFERENCES actors(id),
    expires_at  TIMESTAMPTZ,
    PRIMARY KEY (actor_id, role_id)
);
```

**credentials table:**
```sql
CREATE TABLE credentials (
    id              VARCHAR(30) PRIMARY KEY,
    actor_id        VARCHAR(30) NOT NULL REFERENCES actors(id),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('password','otp','oauth','biometric','api_key')),
    credential_hash VARCHAR(512),
    provider        VARCHAR(50),
    provider_id     VARCHAR(255),
    mfa_secret      VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at    TIMESTAMPTZ
);

CREATE INDEX idx_credentials_actor ON credentials(actor_id);
```

**delegations table:**
```sql
CREATE TABLE delegations (
    id              VARCHAR(30) PRIMARY KEY,
    delegator_id    VARCHAR(30) NOT NULL REFERENCES actors(id),
    delegatee_id    VARCHAR(30) NOT NULL REFERENCES actors(id),
    capabilities    TEXT[] NOT NULL,
    constraints     JSONB DEFAULT '{}',
    chain_depth     INTEGER NOT NULL DEFAULT 1,
    max_chain_depth INTEGER NOT NULL DEFAULT 3,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    revoked_by      VARCHAR(30) REFERENCES actors(id)
);

CREATE INDEX idx_delegations_delegatee ON delegations(delegatee_id);
CREATE INDEX idx_delegations_status ON delegations(status);
```

**sessions table:**
```sql
CREATE TABLE sessions (
    id              VARCHAR(30) PRIMARY KEY,
    actor_id        VARCHAR(30) NOT NULL REFERENCES actors(id),
    refresh_token   VARCHAR(512) NOT NULL UNIQUE,
    device_info     JSONB DEFAULT '{}',
    ip_address      INET,
    is_offline      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX idx_sessions_actor ON sessions(actor_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);
```

---

## 7. Service Interfaces (API Contracts)

### 7.1 Identity Service API

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/actors` | POST | Create a new actor | Yes (parent actor) |
| `/api/v1/actors/{id}` | GET | Get actor by ID | Yes (self or parent) |
| `/api/v1/actors/{id}` | PATCH | Update actor profile | Yes (self or parent) |
| `/api/v1/actors/{id}/status` | PUT | Change actor status | Yes (parent actor) |
| `/api/v1/actors/{id}/roles` | GET | List actor roles | Yes (self or parent) |
| `/api/v1/actors/{id}/roles` | POST | Assign role to actor | Yes (parent actor) |
| `/api/v1/actors/{id}/capabilities` | GET | List effective capabilities | Yes (self or parent) |

### 7.2 Authentication Service API

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/auth/otp/request` | POST | Request OTP via SMS/USSD | No |
| `/api/v1/auth/otp/verify` | POST | Verify OTP and get tokens | No |
| `/api/v1/auth/password` | POST | Authenticate with password | No |
| `/api/v1/auth/oauth/{provider}` | GET | Initiate OAuth flow | No |
| `/api/v1/auth/oauth/{provider}/callback` | GET | OAuth callback | No |
| `/api/v1/auth/refresh` | POST | Refresh access token | Yes (refresh token) |
| `/api/v1/auth/logout` | POST | Revoke session | Yes |
| `/api/v1/auth/offline-token` | POST | Request offline token | Yes |

### 7.3 Authorization Service API

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/authz/check` | POST | Check if actor has capability | Yes (service-to-service) |
| `/api/v1/authz/delegations` | POST | Create delegation | Yes (delegator) |
| `/api/v1/authz/delegations/{id}` | DELETE | Revoke delegation | Yes (delegator or ancestor) |
| `/api/v1/authz/delegations/actor/{id}` | GET | List delegations for actor | Yes (self or parent) |

---

## 8. Event Integration

### 8.1 Identity Events

All identity state changes emit events to the Event Engine. These events enable audit trails, cross-service synchronization, and offline sync.

| Event Type | Trigger | Payload |
|-----------|---------|---------|
| `identity.actor.created` | New actor created | Full actor record |
| `identity.actor.updated` | Actor profile updated | Changed fields + version |
| `identity.actor.status_changed` | Actor status changed | Actor ID, old status, new status |
| `identity.auth.login` | Successful authentication | Actor ID, method, device, IP |
| `identity.auth.logout` | Session terminated | Actor ID, session ID |
| `identity.auth.failed` | Failed authentication attempt | Phone/email, method, reason |
| `identity.role.assigned` | Role assigned to actor | Actor ID, role ID, granted_by |
| `identity.role.revoked` | Role revoked from actor | Actor ID, role ID, revoked_by |
| `identity.delegation.created` | Delegation granted | Full delegation record |
| `identity.delegation.revoked` | Delegation revoked | Delegation ID, revoked_by |
| `identity.capability.checked` | Authorization check performed | Actor ID, capability, result |

### 8.2 Event Schema

```json
{
  "event_id": "evt_<ulid>",
  "event_type": "identity.actor.created",
  "version": 1,
  "timestamp": "2026-02-06T08:00:00Z",
  "source": "identity-service",
  "actor_id": "uid_01HR...",
  "tenant_id": "uid_01HR...",
  "payload": { },
  "metadata": {
    "correlation_id": "cor_<ulid>",
    "causation_id": "evt_<ulid> | null"
  }
}
```

---

## 9. Security Considerations

### 9.1 Credential Storage

- Passwords hashed with Argon2id (memory: 64MB, iterations: 3, parallelism: 4)
- OTP secrets encrypted at rest with AES-256-GCM
- API keys hashed with SHA-256 (only prefix stored for identification)
- Biometric templates stored on-device only (never transmitted to server)

### 9.2 Token Security

- Access tokens signed with RS256 (2048-bit RSA keys, rotated monthly)
- Refresh tokens are opaque, stored server-side, single-use with rotation
- Offline tokens include a device binding claim to prevent token theft
- All tokens include `jti` claim for revocation tracking

### 9.3 Rate Limiting

- OTP requests: 3 per phone number per 10 minutes
- Login attempts: 5 per account per 15 minutes (then lockout for 30 minutes)
- API key authentication: 1000 requests per minute per key
- Token refresh: 10 per session per hour

### 9.4 Audit Requirements

- All authentication events logged immutably
- All authorization decisions logged
- All delegation changes logged
- Audit logs retained for 7 years (configurable per tenant)
- Audit logs are append-only and tamper-evident

---

## 10. Scalability and Performance

### 10.1 Performance Targets

| Operation | Target Latency (p95) | Target Throughput |
|-----------|---------------------|-------------------|
| Token validation | < 5ms | 50,000 req/s |
| OTP verification | < 200ms | 1,000 req/s |
| Authorization check | < 10ms | 30,000 req/s |
| Actor lookup | < 50ms | 10,000 req/s |
| Delegation evaluation | < 20ms | 10,000 req/s |

### 10.2 Caching Strategy

- **Token Public Keys:** Cached in-memory at API Gateway (refreshed every 5 minutes)
- **Actor Capabilities:** Cached in Redis with 5-minute TTL, invalidated on role/delegation change
- **Role Definitions:** Cached in Redis with 15-minute TTL
- **Session Data:** Cached in Redis with session lifetime TTL

### 10.3 Horizontal Scaling

- Identity Service: Stateless, horizontally scalable behind load balancer
- Authentication Service: Stateless (session state in Redis)
- Authorization Service: Stateless (capability cache in Redis)
- Database: Read replicas for query scaling, single primary for writes

---

## 11. Migration and Compatibility

### 11.1 API Versioning

- All APIs versioned with `/api/v1/` prefix
- Breaking changes require new version (`/api/v2/`)
- Deprecated versions supported for minimum 6 months
- Version negotiation via `Accept-Version` header

### 11.2 Schema Migration

- Database migrations managed with versioned migration files
- Forward-only migrations (no rollback in production)
- Blue-green deployment for zero-downtime schema changes

---

## 12. Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Event Engine (WA3-P2-002) | Internal | Emit identity events |
| Offline-First Architecture (WA3-P2-003) | Internal | Offline token and sync |
| PostgreSQL 15+ | External | Primary data store |
| Redis 7+ | External | Caching and session store |
| SMS Provider (Africa's Talking / Twilio) | External | OTP delivery |

---

## 13. Open Questions and Decisions

| # | Question | Proposed Answer | Status |
|---|----------|----------------|--------|
| 1 | Should biometric templates be synced to server? | No — device-only for privacy | DECIDED |
| 2 | Maximum offline token lifetime? | 7 days (configurable per tenant) | DECIDED |
| 3 | USSD authentication flow details? | Defer to webwakaagent4 implementation | DEFERRED |
| 4 | Multi-tenant key management? | Per-tenant signing keys with central KMS | DECIDED |

---

## Document Attribution

**Produced by:** webwakaagent3 (Architecture & System Design)  
**Department:** Architecture & System Design  
**Phase:** Phase 2 — Implementation & Infrastructure  
**Milestone:** Milestone 4 — Integration & Optimization  
**Date:** 2026-02-06  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Review Required By:** Chief of Staff (webwakaagent1)
