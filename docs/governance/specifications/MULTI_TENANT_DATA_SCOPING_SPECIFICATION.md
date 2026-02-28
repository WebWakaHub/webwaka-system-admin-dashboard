# Multi-Tenant Data Scoping Specification

**Module ID:** Module 5  
**Module Name:** Multi-Tenant Data Scoping  
**Version:** 1.0  
**Date:** 2026-02-09  
**Status:** DRAFT  
**Author:** webwakaagent3 (Architecture)  
**Reviewers:** webwakaagent4 (Engineering), webwakaagent5 (Quality)

---

## 1. Module Overview

### 1.1 Purpose

The Multi-Tenant Data Scoping module provides a comprehensive framework for isolating and managing data across multiple tenants within the WebWaka platform. It ensures that all data operations are automatically scoped to the correct tenant context, preventing data leakage and enabling secure multi-tenancy at scale. This module is foundational to WebWaka's architecture and enforces **Invariant #4: Multi-Tenant** across all platform modules.

### 1.2 Scope

**In Scope:**
- Tenant context management and propagation across all platform layers
- Automatic tenant-scoped data filtering for all database queries
- Tenant isolation enforcement at the data access layer
- Tenant hierarchy support (parent-child tenant relationships)
- Cross-tenant data access controls and permissions
- Tenant-specific configuration and settings management
- Tenant provisioning and lifecycle management
- Tenant-scoped event publishing and subscription
- Tenant data export and migration capabilities
- Tenant usage tracking and quota enforcement

**Out of Scope:**
- User authentication and authorization (handled by Identity & Access Control module)
- Billing and subscription management (handled by separate billing module)
- Tenant-specific UI customization (handled by whitelabel module)
- Physical database sharding (this module supports logical multi-tenancy)

### 1.3 Success Criteria

- [ ] All database queries are automatically scoped to the current tenant context
- [ ] Zero data leakage between tenants (validated by security audit)
- [ ] Tenant context is propagated correctly across all async operations
- [ ] Cross-tenant operations require explicit permission checks
- [ ] Tenant hierarchy (parent-child) is fully supported
- [ ] Tenant provisioning and deprovisioning is automated
- [ ] All events are tenant-scoped by default
- [ ] Performance overhead of tenant scoping is < 5ms per query
- [ ] 100% code coverage for tenant isolation logic

---

## 2. Requirements

### 2.1 Functional Requirements

**FR-1: Tenant Context Management**
- **Description:** The system must maintain and propagate tenant context throughout the request lifecycle, including HTTP requests, background jobs, event handlers, and scheduled tasks.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Tenant context is extracted from authentication token or request header
  - [ ] Tenant context is stored in async-local storage for automatic propagation
  - [ ] Tenant context is available in all application layers (API, service, repository)
  - [ ] Tenant context is preserved across async/await boundaries
  - [ ] Tenant context is logged in all audit trails

**FR-2: Automatic Data Scoping**
- **Description:** All database queries must be automatically scoped to the current tenant without requiring developers to manually add tenant filters.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] ORM/query builder automatically adds tenant_id filter to all queries
  - [ ] SELECT, UPDATE, DELETE operations are tenant-scoped by default
  - [ ] INSERT operations automatically set tenant_id from current context
  - [ ] Raw SQL queries are intercepted and validated for tenant scoping
  - [ ] Queries without tenant context throw explicit errors (fail-safe)

**FR-3: Tenant Isolation Enforcement**
- **Description:** The system must prevent any data access across tenant boundaries unless explicitly authorized through cross-tenant permissions.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Attempting to access another tenant's data returns 403 Forbidden
  - [ ] Cross-tenant queries require explicit permission check
  - [ ] Tenant isolation is enforced at the database layer (row-level security)
  - [ ] Tenant isolation is validated by automated security tests
  - [ ] Tenant isolation violations are logged and alerted

**FR-4: Tenant Hierarchy Support**
- **Description:** The system must support hierarchical tenant relationships (parent-child) for organization structures and reseller scenarios.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Tenants can have parent-child relationships
  - [ ] Parent tenants can access child tenant data with appropriate permissions
  - [ ] Child tenants cannot access parent or sibling tenant data
  - [ ] Tenant hierarchy depth is configurable (default: 3 levels)
  - [ ] Tenant hierarchy is efficiently queried using materialized paths or nested sets

**FR-5: Cross-Tenant Data Access**
- **Description:** The system must support controlled cross-tenant data access for specific use cases (e.g., platform admin, data sharing, aggregation).
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Cross-tenant access requires explicit permission grant
  - [ ] Cross-tenant queries use a special API that validates permissions
  - [ ] Cross-tenant access is logged in audit trail
  - [ ] Cross-tenant access can be revoked dynamically
  - [ ] Cross-tenant access supports read-only and read-write modes

**FR-6: Tenant Provisioning**
- **Description:** The system must provide automated tenant provisioning and deprovisioning capabilities.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] New tenants can be created via API
  - [ ] Tenant creation initializes default configuration and settings
  - [ ] Tenant creation triggers provisioning events
  - [ ] Tenant deprovisioning soft-deletes data (retention policy)
  - [ ] Tenant deprovisioning triggers cleanup events

**FR-7: Tenant Configuration**
- **Description:** Each tenant must have isolated configuration and settings that override platform defaults.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Tenant-specific settings are stored in tenant_config table
  - [ ] Tenant settings override platform defaults
  - [ ] Tenant settings are cached for performance
  - [ ] Tenant settings support hierarchical inheritance (parent → child)
  - [ ] Tenant settings are validated against schema

