# Member Management Module

**Module ID:** Church Suite Module 1  
**Version:** 1.0.0  
**Status:** Implementation Complete  
**Author:** webwakaagent4 (Engineering & Delivery)  
**Date:** 2026-02-13

---

## Overview

The Member Management module is the first module of the Church Suite, providing comprehensive member registration, profile management, family relationships, and pastoral care capabilities for churches and religious organizations.

**Key Features:**
- Member registration with Nigerian phone number validation (+234 format)
- Member profile management with optimistic locking
- Family and household relationship tracking
- Member status lifecycle management (visitor → member → inactive → transferred → deceased)
- Member categorization with tags
- Full-text search capabilities (ready for Elasticsearch integration)
- Data import/export (CSV format)
- Pastoral care notes with visibility controls
- NDPR-compliant data protection (audit logs, soft deletes, data portability)
- Event-driven architecture with CloudEvents
- Multi-tenant architecture with row-level security

---

## Architecture

### Components

1. **Models** (`models/`): TypeORM entities for database tables
   - `Member.ts`: Core member entity with personal and contact information
   - `Family.ts`: Family unit entity
   - `FamilyRelationship.ts`: Junction table for family-member relationships
   - `MemberNote.ts`: Pastoral care notes entity
   - `MemberAuditLog.ts`: Audit trail entity for compliance

2. **DTOs** (`dto/`): Data Transfer Objects for API requests
   - `CreateMemberDto.ts`: Validation for member creation
   - `UpdateMemberDto.ts`: Validation for member updates

3. **Repositories** (`repositories/`): Database access layer
   - `MemberRepository.ts`: CRUD operations with tenant isolation

4. **Services** (`services/`): Business logic layer
   - `MemberService.ts`: Core business logic for member operations

5. **Controllers** (`controllers/`): HTTP request handlers
   - `MemberController.ts`: REST API endpoints

6. **Events** (`events/`): Event publishing
   - `MemberEventPublisher.ts`: CloudEvents publisher for RabbitMQ/NATS

7. **Utils** (`utils/`): Utility functions
   - `MemberAuditLogger.ts`: Audit logging for compliance

8. **Migrations** (`migrations/`): Database schema migrations
   - `001_create_member_tables.sql`: Initial schema creation

---

## API Endpoints

### Member CRUD

**POST /api/v1/members**
- Create a new member
- Request: `CreateMemberDto`
- Response: `Member` (201 Created)
- Errors: 400 (validation), 409 (duplicate phone/email)

**GET /api/v1/members/:id**
- Get member by ID
- Response: `Member` (200 OK)
- Errors: 404 (not found)

**PUT /api/v1/members/:id**
- Update member
- Request: `UpdateMemberDto` (includes version for optimistic locking)
- Response: `Member` (200 OK)
- Errors: 404 (not found), 409 (optimistic locking conflict or duplicate)

**DELETE /api/v1/members/:id**
- Soft delete member
- Response: 204 No Content
- Errors: 404 (not found)

### Member Search

**GET /api/v1/members/search**
- Search members with filters
- Query Parameters:
  - `query`: Search query (name, phone, email)
  - `status`: Filter by status (visitor, member, inactive, etc.)
  - `tags`: Filter by tags (comma-separated)
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)
- Response: `{ members: Member[], total: number, page: number, limit: number }`

### Member Status

**POST /api/v1/members/:id/status**
- Change member status
- Request: `{ status: string, version: number }`
- Response: `Member` (200 OK)
- Errors: 404 (not found), 409 (optimistic locking conflict)

### Member Export

**GET /api/v1/members/export**
- Export all members to CSV
- Response: CSV file (200 OK)

### Member Statistics

**GET /api/v1/members/statistics**
- Get member statistics
- Response: `{ total: number, visitors: number, members: number, inactive: number }`

---

## Events Published

All events follow the CloudEvents 1.0 specification.

### member.created
```json
{
  "specversion": "1.0",
  "type": "com.webwaka.member.created",
  "source": "/member-management",
  "id": "uuid-created-timestamp",
  "time": "2026-02-13T14:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "tenantId": "uuid",
    "memberId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "email": "john.doe@example.com",
    "status": "visitor",
    "createdAt": "2026-02-13T14:00:00Z"
  }
}
```

### member.updated
- Similar structure to `member.created`

### member.deleted
```json
{
  "data": {
    "tenantId": "uuid",
    "memberId": "uuid",
    "deletedAt": "2026-02-13T14:00:00Z"
  }
}
```

### member.status.changed
```json
{
  "data": {
    "tenantId": "uuid",
    "memberId": "uuid",
    "oldStatus": "visitor",
    "newStatus": "member",
    "changedAt": "2026-02-13T14:00:00Z"
  }
}
```

