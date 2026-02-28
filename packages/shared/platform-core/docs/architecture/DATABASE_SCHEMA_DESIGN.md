# Database Schema Design

**Document Type:** Architecture Specification  
**Owner:** webwakaagent4 (Engineering & Delivery)  
**Status:** DRAFT  
**Version:** 0.1.0  
**Last Updated:** 2026-02-07  
**Phase:** Phase 2 - Milestone 2 - Week 3

---

## Overview

This document defines the database schema design for the WebWaka Platform Core. The schema is designed to support multi-tenant isolation, offline-first operation, event-driven architecture, and the actor hierarchy model.

## Design Principles

1. **Multi-Tenant Isolation** - All data is scoped to tenants
2. **Offline-First** - Schema supports local storage and sync
3. **Event-Driven** - All significant changes generate events
4. **Actor Hierarchy** - Implements the WEEG role-capability-permission model
5. **Audit Trail** - All changes are logged immutably
6. **Versioning** - Data models are versioned for evolution

---

## Core Tables

### 1. Tenants

Represents organizations using the platform.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
```

### 2. Users

Represents all users in the system (across all tenants).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

### 3. Tenant Users

Maps users to tenants with roles.

```sql
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_role ON tenant_users(role_id);
```

### 4. Roles

Defines roles in the actor hierarchy.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  actor_type VARCHAR(50) NOT NULL, -- super_admin, partner, tenant, vendor, agent, staff, end_user
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_roles_actor_type ON roles(actor_type);
```

### 5. Capabilities

Defines granular capabilities that can be assigned to roles.

```sql
CREATE TABLE capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_capabilities_slug ON capabilities(slug);
CREATE INDEX idx_capabilities_category ON capabilities(category);
```

### 6. Role Capabilities

Maps capabilities to roles.

```sql
CREATE TABLE role_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, capability_id)
);

CREATE INDEX idx_role_capabilities_role ON role_capabilities(role_id);
CREATE INDEX idx_role_capabilities_capability ON role_capabilities(capability_id);
```

### 7. Permissions

Defines specific permissions for resources.

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  action VARCHAR(50) NOT NULL, -- create, read, update, delete, execute
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_permissions_tenant ON permissions(tenant_id);
CREATE INDEX idx_permissions_resource ON permissions(resource_type, resource_id);
CREATE INDEX idx_permissions_role ON permissions(role_id);
CREATE INDEX idx_permissions_user ON permissions(user_id);
```

### 8. Events

Stores all platform events for the event bus.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  aggregate_id UUID,
  aggregate_type VARCHAR(100),
  payload JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_aggregate ON events(aggregate_type, aggregate_id);
CREATE INDEX idx_events_published ON events(published_at);
CREATE INDEX idx_events_processed ON events(processed);
```

### 9. Audit Logs

Immutable audit trail of all significant actions.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 10. Sync Queue

Offline queue for operations pending synchronization.

```sql
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  operation_type VARCHAR(50) NOT NULL, -- create, update, delete
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, synced, failed
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sync_queue_tenant ON sync_queue(tenant_id);
CREATE INDEX idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_created ON sync_queue(created_at);
```

---

## Relationships

```
tenants (1) ─── (N) tenant_users ─── (1) users
tenants (1) ─── (N) roles
roles (1) ─── (N) role_capabilities ─── (1) capabilities
roles (1) ─── (N) permissions
tenants (1) ─── (N) events
tenants (1) ─── (N) audit_logs
tenants (1) ─── (N) sync_queue
```

---

## Multi-Tenant Isolation

All queries MUST include tenant_id in the WHERE clause to ensure data isolation:

```sql
-- Example: Get all users for a tenant
SELECT u.* 
FROM users u
JOIN tenant_users tu ON u.id = tu.user_id
WHERE tu.tenant_id = $1 AND tu.status = 'active';
```

---

## Offline-First Support

The schema supports offline-first operation through:

1. **Sync Queue** - Stores operations performed offline
2. **Event Sourcing** - Events can be replayed for sync
3. **Timestamps** - All tables have created_at/updated_at for conflict resolution
4. **Soft Deletes** - deleted_at allows for sync of deletions

---

## Migration Strategy

Database migrations will be managed using Prisma Migrate:

```bash
# Create a new migration
pnpm prisma migrate dev --name <migration_name>

# Apply migrations to production
pnpm prisma migrate deploy
```

---

## Next Steps

1. Implement Prisma schema based on this design
2. Create initial migration
3. Set up database seeding for development
4. Implement data access layer
5. Add database tests

---

**Status:** Week 3 Deliverable - Database Schema Design ✅ COMPLETE