**FR-8: Tenant-Scoped Events**
- **Description:** All events published and subscribed must be automatically scoped to the tenant context.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Events include tenant_id in metadata
  - [ ] Event subscribers receive only events for their tenant
  - [ ] Cross-tenant event subscription requires explicit permission
  - [ ] Platform-wide events (no tenant) are explicitly marked
  - [ ] Event routing respects tenant isolation

**FR-9: Tenant Data Export**
- **Description:** Tenants must be able to export their data for backup, migration, or compliance purposes.
- **Priority:** SHOULD
- **Acceptance Criteria:**
  - [ ] Tenant data can be exported to JSON, CSV, or SQL formats
  - [ ] Export includes all tenant-scoped data across all modules
  - [ ] Export is performed asynchronously for large datasets
  - [ ] Export respects data retention and privacy policies
  - [ ] Export is logged in audit trail

**FR-10: Tenant Usage Tracking**
- **Description:** The system must track tenant resource usage for quota enforcement and billing purposes.
- **Priority:** SHOULD
- **Acceptance Criteria:**
  - [ ] Tenant usage metrics are tracked (storage, API calls, users, etc.)
  - [ ] Usage metrics are updated in real-time or near-real-time
  - [ ] Usage metrics are aggregated for reporting
  - [ ] Quota limits can be enforced per tenant
  - [ ] Quota violations trigger alerts and throttling

### 2.2 Non-Functional Requirements

**NFR-1: Performance**
- **Requirement:** Tenant scoping overhead must be < 5ms per database query
- **Measurement:** Benchmark tenant-scoped queries vs. non-scoped queries
- **Acceptance Criteria:** P99 latency increase is < 5ms

**NFR-2: Scalability**
- **Requirement:** Support up to 100,000 tenants on a single platform instance
- **Measurement:** Load testing with 100,000 tenants
- **Acceptance Criteria:** Platform remains stable and performant with 100,000 tenants

**NFR-3: Reliability**
- **Requirement:** Zero data leakage between tenants (100% isolation)
- **Measurement:** Security audit and penetration testing
- **Acceptance Criteria:** No cross-tenant data access vulnerabilities found

**NFR-4: Security**
- **Requirement:** All tenant data access is authenticated, authorized, and audited
- **Measurement:** Security audit and code review
- **Acceptance Criteria:** All data access paths enforce tenant isolation

**NFR-5: Maintainability**
- **Requirement:** Tenant scoping is transparent to module developers (automatic)
- **Measurement:** Developer survey and code review
- **Acceptance Criteria:** Developers do not need to manually add tenant filters in 95% of cases

---

## 3. Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Multi-Tenant Data Scoping System             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Tenant Context   │         │ Tenant Hierarchy │         │
│  │ Manager          │◄───────►│ Manager          │         │
│  └────────┬─────────┘         └──────────────────┘         │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Query Interceptor│◄───────►│ Tenant Validator │         │
│  └────────┬─────────┘         └──────────────────┘         │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Data Access Layer│◄───────►│ Tenant Config    │         │
│  │ (ORM/Repository) │         │ Manager          │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │         Tenant-Scoped Database Tables        │          │
│  │  ┌────────┐  ┌────────┐  ┌────────┐         │          │
│  │  │Tenant A│  │Tenant B│  │Tenant C│         │          │
│  │  │ Data   │  │ Data   │  │ Data   │         │          │
│  │  └────────┘  └────────┘  └────────┘         │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
1. **Tenant Context Manager:** Manages tenant context throughout the request lifecycle
2. **Tenant Hierarchy Manager:** Manages parent-child tenant relationships
3. **Query Interceptor:** Intercepts and modifies database queries to add tenant scoping
4. **Tenant Validator:** Validates tenant access permissions and isolation
5. **Data Access Layer:** ORM/Repository pattern with automatic tenant scoping
6. **Tenant Config Manager:** Manages tenant-specific configuration and settings

**Data Flow:**
1. **Request Arrives:** HTTP request or background job starts
2. **Context Extraction:** Tenant ID is extracted from auth token or request header
3. **Context Storage:** Tenant context is stored in async-local storage
4. **Query Execution:** Application code executes database query
5. **Query Interception:** Query interceptor adds tenant_id filter automatically
6. **Validation:** Tenant validator checks permissions for cross-tenant access
7. **Execution:** Query is executed with tenant scoping enforced
8. **Response:** Data is returned, scoped to the tenant

### 3.2 Component Details

#### Component 1: Tenant Context Manager

**Responsibility:** Manage and propagate tenant context throughout the application lifecycle.

**Interfaces:**
- **Input:** HTTP request headers, authentication tokens, event metadata
- **Output:** Current tenant ID, tenant hierarchy path, tenant permissions

**Dependencies:**
- Async-local storage (Node.js AsyncLocalStorage or similar)
- Authentication module (for token validation)

**Implementation Notes:**
- Uses AsyncLocalStorage for automatic context propagation
- Supports manual context override for system operations
- Validates tenant ID exists and is active before setting context
- Provides middleware for automatic context extraction from requests

#### Component 2: Tenant Hierarchy Manager

**Responsibility:** Manage parent-child tenant relationships and hierarchical queries.

**Interfaces:**
- **Input:** Tenant ID, hierarchy operations (add child, remove child, get ancestors, get descendants)
- **Output:** Tenant hierarchy tree, ancestor list, descendant list

**Dependencies:**
- Tenant Context Manager
- Database (tenant_hierarchy table)