### family.updated
```json
{
  "data": {
    "tenantId": "uuid",
    "familyId": "uuid",
    "updatedAt": "2026-02-13T14:00:00Z"
  }
}
```

---

## Database Schema

### members
- Primary Key: `id` (UUID)
- Tenant Isolation: `tenant_id` (UUID)
- Unique Constraint: `(tenant_id, phone)`
- Indexes: `tenant_id`, `phone`, `email`, `status`, `deleted_at`, `tags` (GIN)
- Soft Delete: `deleted_at`
- Optimistic Locking: `version`

### families
- Primary Key: `id` (UUID)
- Foreign Key: `primary_contact_id` → `members(id)`

### family_relationships
- Primary Key: `id` (UUID)
- Foreign Keys: `family_id` → `families(id)`, `member_id` → `members(id)`
- Unique Constraint: `(family_id, member_id)`

### member_notes
- Primary Key: `id` (UUID)
- Foreign Key: `member_id` → `members(id)`
- Visibility: `private`, `leaders_only`, `public`

### member_audit_logs
- Primary Key: `id` (UUID)
- Stores: `old_values` (JSONB), `new_values` (JSONB)
- Tracks: `action`, `changed_by`, `ip_address`, `user_agent`

---

## Multi-Tenancy

**Tenant Isolation:**
- All tables include `tenant_id` column
- Row-Level Security (RLS) policies enforce tenant isolation
- API requires `X-Tenant-Id` header for all requests
- Database queries automatically filter by `tenant_id`

**Setting Tenant Context:**
```sql
SET app.current_tenant_id = 'tenant-uuid';
```

---

## Compliance

### Nigerian-First Compliance
- ✅ Phone number validation: `+234XXXXXXXXXX` format
- ✅ Nigerian states supported in address fields
- ✅ NDPR compliance: Audit logs, soft deletes, data portability

### NDPR Compliance
- ✅ Audit trail: All changes logged in `member_audit_logs`
- ✅ Right to access: Audit logs retrievable via API
- ✅ Right to deletion: Soft delete with anonymization
- ✅ Right to portability: CSV export functionality

### Mobile-First & PWA-First
- ✅ API designed for offline-first mobile apps
- ✅ Optimistic locking prevents data conflicts
- ✅ Event-driven architecture supports background sync

---

## Testing

**Unit Tests:** See `tests/unit/member-management/`
**Integration Tests:** See `tests/integration/member-management/`
**E2E Tests:** See `tests/e2e/member-management/`

**Test Coverage Target:** 100%

---

## Dependencies

### Internal Dependencies
- `event-system`: Event bus for publishing CloudEvents
- `user-identity`: Authentication and authorization
- `audit-system`: Centralized audit logging

### External Dependencies
- TypeORM: ORM for PostgreSQL
- class-validator: DTO validation
- class-transformer: DTO transformation
- PostgreSQL: Primary database
- RabbitMQ/NATS: Event bus

---

## Usage Example

```typescript
import { MemberService } from './services/MemberService';
import { MemberRepository } from './repositories/MemberRepository';
import { MemberEventPublisher } from './events/MemberEventPublisher';
import { MemberAuditLogger } from './utils/MemberAuditLogger';

// Initialize dependencies
const memberRepository = new MemberRepository(dataSource);
const eventPublisher = new MemberEventPublisher(eventBus);
const auditLogger = new MemberAuditLogger(dataSource);

// Initialize service
const memberService = new MemberService(
  memberRepository,
  eventPublisher,
  auditLogger
);

// Create a member
const member = await memberService.createMember(
  'tenant-uuid',
  'user-uuid',
  {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+2348012345678',
    email: 'john.doe@example.com',
    status: 'visitor',
  }
);

// Search members
const { members, total } = await memberService.searchMembers(
  'tenant-uuid',
  {
    query: 'John',
    status: 'member',
    page: 1,
    limit: 20,
  }
);
```

---

## Future Enhancements

1. **Elasticsearch Integration:** Full-text search with fuzzy matching and phonetic search
2. **Photo Upload:** Integration with file storage service for member photos
3. **SMS Integration:** Termii SMS gateway for member communication
4. **Offline Sync:** IndexedDB and service worker for offline mobile app
5. **Family Tree Visualization:** React Flow or D3.js for family tree UI
6. **Import Validation:** Enhanced CSV import with duplicate detection and validation
7. **Data Anonymization:** GDPR/NDPR-compliant data anonymization for deleted members
8. **Advanced Reporting:** Member growth analytics, retention metrics, engagement scores

---

## License

PROPRIETARY - All Rights Reserved

---

**Maintained by:** webwakaagent4 (Engineering & Delivery)  
**Organization:** WebWaka  
**Last Updated:** 2026-02-13