**Implementation Notes:**
- Uses materialized path pattern for efficient hierarchy queries
- Caches hierarchy relationships for performance
- Supports configurable hierarchy depth limits
- Provides APIs for hierarchy traversal (ancestors, descendants, siblings)

#### Component 3: Query Interceptor

**Responsibility:** Intercept all database queries and automatically add tenant scoping.

**Interfaces:**
- **Input:** Database query (SQL, ORM query object)
- **Output:** Modified query with tenant_id filter

**Dependencies:**
- Tenant Context Manager
- ORM/Query Builder

**Implementation Notes:**
- Hooks into ORM query builder lifecycle
- Automatically adds `WHERE tenant_id = ?` to SELECT, UPDATE, DELETE
- Automatically sets `tenant_id` field on INSERT
- Throws error if tenant context is missing (fail-safe)
- Supports opt-out for system-level queries (explicit flag required)

#### Component 4: Tenant Validator

**Responsibility:** Validate tenant access permissions and enforce isolation.

**Interfaces:**
- **Input:** Tenant ID, target tenant ID, operation type (read, write)
- **Output:** Boolean (access granted/denied)

**Dependencies:**
- Tenant Context Manager
- Tenant Hierarchy Manager
- Permission System

**Implementation Notes:**
- Checks if current tenant has permission to access target tenant
- Validates parent-child relationships for hierarchical access
- Logs all cross-tenant access attempts
- Caches permission checks for performance

#### Component 5: Data Access Layer

**Responsibility:** Provide tenant-scoped data access through ORM/Repository pattern.

**Interfaces:**
- **Input:** Entity type, query parameters
- **Output:** Tenant-scoped data results

**Dependencies:**
- Query Interceptor
- Tenant Context Manager
- Database

**Implementation Notes:**
- All repositories extend base tenant-scoped repository
- Provides explicit APIs for cross-tenant queries
- Supports bulk operations with tenant scoping
- Provides transaction support with tenant context preservation

#### Component 6: Tenant Config Manager

**Responsibility:** Manage tenant-specific configuration and settings.

**Interfaces:**
- **Input:** Tenant ID, config key, config value
- **Output:** Config value (with fallback to defaults)

**Dependencies:**
- Tenant Context Manager
- Database (tenant_config table)
- Cache

**Implementation Notes:**
- Supports hierarchical config inheritance (parent → child)
- Caches config values for performance
- Validates config values against schema
- Provides APIs for bulk config updates

### 3.3 Design Patterns

**Patterns Used:**
- **Async-Local Storage Pattern:** For automatic context propagation across async boundaries
- **Interceptor Pattern:** For automatic query modification and tenant scoping
- **Repository Pattern:** For encapsulating data access logic with tenant scoping
- **Materialized Path Pattern:** For efficient hierarchical tenant queries
- **Strategy Pattern:** For pluggable tenant isolation strategies (shared database, separate schemas, separate databases)
- **Decorator Pattern:** For adding tenant scoping to existing data access methods

---

## 4. API Specification

### 4.1 Tenant Context API

#### Set Tenant Context

**Method:** N/A (Internal API)  
**Function:** `setTenantContext(tenantId: string): void`  
**Description:** Set the current tenant context (typically called by middleware)

**Parameters:**
```typescript
{
  tenantId: string  // UUID of the tenant
}
```

**Throws:**
- `TenantNotFoundError`: If tenant ID does not exist
- `TenantInactiveError`: If tenant is not active

#### Get Tenant Context

**Method:** N/A (Internal API)  
**Function:** `getTenantContext(): TenantContext | null`  
**Description:** Get the current tenant context

**Response:**
```typescript
{
  tenantId: string,
  tenantName: string,
  parentTenantId: string | null,
  hierarchyPath: string,
  permissions: string[]
}
```

#### Clear Tenant Context

**Method:** N/A (Internal API)  
**Function:** `clearTenantContext(): void`  
**Description:** Clear the current tenant context (typically called after request completion)

### 4.2 Tenant Management API

#### Create Tenant

**Method:** POST  
**Path:** `/api/v1/tenants`  
**Description:** Create a new tenant

**Request:**
```json
{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "parentTenantId": "uuid-of-parent-tenant",
  "config": {
    "timezone": "Africa/Lagos",
    "currency": "NGN",
    "language": "en"
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "tenantId": "uuid-of-new-tenant",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "parentTenantId": "uuid-of-parent-tenant",
    "hierarchyPath": "/parent-uuid/new-tenant-uuid",
    "status": "active",
    "createdAt": "2026-02-09T12:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": {
    "code": "TENANT_SLUG_EXISTS",
    "message": "Tenant with slug 'acme-corp' already exists"
  }
}
```

**Status Codes:**
- **201:** Tenant created successfully
- **400:** Invalid request (missing required fields, invalid slug format)
- **409:** Tenant slug already exists
- **500:** Internal server error

**Authentication:** Required  
**Authorization:** Platform admin or parent tenant admin

#### Get Tenant

**Method:** GET  
**Path:** `/api/v1/tenants/:tenantId`  
**Description:** Get tenant details

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "tenantId": "uuid-of-tenant",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "parentTenantId": "uuid-of-parent-tenant",
    "hierarchyPath": "/parent-uuid/tenant-uuid",
    "status": "active",
    "config": {
      "timezone": "Africa/Lagos",
      "currency": "NGN",
      "language": "en"
    },
    "createdAt": "2026-02-09T12:00:00Z",
    "updatedAt": "2026-02-09T12:00:00Z"
  }
}
```

**Status Codes:**
- **200:** Success
- **404:** Tenant not found
- **403:** Forbidden (no access to this tenant)

**Authentication:** Required  
**Authorization:** Same tenant, parent tenant, or platform admin

#### Update Tenant

**Method:** PUT  
**Path:** `/api/v1/tenants/:tenantId`  
**Description:** Update tenant details

**Request:**
```json
{
  "name": "Acme Corporation Ltd",
  "config": {
    "timezone": "Africa/Lagos",
    "currency": "NGN"
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "tenantId": "uuid-of-tenant",
    "name": "Acme Corporation Ltd",
    "updatedAt": "2026-02-09T13:00:00Z"
  }
}
```

**Status Codes:**
- **200:** Success
- **400:** Invalid request
- **404:** Tenant not found
- **403:** Forbidden

**Authentication:** Required  
**Authorization:** Same tenant admin, parent tenant admin, or platform admin

#### Delete Tenant

**Method:** DELETE  
**Path:** `/api/v1/tenants/:tenantId`  
**Description:** Soft-delete a tenant (deactivate)

**Response (Success):**
```json
{
  "status": "success",
  "message": "Tenant deactivated successfully"
}
```

**Status Codes:**
- **200:** Success
- **404:** Tenant not found
- **403:** Forbidden
- **409:** Tenant has active child tenants (cannot delete)

**Authentication:** Required  
**Authorization:** Platform admin only

#### List Tenants

**Method:** GET  
**Path:** `/api/v1/tenants`  
**Description:** List all tenants (scoped to current tenant hierarchy)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (active, inactive, all)
- `parentTenantId`: Filter by parent tenant

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "tenants": [
      {
        "tenantId": "uuid-1",
        "name": "Tenant 1",
        "slug": "tenant-1",
        "status": "active",
        "createdAt": "2026-02-09T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

**Status Codes:**
- **200:** Success
- **400:** Invalid query parameters

**Authentication:** Required  
**Authorization:** Platform admin or parent tenant admin

### 4.3 Tenant Hierarchy API

#### Get Tenant Hierarchy

**Method:** GET  
**Path:** `/api/v1/tenants/:tenantId/hierarchy`  
**Description:** Get tenant hierarchy (ancestors and descendants)

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "ancestors": [
      {
        "tenantId": "root-uuid",
        "name": "Root Tenant",
        "level": 0
      },
      {
        "tenantId": "parent-uuid",
        "name": "Parent Tenant",
        "level": 1
      }
    ],
    "current": {
      "tenantId": "current-uuid",
      "name": "Current Tenant",
      "level": 2
    },
    "descendants": [
      {
        "tenantId": "child-uuid",
        "name": "Child Tenant",
        "level": 3
      }
    ]
  }
}
```

**Status Codes:**
- **200:** Success
- **404:** Tenant not found
- **403:** Forbidden

**Authentication:** Required  
**Authorization:** Same tenant, ancestor tenant, or platform admin

### 4.4 Cross-Tenant Access API

#### Request Cross-Tenant Access

**Method:** POST  
**Path:** `/api/v1/tenants/:tenantId/cross-tenant-access`  
**Description:** Request permission to access another tenant's data

**Request:**
```json
{
  "targetTenantId": "uuid-of-target-tenant",
  "accessType": "read",
  "reason": "Data aggregation for reporting",
  "expiresAt": "2026-03-09T12:00:00Z"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "accessGrantId": "uuid-of-access-grant",
    "sourceTenantId": "uuid-of-source-tenant",
    "targetTenantId": "uuid-of-target-tenant",
    "accessType": "read",
    "status": "pending",
    "expiresAt": "2026-03-09T12:00:00Z",
    "createdAt": "2026-02-09T12:00:00Z"
  }
}
```

**Status Codes:**
- **201:** Access request created
- **400:** Invalid request
- **403:** Forbidden (no permission to request access)

**Authentication:** Required  
**Authorization:** Tenant admin

#### Execute Cross-Tenant Query

**Method:** POST  
**Path:** `/api/v1/cross-tenant/query`  
**Description:** Execute a query across multiple tenants (requires permission)

**Request:**
```json
{
  "targetTenantIds": ["uuid-1", "uuid-2", "uuid-3"],
  "query": {
    "entity": "users",
    "filters": {
      "status": "active"
    },
    "fields": ["id", "name", "email"]
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "tenantId": "uuid-1",
        "data": [
          {"id": "1", "name": "User 1", "email": "user1@example.com"}
        ]
      },
      {
        "tenantId": "uuid-2",
        "data": [
          {"id": "2", "name": "User 2", "email": "user2@example.com"}
        ]
      }
    ]
  }
}
```

**Status Codes:**
- **200:** Success
- **403:** Forbidden (no cross-tenant access permission)
- **400:** Invalid query

**Authentication:** Required  
**Authorization:** Cross-tenant access permission required

### 4.5 Event-Based API

#### Event 1: Tenant Created

**Event Type:** `tenant.created`  
**Description:** Published when a new tenant is created

**Payload:**
```json
{
  "eventType": "tenant.created",
  "timestamp": "2026-02-09T12:00:00Z",
  "tenantId": "platform",
  "data": {
    "tenantId": "uuid-of-new-tenant",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "parentTenantId": "uuid-of-parent-tenant",
    "status": "active"
  }
}
```

**Subscribers:** Provisioning module, billing module, notification module

#### Event 2: Tenant Updated

**Event Type:** `tenant.updated`  
**Description:** Published when tenant details are updated

**Payload:**
```json
{
  "eventType": "tenant.updated",
  "timestamp": "2026-02-09T13:00:00Z",
  "tenantId": "platform",
  "data": {
    "tenantId": "uuid-of-tenant",
    "changes": {
      "name": {
        "old": "Acme Corporation",
        "new": "Acme Corporation Ltd"
      }
    }
  }
}
```

**Subscribers:** Cache invalidation, audit log, notification module

#### Event 3: Tenant Deleted

**Event Type:** `tenant.deleted`  
**Description:** Published when a tenant is soft-deleted

**Payload:**
```json
{
  "eventType": "tenant.deleted",
  "timestamp": "2026-02-09T14:00:00Z",
  "tenantId": "platform",
  "data": {
    "tenantId": "uuid-of-tenant",
    "name": "Acme Corporation",
    "deletedBy": "uuid-of-admin-user"
  }
}
```

**Subscribers:** Cleanup module, billing module, audit log

#### Event 4: Cross-Tenant Access Requested

**Event Type:** `tenant.cross_access.requested`  
**Description:** Published when cross-tenant access is requested

**Payload:**
```json
{
  "eventType": "tenant.cross_access.requested",
  "timestamp": "2026-02-09T12:00:00Z",
  "tenantId": "uuid-of-source-tenant",
  "data": {
    "accessGrantId": "uuid-of-access-grant",
    "sourceTenantId": "uuid-of-source-tenant",
    "targetTenantId": "uuid-of-target-tenant",
    "accessType": "read",
    "reason": "Data aggregation"
  }
}
```

**Subscribers:** Notification module, approval workflow module

#### Event 5: Cross-Tenant Access Granted

**Event Type:** `tenant.cross_access.granted`  
**Description:** Published when cross-tenant access is approved

**Payload:**
```json
{
  "eventType": "tenant.cross_access.granted",
  "timestamp": "2026-02-09T12:30:00Z",
  "tenantId": "uuid-of-target-tenant",
  "data": {
    "accessGrantId": "uuid-of-access-grant",
    "sourceTenantId": "uuid-of-source-tenant",
    "targetTenantId": "uuid-of-target-tenant",
    "accessType": "read",
    "grantedBy": "uuid-of-approver"
  }
}
```

**Subscribers:** Permission cache, audit log, notification module

---

## 5. Data Model

### 5.1 Entities

#### Entity 1: Tenant

**Description:** Represents a tenant in the multi-tenant system

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **name:** String (Required, Max 255 characters, Display name of tenant)
- **slug:** String (Required, Unique, Max 100 characters, URL-friendly identifier)
- **parent_tenant_id:** UUID (Optional, Foreign Key to tenants.id, For hierarchical tenants)
- **hierarchy_path:** String (Required, Materialized path for hierarchy queries, e.g., "/root-uuid/parent-uuid/tenant-uuid")
- **status:** Enum (Required, Values: active, inactive, suspended, Default: active)
- **metadata:** JSONB (Optional, Additional tenant metadata)
- **created_at:** Timestamp (Auto-generated)
- **updated_at:** Timestamp (Auto-updated)
- **deleted_at:** Timestamp (Optional, For soft delete)

**Relationships:**
- **Parent Tenant:** Many-to-One relationship with tenants (self-referential)
- **Child Tenants:** One-to-Many relationship with tenants (self-referential)
- **Tenant Config:** One-to-Many relationship with tenant_config
- **Cross-Tenant Access Grants:** One-to-Many relationship with cross_tenant_access

**Indexes:**
- **Primary:** id
- **Unique:** slug
- **Secondary:** parent_tenant_id, hierarchy_path, status

**Constraints:**
- **Unique:** slug
- **Foreign Key:** parent_tenant_id REFERENCES tenants(id)
- **Check:** status IN ('active', 'inactive', 'suspended')

#### Entity 2: Tenant Config

**Description:** Stores tenant-specific configuration and settings

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **tenant_id:** UUID (Required, Foreign Key to tenants.id)
- **config_key:** String (Required, Max 255 characters, Configuration key)
- **config_value:** JSONB (Required, Configuration value)
- **config_type:** Enum (Required, Values: string, number, boolean, object, array)
- **is_inherited:** Boolean (Default: false, Whether this config is inherited from parent)
- **created_at:** Timestamp (Auto-generated)
- **updated_at:** Timestamp (Auto-updated)

**Relationships:**
- **Tenant:** Many-to-One relationship with tenants

**Indexes:**
- **Primary:** id
- **Unique:** (tenant_id, config_key)
- **Secondary:** tenant_id, config_key

**Constraints:**
- **Unique:** (tenant_id, config_key)
- **Foreign Key:** tenant_id REFERENCES tenants(id) ON DELETE CASCADE

#### Entity 3: Cross-Tenant Access

**Description:** Manages cross-tenant data access permissions

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **source_tenant_id:** UUID (Required, Foreign Key to tenants.id, Tenant requesting access)
- **target_tenant_id:** UUID (Required, Foreign Key to tenants.id, Tenant being accessed)
- **access_type:** Enum (Required, Values: read, write, Default: read)
- **status:** Enum (Required, Values: pending, approved, rejected, revoked, Default: pending)
- **reason:** Text (Optional, Reason for access request)
- **requested_by:** UUID (Required, Foreign Key to users.id)
- **approved_by:** UUID (Optional, Foreign Key to users.id)
- **expires_at:** Timestamp (Optional, Access expiration time)
- **created_at:** Timestamp (Auto-generated)
- **updated_at:** Timestamp (Auto-updated)

**Relationships:**
- **Source Tenant:** Many-to-One relationship with tenants
- **Target Tenant:** Many-to-One relationship with tenants
- **Requested By User:** Many-to-One relationship with users
- **Approved By User:** Many-to-One relationship with users

**Indexes:**
- **Primary:** id
- **Secondary:** source_tenant_id, target_tenant_id, status, expires_at

**Constraints:**
- **Foreign Key:** source_tenant_id REFERENCES tenants(id)
- **Foreign Key:** target_tenant_id REFERENCES tenants(id)
- **Check:** access_type IN ('read', 'write')
- **Check:** status IN ('pending', 'approved', 'rejected', 'revoked')
- **Check:** source_tenant_id != target_tenant_id (cannot grant access to self)

#### Entity 4: Tenant Usage Metrics

**Description:** Tracks tenant resource usage for quota enforcement

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **tenant_id:** UUID (Required, Foreign Key to tenants.id)
- **metric_name:** String (Required, Max 100 characters, e.g., storage_bytes, api_calls, users)
- **metric_value:** BigInt (Required, Current metric value)
- **metric_limit:** BigInt (Optional, Quota limit for this metric)
- **period_start:** Timestamp (Required, Start of measurement period)
- **period_end:** Timestamp (Required, End of measurement period)
- **created_at:** Timestamp (Auto-generated)
- **updated_at:** Timestamp (Auto-updated)

**Relationships:**
- **Tenant:** Many-to-One relationship with tenants

**Indexes:**
- **Primary:** id
- **Unique:** (tenant_id, metric_name, period_start)
- **Secondary:** tenant_id, metric_name, period_start

**Constraints:**
- **Unique:** (tenant_id, metric_name, period_start)
- **Foreign Key:** tenant_id REFERENCES tenants(id) ON DELETE CASCADE

### 5.2 Database Schema

```sql
-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_tenant_id UUID REFERENCES tenants(id),
  hierarchy_path TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_tenants_parent_tenant_id ON tenants(parent_tenant_id);
CREATE INDEX idx_tenants_hierarchy_path ON tenants(hierarchy_path);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_deleted_at ON tenants(deleted_at) WHERE deleted_at IS NULL;

-- Tenant config table
CREATE TABLE tenant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_key VARCHAR(255) NOT NULL,
  config_value JSONB NOT NULL,
  config_type VARCHAR(20) NOT NULL CHECK (config_type IN ('string', 'number', 'boolean', 'object', 'array')),
  is_inherited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);

CREATE INDEX idx_tenant_config_tenant_id ON tenant_config(tenant_id);
CREATE INDEX idx_tenant_config_key ON tenant_config(config_key);

-- Cross-tenant access table
CREATE TABLE cross_tenant_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_tenant_id UUID NOT NULL REFERENCES tenants(id),
  access_type VARCHAR(20) NOT NULL DEFAULT 'read' CHECK (access_type IN ('read', 'write')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  reason TEXT,
  requested_by UUID NOT NULL,
  approved_by UUID,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (source_tenant_id != target_tenant_id)
);

CREATE INDEX idx_cross_tenant_access_source ON cross_tenant_access(source_tenant_id);
CREATE INDEX idx_cross_tenant_access_target ON cross_tenant_access(target_tenant_id);
CREATE INDEX idx_cross_tenant_access_status ON cross_tenant_access(status);
CREATE INDEX idx_cross_tenant_access_expires ON cross_tenant_access(expires_at);

-- Tenant usage metrics table
CREATE TABLE tenant_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value BIGINT NOT NULL,
  metric_limit BIGINT,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, metric_name, period_start)
);

CREATE INDEX idx_tenant_usage_metrics_tenant_id ON tenant_usage_metrics(tenant_id);
CREATE INDEX idx_tenant_usage_metrics_name ON tenant_usage_metrics(metric_name);
CREATE INDEX idx_tenant_usage_metrics_period ON tenant_usage_metrics(period_start, period_end);

-- Row-level security policies (PostgreSQL)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_tenant_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tenant's data
CREATE POLICY tenant_isolation_policy ON tenants
  USING (id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_config_isolation_policy ON tenant_config
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Note: Cross-tenant access policies are more complex and handled by application logic
```

---

## 6. Dependencies

### 6.1 Internal Dependencies

**Depends On:**
- **Minimal Kernel (Module 1):** Core platform services and initialization
- **Event System (Module 3):** For publishing tenant lifecycle events
- **Module System (Module 4):** For module registration and lifecycle management

**Depended On By:**
- **All Platform Modules:** Every module depends on Multi-Tenant Data Scoping for data isolation
- **Identity & Access Control:** For user-tenant associations
- **Billing Module:** For tenant usage tracking and billing
- **Whitelabel Module:** For tenant-specific UI customization

### 6.2 External Dependencies

**Third-Party Libraries:**
- **async-hooks (Node.js built-in):** For AsyncLocalStorage context propagation
- **pg (PostgreSQL driver) v8.x:** For database connectivity with row-level security support
- **TypeORM v0.3.x or Prisma v5.x:** For ORM with query interception support
- **node-cache v5.x:** For caching tenant config and permissions

**External Services:**
- None (this is a core platform module with no external service dependencies)

---

## 7. Compliance

### 7.1 Nigerian-First Compliance

- [x] Supports Nigerian Naira (₦, NGN) - Tenant config supports currency setting
- [ ] Supports Paystack payment gateway - Not applicable (handled by payment module)
- [ ] Supports Flutterwave payment gateway - Not applicable (handled by payment module)
- [ ] Supports Interswitch payment gateway - Not applicable (handled by payment module)
- [ ] Supports 40+ Nigerian banks - Not applicable (handled by payment module)
- [ ] Supports Termii SMS gateway - Not applicable (handled by notification module)
- [x] Supports +234 phone number format - Tenant config supports phone format setting
- [x] Supports Nigerian address format (36 states + FCT) - Tenant config supports address format
- [x] NDPR compliant (data protection) - Tenant isolation ensures NDPR compliance
- [ ] CBN compliant (financial regulations) - Not applicable (handled by payment module)
- [ ] NCC compliant (communications regulations) - Not applicable (handled by communication module)
- [ ] CAC compliant (business registration) - Tenant metadata can store CAC registration info

### 7.2 Mobile-First Compliance

- [x] Responsive design (320px to 1024px) - Tenant admin UI is responsive
- [x] Touch-friendly UI (44x44 pixel touch targets) - Tenant admin UI follows touch guidelines
- [x] Mobile performance optimized (< 3s page load on 3G) - API responses are optimized for mobile
- [x] Mobile accessibility (VoiceOver, TalkBack support) - Tenant admin UI is accessible
- [x] Works on low-spec devices (2GB RAM) - Lightweight tenant context management
- [x] Works on low-bandwidth networks (2G/3G) - Minimal API payload sizes

### 7.3 PWA-First Compliance

- [ ] Service worker implemented - Not applicable (this is a backend module)
- [x] Offline functionality works - Tenant context is cached for offline access
- [ ] Background sync implemented - Not applicable (this is a backend module)
- [ ] App manifest valid - Not applicable (this is a backend module)
- [ ] Installable (Add to Home Screen) - Not applicable (this is a backend module)
- [ ] Push notifications supported - Not applicable (handled by notification module)

### 7.4 Africa-First Compliance

- [x] Supports English (primary language) - Tenant config supports language setting
- [x] Supports Hausa, Yoruba, Igbo (Nigerian languages) - Tenant config supports language setting
- [x] Supports French, Swahili (African languages) - Tenant config supports language setting
- [x] Supports African payment methods - Tenant config supports payment method preferences
- [x] Supports African currencies - Tenant config supports currency setting (NGN, ZAR, KES, etc.)
- [x] Works on African infrastructure (low-bandwidth, low-spec devices) - Optimized for low-resource environments

---

## 8. Testing Requirements

### 8.1 Unit Testing

**Coverage Target:** 100%

**Test Cases:**
- [ ] Tenant context is correctly set and retrieved
- [ ] Tenant context is propagated across async boundaries
- [ ] Tenant context is cleared after request completion
- [ ] Query interceptor adds tenant_id filter to SELECT queries
- [ ] Query interceptor adds tenant_id filter to UPDATE queries
- [ ] Query interceptor adds tenant_id filter to DELETE queries
- [ ] Query interceptor sets tenant_id on INSERT queries
- [ ] Query interceptor throws error when tenant context is missing
- [ ] Tenant validator allows access to own tenant data
- [ ] Tenant validator denies access to other tenant data
- [ ] Tenant validator allows parent tenant to access child tenant data
- [ ] Tenant validator denies child tenant access to parent tenant data
- [ ] Tenant hierarchy manager correctly builds hierarchy tree
- [ ] Tenant hierarchy manager correctly retrieves ancestors
- [ ] Tenant hierarchy manager correctly retrieves descendants
- [ ] Tenant config manager returns tenant-specific config
- [ ] Tenant config manager falls back to parent config when inherited
- [ ] Tenant config manager falls back to platform default when not set
- [ ] Cross-tenant access request is created correctly
- [ ] Cross-tenant access is validated before query execution
- [ ] Tenant usage metrics are tracked correctly
- [ ] Tenant usage metrics respect quota limits

### 8.2 Integration Testing

**Test Scenarios:**
- [ ] End-to-end tenant creation flow (API → DB → Events)
- [ ] End-to-end tenant update flow (API → DB → Events → Cache invalidation)
- [ ] End-to-end tenant deletion flow (API → DB → Events → Cleanup)
- [ ] Cross-tenant access request and approval flow
- [ ] Cross-tenant query execution with permission validation
- [ ] Tenant hierarchy queries (ancestors, descendants)
- [ ] Tenant config inheritance from parent to child
- [ ] Tenant usage tracking and quota enforcement
- [ ] Tenant data export functionality
- [ ] Tenant context propagation in background jobs
- [ ] Tenant context propagation in event handlers
- [ ] Tenant isolation in concurrent requests

### 8.3 End-to-End Testing

**User Flows:**
- [ ] Platform admin creates a new tenant
- [ ] Tenant admin updates tenant configuration
- [ ] Tenant admin creates a child tenant
- [ ] Tenant admin requests cross-tenant access
- [ ] Target tenant admin approves cross-tenant access
- [ ] Source tenant executes cross-tenant query
- [ ] Tenant admin exports tenant data
- [ ] Platform admin deactivates a tenant
- [ ] User switches between tenants (if multi-tenant user)

### 8.4 Performance Testing

**Performance Metrics:**
- [ ] Tenant context retrieval < 1ms
- [ ] Query interception overhead < 5ms per query
- [ ] Tenant hierarchy query < 50ms (for depth of 5 levels)
- [ ] Tenant config retrieval < 10ms (with cache)
- [ ] Cross-tenant access validation < 20ms
- [ ] Tenant creation API < 500ms
- [ ] Tenant list API < 300ms (for 1000 tenants)
- [ ] Memory usage < 50MB for 10,000 tenants (metadata only)

### 8.5 Security Testing

**Security Tests:**
- [ ] Tenant isolation: Cannot access other tenant's data via direct query
- [ ] Tenant isolation: Cannot access other tenant's data via API
- [ ] Tenant isolation: Cannot bypass tenant filter with raw SQL
- [ ] Cross-tenant access: Cannot execute cross-tenant query without permission
- [ ] Cross-tenant access: Permission is validated on every request
- [ ] Cross-tenant access: Expired permissions are rejected
- [ ] Tenant hierarchy: Child cannot access parent data
- [ ] Tenant hierarchy: Sibling cannot access sibling data
- [ ] SQL injection: Tenant ID is properly escaped in queries
- [ ] Authorization: Only authorized users can create/update/delete tenants
- [ ] Audit logging: All tenant operations are logged
- [ ] Data leakage: No tenant data in error messages or logs

---

## 9. Documentation Requirements

### 9.1 Module Documentation

- [ ] README.md (module overview, setup instructions, architecture overview)
- [ ] ARCHITECTURE.md (detailed architecture, design patterns, data flow)
- [ ] API.md (complete API reference with examples)
- [ ] CHANGELOG.md (version history and breaking changes)

### 9.2 API Documentation

- [ ] OpenAPI/Swagger specification for all REST endpoints
- [ ] API reference documentation with request/response examples
- [ ] API usage examples for common scenarios (tenant creation, cross-tenant access, etc.)
- [ ] API error codes and messages reference

### 9.3 User Documentation

- [ ] Tenant Admin Guide (how to manage tenants, configure settings, request access)
- [ ] Developer Guide (how to build tenant-scoped modules, use tenant context API)
- [ ] FAQ (common questions about multi-tenancy, data isolation, cross-tenant access)
- [ ] Troubleshooting guide (common issues and solutions)

---

## 10. Risks and Mitigation

### Risk 1: Data Leakage Between Tenants

**Description:** A bug in the query interceptor or tenant validation logic could allow one tenant to access another tenant's data, violating data isolation.  
**Probability:** Medium  
**Impact:** Critical (data breach, compliance violation, loss of trust)  
**Mitigation:**
- Implement comprehensive unit and integration tests for tenant isolation
- Enable row-level security (RLS) at the database level as a second layer of defense
- Conduct regular security audits and penetration testing
- Implement automated monitoring and alerting for cross-tenant access attempts
- Use fail-safe design: throw errors when tenant context is missing rather than defaulting

### Risk 2: Performance Degradation

**Description:** Automatic tenant scoping adds overhead to every database query, potentially degrading performance at scale.  
**Probability:** Medium  
**Impact:** Medium (slower API responses, poor user experience)  
**Mitigation:**
- Optimize query interceptor to minimize overhead (< 5ms target)
- Implement aggressive caching for tenant config and permissions
- Use database indexes on tenant_id columns for all tables
- Consider read replicas for tenant-scoped queries
- Monitor query performance and optimize slow queries

### Risk 3: Complex Cross-Tenant Scenarios

**Description:** Complex cross-tenant access scenarios (e.g., data aggregation, reporting, multi-tenant users) may be difficult to implement correctly.  
**Probability:** High  
**Impact:** Medium (feature delays, implementation complexity)  
**Mitigation:**
- Design explicit APIs for cross-tenant operations (don't rely on automatic scoping)
- Provide clear documentation and examples for cross-tenant use cases
- Implement comprehensive tests for cross-tenant scenarios
- Use feature flags to gradually roll out cross-tenant features
- Provide developer support and code review for cross-tenant implementations

### Risk 4: Tenant Hierarchy Complexity

**Description:** Deep tenant hierarchies (> 5 levels) may cause performance issues and implementation complexity.  
**Probability:** Low  
**Impact:** Medium (performance degradation, complex queries)  
**Mitigation:**
- Limit tenant hierarchy depth (default: 3 levels, max: 5 levels)
- Use materialized path pattern for efficient hierarchy queries
- Cache hierarchy relationships for frequently accessed tenants
- Provide clear documentation on hierarchy limitations
- Monitor hierarchy query performance and optimize as needed

### Risk 5: Tenant Context Loss in Async Operations

**Description:** Tenant context may be lost in async operations (background jobs, event handlers, scheduled tasks) if not properly propagated.  
**Probability:** Medium  
**Impact:** High (incorrect data scoping, data leakage)  
**Mitigation:**
- Use AsyncLocalStorage for automatic context propagation
- Explicitly pass tenant context in event metadata and job payloads
- Implement validation to ensure tenant context is present before data access
- Provide clear documentation on async context propagation
- Add tests for tenant context in async scenarios

---

## 11. Timeline

**Specification:** Week 16 (2026-02-09 to 2026-02-15)  
**Implementation Part 1:** Week 17 (2026-02-16 to 2026-02-22)  
**Implementation Part 2 + Testing:** Week 18 (2026-02-23 to 2026-03-01)  
**Validation:** Week 18 (2026-02-23 to 2026-03-01)  
**Approval:** Week 18 (2026-03-01)

---

## 12. Approval

| Role | Agent | Status | Date |
|---|---|---|---|
| Architecture | webwakaagent3 | ✅ DRAFT | 2026-02-09 |
| Engineering | webwakaagent4 | ⏳ PENDING | - |
| Quality | webwakaagent5 | ⏳ PENDING | - |
| Founder Agent | webwaka007 | ⏳ PENDING | - |

---

**Document Status:** DRAFT  
**Created By:** webwakaagent3 (Architecture)  
**Date:** 2026-02-09  
**Last Updated:** 2026-02-09
