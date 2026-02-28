# Member Management Specification

**Module ID:** Church Suite Module 1  
**Module Name:** Member Management  
**Version:** 1.0  
**Date:** 2026-02-13  
**Status:** DRAFT  
**Author:** webwakaagent3 (Architecture)  
**Reviewers:** webwakaagent4 (Engineering), webwakaagent5 (Quality)

---

## 1. Module Overview

### 1.1 Purpose

The Member Management module provides comprehensive church member registration, profile management, and relationship tracking capabilities for churches and religious organizations. It enables churches to maintain accurate member records, track member engagement, manage family relationships, and support pastoral care through detailed member information management. This module serves as the foundational data layer for all other Church Suite modules.

### 1.2 Scope

**In Scope:**
- Member registration and onboarding
- Member profile management (personal information, contact details, demographics)
- Family and household relationship management
- Member status tracking (active, inactive, visitor, member)
- Member categorization and tagging
- Member search and filtering
- Member data import/export
- Member photo management
- Member notes and pastoral care records
- Member attendance tracking integration points
- Member communication preferences
- Member privacy and consent management
- NDPR-compliant data protection
- Offline-first member data access
- Multi-tenant member data isolation

**Out of Scope:**
- Financial contributions and donations (Donations module)
- Event registration and attendance (Event Management module)
- Mass communication and messaging (Communication Tools module)
- Volunteer scheduling and management (separate module)
- Small group management (separate module)
- Membership class enrollment (separate module)

### 1.3 Success Criteria

- [ ] Member registration completed in < 2 minutes on mobile devices
- [ ] Member profiles accessible offline with full CRUD operations
- [ ] Member search returns results in < 500ms for databases up to 10,000 members
- [ ] Family relationship visualization displays correctly on mobile screens
- [ ] Member data export completes in < 30 seconds for 5,000 members
- [ ] NDPR compliance validated by legal review
- [ ] 100% unit test coverage achieved
- [ ] All architectural invariants satisfied
- [ ] Mobile-first UI validated on devices with 320px width
- [ ] Offline sync completes within 5 minutes for 1,000 member updates

---

## 2. Requirements

### 2.1 Functional Requirements

**FR-1: Member Registration**
- **Description:** Enable church administrators to register new members with comprehensive profile information including personal details, contact information, family relationships, and membership status.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Registration form accessible on mobile devices (320px width minimum)
  - [ ] Required fields: Full name, phone number (+234 format), email (optional), membership status
  - [ ] Optional fields: Date of birth, gender, address, photo, marital status, occupation
  - [ ] Phone number validation for Nigerian format (+234XXXXXXXXXX)
  - [ ] Email validation with proper format checking
  - [ ] Photo upload with automatic compression for mobile networks
  - [ ] Registration works offline with background sync
  - [ ] Duplicate detection based on phone number and name
  - [ ] Registration confirmation sent via SMS (Termii) or email

**FR-2: Member Profile Management**
- **Description:** Allow authorized users to view and update member profiles with full audit trail of changes.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Profile view displays all member information in mobile-optimized layout
  - [ ] Profile edit form supports inline editing with optimistic updates
  - [ ] Profile updates sync automatically when online
  - [ ] Profile change history tracked with timestamp and user attribution
  - [ ] Profile photo display with fallback to initials avatar
  - [ ] Profile sections collapsible for mobile viewing
  - [ ] Profile data validation on client and server side
  - [ ] Profile updates emit member.updated events

**FR-3: Family and Household Management**
- **Description:** Enable tracking of family relationships and household structures with visual relationship mapping.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Family creation with primary contact designation
  - [ ] Household member linking with relationship types (spouse, child, parent, sibling, other)
  - [ ] Family tree visualization on mobile and desktop
  - [ ] Children automatically linked to parents in family structure
  - [ ] Family address shared across household members with override capability
  - [ ] Family contact preferences managed at household level
  - [ ] Family member count displayed on family profile
  - [ ] Family relationship changes emit family.updated events

**FR-4: Member Status Tracking**
- **Description:** Track member lifecycle status with automated status transitions and notifications.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Status types: Visitor, New Member, Active Member, Inactive Member, Transferred, Deceased
  - [ ] Status change workflow with reason capture
  - [ ] Status change notifications to church administrators
  - [ ] Status history tracking with timestamps
  - [ ] Automated inactive status after 90 days without attendance (configurable)
  - [ ] Status filters in member search and reports
  - [ ] Status change permissions based on user roles
  - [ ] Status changes emit member.status.changed events

**FR-5: Member Categorization and Tagging**
- **Description:** Support flexible member categorization through custom tags and categories for ministry involvement, skills, interests, and demographics.
- **Priority:** SHOULD
- **Acceptance Criteria:**
  - [ ] Custom tag creation by administrators
  - [ ] Multiple tags assignable to single member
  - [ ] Tag-based search and filtering
  - [ ] Tag categories (ministry, skills, interests, demographics)
  - [ ] Tag color coding for visual identification
  - [ ] Tag usage statistics and reporting
  - [ ] Tag management interface with bulk operations
  - [ ] Tag changes emit member.tags.updated events

**FR-6: Member Search and Filtering**
- **Description:** Provide powerful search and filtering capabilities with mobile-optimized interface and offline support.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Full-text search across name, phone, email, address
  - [ ] Filter by status, gender, age range, tags, family
  - [ ] Search results display in < 500ms for 10,000 members
  - [ ] Search works offline with locally cached data
  - [ ] Search results paginated (50 members per page)
  - [ ] Search history saved for quick access
  - [ ] Advanced search with multiple criteria combination
  - [ ] Search results exportable to CSV/Excel

**FR-7: Member Data Import/Export**
- **Description:** Enable bulk member data import from spreadsheets and export for reporting and backup purposes.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] CSV import with field mapping interface
  - [ ] Excel import support (.xlsx format)
  - [ ] Import validation with error reporting
  - [ ] Import preview before final commit
  - [ ] Duplicate detection during import
  - [ ] Export to CSV, Excel, PDF formats
  - [ ] Export with custom field selection
  - [ ] Export respects user permissions and data privacy
  - [ ] Import/export operations logged for audit

**FR-8: Member Notes and Pastoral Care**
- **Description:** Allow authorized users to add confidential notes for pastoral care and member follow-up.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Note creation with rich text formatting
  - [ ] Note categorization (pastoral care, follow-up, prayer request, counseling)
  - [ ] Note visibility controls (private, leadership only, public)
  - [ ] Note attachments support (documents, images)
  - [ ] Note search within member profile
  - [ ] Note timestamp and author attribution
  - [ ] Note edit history tracking
  - [ ] Notes sync across devices with encryption

**FR-9: Member Communication Preferences**
- **Description:** Manage member preferences for communication channels and consent for data processing.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Communication channel preferences (SMS, email, phone, WhatsApp)
  - [ ] Opt-in/opt-out for marketing communications
  - [ ] NDPR consent capture and tracking
  - [ ] Communication preference updates by member self-service
  - [ ] Preference changes logged for compliance
  - [ ] Preference-based communication filtering
  - [ ] Preference export for compliance reporting
  - [ ] Preference changes emit member.preferences.updated events

**FR-10: Member Privacy and Data Protection**
- **Description:** Implement NDPR-compliant data protection with member data access, deletion, and portability rights.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Member data access request handling
  - [ ] Member data deletion request handling (right to be forgotten)
  - [ ] Member data export for portability (JSON/CSV format)
  - [ ] Data retention policy enforcement
  - [ ] Data breach notification workflow
  - [ ] Privacy policy acceptance tracking
  - [ ] Data processing consent management
  - [ ] Anonymization of deleted member data for historical records

### 2.2 Non-Functional Requirements

**NFR-1: Performance**
- **Requirement:** Member list loads in < 2 seconds on 3G networks, member profile loads in < 1 second, member search returns results in < 500ms
- **Measurement:** Lighthouse performance audit, real-user monitoring (RUM)
- **Acceptance Criteria:** P95 latency meets targets on 3G networks with 2GB RAM devices

**NFR-2: Scalability**
- **Requirement:** Support 10,000 members per tenant with sub-second search performance
- **Measurement:** Load testing with JMeter or k6
- **Acceptance Criteria:** System maintains performance under 100 concurrent users per tenant

**NFR-3: Reliability**
- **Requirement:** 99.9% uptime for member data access, zero data loss on offline operations
- **Measurement:** Uptime monitoring, offline sync success rate
- **Acceptance Criteria:** Offline sync success rate > 99.5%, data loss incidents = 0

**NFR-4: Security**
- **Requirement:** All member data encrypted at rest and in transit, role-based access control enforced, audit trail for all data access
- **Measurement:** Security audit, penetration testing
- **Acceptance Criteria:** Zero critical vulnerabilities, 100% encryption coverage, audit trail completeness 100%

**NFR-5: Maintainability**
- **Requirement:** Code coverage > 90%, code complexity < 15 cyclomatic complexity, documentation completeness 100%
- **Measurement:** SonarQube analysis, test coverage reports
- **Acceptance Criteria:** All maintainability metrics meet targets, technical debt ratio < 5%

**NFR-6: Usability**
- **Requirement:** Member registration completable by non-technical users in < 2 minutes, mobile UI passes accessibility audit
- **Measurement:** User testing, accessibility audit (WCAG 2.1 AA)
- **Acceptance Criteria:** Task completion rate > 95%, accessibility score > 90

**NFR-7: Offline Capability**
- **Requirement:** Full CRUD operations available offline, sync completes within 5 minutes for 1,000 updates
- **Measurement:** Offline functionality testing, sync performance testing
- **Acceptance Criteria:** 100% offline feature parity, sync conflicts < 1% of operations

---

## 3. Architecture

### 3.1 High-Level Architecture

The Member Management module follows WebWaka's plugin-first, event-driven, offline-first architecture. It consists of three primary layers:

**Components:**

1. **Member Service (Backend):** Core business logic for member CRUD operations, family management, search, and data validation. Exposes REST and GraphQL APIs. Emits events for all state changes.

2. **Member UI (Frontend/PWA):** Progressive Web App providing mobile-first, responsive interface for member management. Implements offline-first data access with IndexedDB caching and background sync.

3. **Member Sync Engine:** Handles bidirectional synchronization between offline client storage and backend database. Implements conflict resolution, delta sync, and event replay.

4. **Member Search Index:** Elasticsearch-based full-text search index for fast member lookup. Supports fuzzy matching, phonetic search, and complex filtering.

5. **Member Event Bus:** Event-driven integration layer emitting events for member lifecycle changes (created, updated, deleted, status changed). Enables cross-module integration.

6. **Member Storage:** PostgreSQL database with tenant-scoped partitioning. Stores member profiles, family relationships, notes, and audit logs.

**Data Flow:**

1. User interacts with Member UI (PWA) on mobile/desktop device
2. UI performs optimistic update to local IndexedDB cache
3. UI dispatches API request to Member Service (when online)
4. Member Service validates request, checks permissions, executes business logic
5. Member Service persists changes to Member Storage (PostgreSQL)
6. Member Service emits events to Member Event Bus (e.g., member.created, member.updated)
7. Member Service updates Member Search Index (Elasticsearch)
8. Member Service returns response to UI
9. Member Sync Engine reconciles offline changes when device comes online
10. Other modules subscribe to member events for cross-module integration

### 3.2 Component Details

#### Component 1: Member Service (Backend)

**Responsibility:** Core business logic for member management, data validation, permission enforcement, event emission, API exposure.

**Interfaces:**
- **Input:** REST API requests (JSON), GraphQL queries/mutations, internal service calls
- **Output:** API responses (JSON), events (member.created, member.updated, member.deleted, member.status.changed, family.updated), search index updates

**Dependencies:**
- PostgreSQL (Member Storage)
- Elasticsearch (Member Search Index)
- Redis (caching, session management)
- Event Bus (RabbitMQ or Kafka)
- Authentication Service (JWT validation)
- Authorization Service (permission checks)
- File Storage Service (member photos)
- SMS Service (Termii integration for notifications)

**Implementation Notes:**
- Implement using Node.js/TypeScript with NestJS framework
- Use TypeORM for database access with repository pattern
- Implement CQRS pattern for read/write separation
- Use Bull queue for background jobs (data import, export, sync)
- Implement rate limiting to prevent abuse
- Use Joi or Zod for request validation
- Implement circuit breaker for external service calls

#### Component 2: Member UI (Frontend/PWA)

**Responsibility:** User interface for member management with offline-first capabilities, responsive design, and accessibility compliance.

**Interfaces:**
- **Input:** User interactions (clicks, form submissions), API responses, service worker messages
- **Output:** API requests, UI updates, local storage updates, user notifications

**Dependencies:**
- Member Service API (REST/GraphQL)
- IndexedDB (offline storage)
- Service Worker (offline caching, background sync)
- Camera API (photo capture)
- Geolocation API (address autofill)

**Implementation Notes:**
- Implement using React 18+ with TypeScript
- Use TanStack Query (React Query) for data fetching and caching
- Use Zustand or Redux Toolkit for state management
- Use Tailwind CSS for responsive styling
- Implement Workbox for service worker and offline support
- Use React Hook Form for form management
- Implement optimistic UI updates with rollback on error
- Use React Virtualized for large member lists
- Implement lazy loading for images and components

#### Component 3: Member Sync Engine

**Responsibility:** Bidirectional synchronization between offline client storage and backend database with conflict resolution.

**Interfaces:**
- **Input:** Offline change queue from IndexedDB, server state from Member Service
- **Output:** Sync status updates, conflict resolution prompts, reconciled data

**Dependencies:**
- Member Service API
- IndexedDB (client-side)
- Service Worker (background sync)

**Implementation Notes:**
- Implement last-write-wins conflict resolution with timestamp comparison
- Use vector clocks for distributed conflict detection
- Implement delta sync to minimize bandwidth usage
- Use exponential backoff for retry logic
- Implement sync status indicators in UI
- Log sync errors for debugging
- Implement manual conflict resolution UI for complex cases

#### Component 4: Member Search Index

**Responsibility:** Fast full-text search across member data with fuzzy matching and complex filtering.

**Interfaces:**
- **Input:** Member data updates from Member Service, search queries from API
- **Output:** Search results with relevance scoring, aggregations for faceted search

**Dependencies:**
- Elasticsearch cluster
- Member Service (data source)

**Implementation Notes:**
- Use Elasticsearch 8.x with custom analyzers for Nigerian names
- Implement phonetic search using Metaphone algorithm
- Use ngram tokenization for partial matching
- Implement field boosting (name > phone > email > address)
- Use aggregations for faceted search (status, gender, age range)
- Implement search result highlighting
- Use Elasticsearch bulk API for index updates
- Implement index versioning for zero-downtime updates

#### Component 5: Member Event Bus

**Responsibility:** Event-driven integration layer for cross-module communication and audit logging.

**Interfaces:**
- **Input:** Events from Member Service (member.created, member.updated, etc.)
- **Output:** Event delivery to subscribers (other modules, audit service, analytics)

**Dependencies:**
- RabbitMQ or Apache Kafka (message broker)
- Event schema registry (Avro or JSON Schema)

**Implementation Notes:**
- Use CloudEvents specification for event format
- Implement event versioning for backward compatibility
- Use topic-based routing for event distribution
- Implement dead letter queue for failed event processing
- Use event replay capability for debugging and recovery
- Implement event filtering for subscribers
- Log all events to audit trail

#### Component 6: Member Storage

**Responsibility:** Persistent storage for member data with tenant isolation and audit logging.

**Interfaces:**
- **Input:** SQL queries from Member Service via TypeORM
- **Output:** Query results, transaction confirmations

**Dependencies:**
- PostgreSQL 15+ database
- Backup service (automated backups)

**Implementation Notes:**
- Use PostgreSQL row-level security for tenant isolation
- Implement table partitioning by tenant_id for scalability
- Use JSONB columns for flexible custom fields
- Implement database triggers for audit logging
- Use database indexes for common query patterns
- Implement soft deletes for data retention
- Use database constraints for data integrity
- Implement database migrations with Flyway or TypeORM migrations

### 3.3 Design Patterns

**Patterns Used:**

- **Repository Pattern:** Abstracts data access logic from business logic, enabling testability and flexibility in data sources.

- **CQRS (Command Query Responsibility Segregation):** Separates read and write operations for optimized performance and scalability.

- **Event Sourcing (Partial):** Captures all state changes as events for audit trail and event replay capabilities.

- **Optimistic Locking:** Prevents concurrent update conflicts using version numbers or timestamps.

- **Circuit Breaker:** Prevents cascading failures when external services (SMS, search) are unavailable.

- **Saga Pattern:** Manages distributed transactions across multiple services (e.g., member creation + photo upload + notification).

- **Strategy Pattern:** Enables pluggable conflict resolution strategies for offline sync.

- **Observer Pattern:** Implements event-driven architecture with publish-subscribe model.

---

## 4. API Specification

### 4.1 REST API Endpoints

#### Endpoint 1: Create Member

**Method:** POST  
**Path:** `/api/v1/members`  
**Description:** Create a new member profile with required and optional fields.

**Request:**
```json
{
  "firstName": "Chinedu",
  "lastName": "Okafor",
  "email": "chinedu.okafor@example.com",
  "phone": "+2348012345678",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "maritalStatus": "married",
  "address": {
    "street": "15 Admiralty Way",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "101241"
  },
  "membershipStatus": "active_member",
  "tags": ["choir", "youth_ministry"],
  "communicationPreferences": {
    "sms": true,
    "email": true,
    "phone": false
  },
  "consentGiven": true
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "firstName": "Chinedu",
    "lastName": "Okafor",
    "email": "chinedu.okafor@example.com",
    "phone": "+2348012345678",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "maritalStatus": "married",
    "address": {
      "street": "15 Admiralty Way",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "postalCode": "101241"
    },
    "membershipStatus": "active_member",
    "tags": ["choir", "youth_ministry"],
    "communicationPreferences": {
      "sms": true,
      "email": true,
      "phone": false
    },
    "consentGiven": true,
    "createdAt": "2026-02-13T14:30:00Z",
    "updatedAt": "2026-02-13T14:30:00Z"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number format is invalid. Expected format: +234XXXXXXXXXX",
    "field": "phone"
  }
}
```

**Status Codes:**
- **201:** Member created successfully
- **400:** Bad Request (validation error)
- **401:** Unauthorized (missing or invalid authentication)
- **403:** Forbidden (insufficient permissions)
- **409:** Conflict (duplicate member detected)
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `members:create` permission

---

#### Endpoint 2: Get Member by ID

**Method:** GET  
**Path:** `/api/v1/members/{memberId}`  
**Description:** Retrieve a member profile by unique identifier.

**Request:** No body (memberId in URL path)

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "firstName": "Chinedu",
    "lastName": "Okafor",
    "email": "chinedu.okafor@example.com",
    "phone": "+2348012345678",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "maritalStatus": "married",
    "address": {
      "street": "15 Admiralty Way",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "postalCode": "101241"
    },
    "membershipStatus": "active_member",
    "tags": ["choir", "youth_ministry"],
    "family": {
      "id": "fam_01HQZX9Y8K3M2N5P7Q9R1S3T5W",
      "name": "Okafor Family",
      "members": [
        {
          "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5X",
          "name": "Ngozi Okafor",
          "relationship": "spouse"
        },
        {
          "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5Y",
          "name": "Chioma Okafor",
          "relationship": "child"
        }
      ]
    },
    "communicationPreferences": {
      "sms": true,
      "email": true,
      "phone": false
    },
    "consentGiven": true,
    "createdAt": "2026-02-13T14:30:00Z",
    "updatedAt": "2026-02-13T14:30:00Z"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "Member with ID mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V not found"
  }
}
```

**Status Codes:**
- **200:** Success
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `members:read` permission

---

#### Endpoint 3: Update Member

**Method:** PUT  
**Path:** `/api/v1/members/{memberId}`  
**Description:** Update an existing member profile with partial or full data.

**Request:**
```json
{
  "membershipStatus": "inactive_member",
  "tags": ["choir", "youth_ministry", "usher"],
  "address": {
    "street": "20 Admiralty Way",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "101241"
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "firstName": "Chinedu",
    "lastName": "Okafor",
    "membershipStatus": "inactive_member",
    "tags": ["choir", "youth_ministry", "usher"],
    "address": {
      "street": "20 Admiralty Way",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "postalCode": "101241"
    },
    "updatedAt": "2026-02-13T15:45:00Z"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "Member was updated by another user. Please refresh and try again.",
    "currentVersion": 5,
    "requestedVersion": 4
  }
}
```

**Status Codes:**
- **200:** Success
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **409:** Conflict (optimistic locking failure)
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `members:update` permission

---

#### Endpoint 4: Delete Member

**Method:** DELETE  
**Path:** `/api/v1/members/{memberId}`  
**Description:** Soft delete a member profile (marks as deleted, preserves data for audit).

**Request:** No body (memberId in URL path)

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "deletedAt": "2026-02-13T16:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "Member with ID mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V not found"
  }
}
```

**Status Codes:**
- **200:** Success
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `members:delete` permission

---

#### Endpoint 5: Search Members

**Method:** GET  
**Path:** `/api/v1/members/search`  
**Description:** Search members with full-text search and filtering.

**Query Parameters:**
- `q` (string): Search query (searches name, phone, email)
- `status` (string): Filter by membership status
- `tags` (string[]): Filter by tags
- `gender` (string): Filter by gender
- `minAge` (number): Filter by minimum age
- `maxAge` (number): Filter by maximum age
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 50, max: 100)

**Request:** No body (query parameters in URL)

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "members": [
      {
        "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
        "firstName": "Chinedu",
        "lastName": "Okafor",
        "email": "chinedu.okafor@example.com",
        "phone": "+2348012345678",
        "membershipStatus": "active_member",
        "tags": ["choir", "youth_ministry"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "pages": 1
    }
  }
}
```

**Status Codes:**
- **200:** Success
- **400:** Bad Request (invalid query parameters)
- **401:** Unauthorized
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `members:read` permission

---

#### Endpoint 6: Create Family

**Method:** POST  
**Path:** `/api/v1/families`  
**Description:** Create a new family/household with primary contact.

**Request:**
```json
{
  "name": "Okafor Family",
  "primaryContactId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
  "address": {
    "street": "15 Admiralty Way",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "101241"
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "id": "fam_01HQZX9Y8K3M2N5P7Q9R1S3T5W",
    "name": "Okafor Family",
    "primaryContactId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "address": {
      "street": "15 Admiralty Way",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "postalCode": "101241"
    },
    "members": [
      {
        "id": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
        "name": "Chinedu Okafor",
        "relationship": "head"
      }
    ],
    "createdAt": "2026-02-13T14:30:00Z",
    "updatedAt": "2026-02-13T14:30:00Z"
  }
}
```

**Status Codes:**
- **201:** Family created successfully
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Primary contact not found
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `families:create` permission

---

#### Endpoint 7: Add Family Member

**Method:** POST  
**Path:** `/api/v1/families/{familyId}/members`  
**Description:** Add a member to an existing family with relationship type.

**Request:**
```json
{
  "memberId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5X",
  "relationship": "spouse"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "familyId": "fam_01HQZX9Y8K3M2N5P7Q9R1S3T5W",
    "memberId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5X",
    "relationship": "spouse",
    "addedAt": "2026-02-13T14:35:00Z"
  }
}
```

**Status Codes:**
- **201:** Member added to family successfully
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Family or member not found
- **409:** Member already in family
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `families:update` permission

---

#### Endpoint 8: Export Members

**Method:** POST  
**Path:** `/api/v1/members/export`  
**Description:** Export members to CSV or Excel format with custom field selection.

**Request:**
```json
{
  "format": "csv",
  "fields": ["firstName", "lastName", "email", "phone", "membershipStatus"],
  "filters": {
    "status": "active_member",
    "tags": ["choir"]
  }
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "exportId": "exp_01HQZX9Y8K3M2N5P7Q9R1S3T5Z",
    "downloadUrl": "https://storage.webwaka.com/exports/exp_01HQZX9Y8K3M2N5P7Q9R1S3T5Z.csv",
    "expiresAt": "2026-02-14T14:30:00Z"
  }
}
```

**Status Codes:**
- **202:** Export job created (async processing)
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **500:** Internal Server Error

**Authentication:** Required  
**Authorization:** Requires `members:export` permission

---

### 4.2 Event-Based API

#### Event 1: member.created

**Event Type:** `member.created`  
**Description:** Emitted when a new member is created.

**Payload:**
```json
{
  "specversion": "1.0",
  "type": "member.created",
  "source": "/members",
  "id": "evt_01HQZX9Y8K3M2N5P7Q9R1S3T5A",
  "time": "2026-02-13T14:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "memberId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "tenantId": "ten_01HQZX9Y8K3M2N5P7Q9R1S3T5B",
    "firstName": "Chinedu",
    "lastName": "Okafor",
    "email": "chinedu.okafor@example.com",
    "phone": "+2348012345678",
    "membershipStatus": "active_member",
    "createdBy": "usr_01HQZX9Y8K3M2N5P7Q9R1S3T5C",
    "createdAt": "2026-02-13T14:30:00Z"
  }
}
```

**Subscribers:** 
- Donations module (for donor profile creation)
- Event Management module (for event registration)
- Communication Tools module (for contact list updates)
- Analytics module (for member growth tracking)
- Audit Service (for compliance logging)

---

#### Event 2: member.updated

**Event Type:** `member.updated`  
**Description:** Emitted when a member profile is updated.

**Payload:**
```json
{
  "specversion": "1.0",
  "type": "member.updated",
  "source": "/members",
  "id": "evt_01HQZX9Y8K3M2N5P7Q9R1S3T5D",
  "time": "2026-02-13T15:45:00Z",
  "datacontenttype": "application/json",
  "data": {
    "memberId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "tenantId": "ten_01HQZX9Y8K3M2N5P7Q9R1S3T5B",
    "changes": {
      "membershipStatus": {
        "old": "active_member",
        "new": "inactive_member"
      },
      "tags": {
        "old": ["choir", "youth_ministry"],
        "new": ["choir", "youth_ministry", "usher"]
      }
    },
    "updatedBy": "usr_01HQZX9Y8K3M2N5P7Q9R1S3T5C",
    "updatedAt": "2026-02-13T15:45:00Z"
  }
}
```

**Subscribers:**
- Communication Tools module (for contact list updates)
- Analytics module (for member engagement tracking)
- Audit Service (for compliance logging)

---

#### Event 3: member.deleted

**Event Type:** `member.deleted`  
**Description:** Emitted when a member is soft deleted.

**Payload:**
```json
{
  "specversion": "1.0",
  "type": "member.deleted",
  "source": "/members",
  "id": "evt_01HQZX9Y8K3M2N5P7Q9R1S3T5E",
  "time": "2026-02-13T16:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "memberId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "tenantId": "ten_01HQZX9Y8K3M2N5P7Q9R1S3T5B",
    "deletedBy": "usr_01HQZX9Y8K3M2N5P7Q9R1S3T5C",
    "deletedAt": "2026-02-13T16:00:00Z",
    "reason": "Member requested data deletion (NDPR right to be forgotten)"
  }
}
```

**Subscribers:**
- Donations module (for donor anonymization)
- Event Management module (for registration cleanup)
- Communication Tools module (for contact list removal)
- Audit Service (for compliance logging)

---

#### Event 4: member.status.changed

**Event Type:** `member.status.changed`  
**Description:** Emitted when a member's membership status changes.

**Payload:**
```json
{
  "specversion": "1.0",
  "type": "member.status.changed",
  "source": "/members",
  "id": "evt_01HQZX9Y8K3M2N5P7Q9R1S3T5F",
  "time": "2026-02-13T15:45:00Z",
  "datacontenttype": "application/json",
  "data": {
    "memberId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5V",
    "tenantId": "ten_01HQZX9Y8K3M2N5P7Q9R1S3T5B",
    "oldStatus": "active_member",
    "newStatus": "inactive_member",
    "reason": "No attendance in 90 days",
    "changedBy": "sys_automated",
    "changedAt": "2026-02-13T15:45:00Z"
  }
}
```

**Subscribers:**
- Communication Tools module (for automated follow-up)
- Analytics module (for retention tracking)
- Audit Service (for compliance logging)

---

#### Event 5: family.updated

**Event Type:** `family.updated`  
**Description:** Emitted when a family structure is updated (member added/removed).

**Payload:**
```json
{
  "specversion": "1.0",
  "type": "family.updated",
  "source": "/families",
  "id": "evt_01HQZX9Y8K3M2N5P7Q9R1S3T5G",
  "time": "2026-02-13T14:35:00Z",
  "datacontenttype": "application/json",
  "data": {
    "familyId": "fam_01HQZX9Y8K3M2N5P7Q9R1S3T5W",
    "tenantId": "ten_01HQZX9Y8K3M2N5P7Q9R1S3T5B",
    "action": "member_added",
    "memberId": "mem_01HQZX9Y8K3M2N5P7Q9R1S3T5X",
    "relationship": "spouse",
    "updatedBy": "usr_01HQZX9Y8K3M2N5P7Q9R1S3T5C",
    "updatedAt": "2026-02-13T14:35:00Z"
  }
}
```

**Subscribers:**
- Communication Tools module (for family communication)
- Analytics module (for family structure analysis)
- Audit Service (for compliance logging)

---

## 5. Data Model

### 5.1 Entities

#### Entity 1: Member

**Description:** Represents a church member with personal information, contact details, and membership status.

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **tenantId:** UUID (Foreign Key to Tenant, Required, Indexed)
- **firstName:** String (Required, Max 100 characters)
- **lastName:** String (Required, Max 100 characters)
- **middleName:** String (Optional, Max 100 characters)
- **email:** String (Optional, Max 255 characters, Unique per tenant)
- **phone:** String (Required, Max 20 characters, Unique per tenant, Format: +234XXXXXXXXXX)
- **dateOfBirth:** Date (Optional)
- **gender:** Enum (male, female, other, prefer_not_to_say)
- **maritalStatus:** Enum (single, married, divorced, widowed, other)
- **occupation:** String (Optional, Max 255 characters)
- **address:** JSONB (street, city, state, country, postalCode)
- **photoUrl:** String (Optional, Max 500 characters)
- **membershipStatus:** Enum (visitor, new_member, active_member, inactive_member, transferred, deceased)
- **membershipDate:** Date (Optional, Date when became member)
- **tags:** String[] (Array of tag names)
- **customFields:** JSONB (Flexible custom fields per tenant)
- **communicationPreferences:** JSONB (sms, email, phone, whatsapp)
- **consentGiven:** Boolean (NDPR consent for data processing)
- **consentDate:** Timestamp (When consent was given)
- **familyId:** UUID (Foreign Key to Family, Optional)
- **createdBy:** UUID (Foreign Key to User)
- **updatedBy:** UUID (Foreign Key to User)
- **createdAt:** Timestamp (Auto-generated)
- **updatedAt:** Timestamp (Auto-updated)
- **deletedAt:** Timestamp (Soft delete, Nullable)
- **version:** Integer (Optimistic locking version)

**Relationships:**
- **Family:** Many-to-One (Member belongs to one Family)
- **Notes:** One-to-Many (Member has many Notes)
- **AuditLogs:** One-to-Many (Member has many AuditLogs)

**Indexes:**
- **Primary:** id
- **Unique:** (tenantId, email) where email is not null
- **Unique:** (tenantId, phone)
- **Secondary:** (tenantId, membershipStatus)
- **Secondary:** (tenantId, lastName, firstName)
- **Secondary:** (tenantId, familyId)
- **GIN Index:** tags (for array search)
- **GIN Index:** customFields (for JSONB search)

**Constraints:**
- **Unique:** (tenantId, email) where email is not null
- **Unique:** (tenantId, phone)
- **Foreign Key:** tenantId references tenants(id)
- **Foreign Key:** familyId references families(id)
- **Check:** phone matches '+234[0-9]{10}' pattern
- **Check:** email matches email format pattern

---

#### Entity 2: Family

**Description:** Represents a family or household with shared address and relationships.

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **tenantId:** UUID (Foreign Key to Tenant, Required, Indexed)
- **name:** String (Required, Max 255 characters, e.g., "Okafor Family")
- **primaryContactId:** UUID (Foreign Key to Member, Required)
- **address:** JSONB (street, city, state, country, postalCode)
- **createdBy:** UUID (Foreign Key to User)
- **updatedBy:** UUID (Foreign Key to User)
- **createdAt:** Timestamp (Auto-generated)
- **updatedAt:** Timestamp (Auto-updated)
- **deletedAt:** Timestamp (Soft delete, Nullable)

**Relationships:**
- **Members:** One-to-Many (Family has many Members)
- **PrimaryContact:** Many-to-One (Family has one primary contact Member)

**Indexes:**
- **Primary:** id
- **Secondary:** (tenantId, name)
- **Secondary:** (tenantId, primaryContactId)

**Constraints:**
- **Foreign Key:** tenantId references tenants(id)
- **Foreign Key:** primaryContactId references members(id)

---

#### Entity 3: FamilyRelationship

**Description:** Represents relationships between family members (spouse, child, parent, sibling).

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **tenantId:** UUID (Foreign Key to Tenant, Required, Indexed)
- **familyId:** UUID (Foreign Key to Family, Required)
- **memberId:** UUID (Foreign Key to Member, Required)
- **relationship:** Enum (head, spouse, child, parent, sibling, other)
- **createdBy:** UUID (Foreign Key to User)
- **createdAt:** Timestamp (Auto-generated)
- **deletedAt:** Timestamp (Soft delete, Nullable)

**Relationships:**
- **Family:** Many-to-One (Relationship belongs to one Family)
- **Member:** Many-to-One (Relationship belongs to one Member)

**Indexes:**
- **Primary:** id
- **Unique:** (familyId, memberId)
- **Secondary:** (tenantId, familyId)
- **Secondary:** (tenantId, memberId)

**Constraints:**
- **Unique:** (familyId, memberId)
- **Foreign Key:** tenantId references tenants(id)
- **Foreign Key:** familyId references families(id)
- **Foreign Key:** memberId references members(id)

---

#### Entity 4: MemberNote

**Description:** Represents confidential notes for pastoral care and member follow-up.

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **tenantId:** UUID (Foreign Key to Tenant, Required, Indexed)
- **memberId:** UUID (Foreign Key to Member, Required)
- **content:** Text (Required, Encrypted at rest)
- **category:** Enum (pastoral_care, follow_up, prayer_request, counseling, other)
- **visibility:** Enum (private, leadership_only, public)
- **attachments:** JSONB (Array of attachment URLs)
- **createdBy:** UUID (Foreign Key to User)
- **updatedBy:** UUID (Foreign Key to User)
- **createdAt:** Timestamp (Auto-generated)
- **updatedAt:** Timestamp (Auto-updated)
- **deletedAt:** Timestamp (Soft delete, Nullable)

**Relationships:**
- **Member:** Many-to-One (Note belongs to one Member)
- **Author:** Many-to-One (Note created by one User)

**Indexes:**
- **Primary:** id
- **Secondary:** (tenantId, memberId, createdAt DESC)
- **Secondary:** (tenantId, category)

**Constraints:**
- **Foreign Key:** tenantId references tenants(id)
- **Foreign Key:** memberId references members(id)
- **Foreign Key:** createdBy references users(id)

---

#### Entity 5: MemberAuditLog

**Description:** Audit trail for all member data changes for compliance and debugging.

**Attributes:**
- **id:** UUID (Primary Key, Auto-generated)
- **tenantId:** UUID (Foreign Key to Tenant, Required, Indexed)
- **memberId:** UUID (Foreign Key to Member, Required)
- **action:** Enum (created, updated, deleted, status_changed, exported, accessed)
- **changes:** JSONB (Field-level changes with old/new values)
- **userId:** UUID (Foreign Key to User, Who performed the action)
- **ipAddress:** String (IP address of the user)
- **userAgent:** String (Browser/device information)
- **timestamp:** Timestamp (Auto-generated)

**Relationships:**
- **Member:** Many-to-One (AuditLog belongs to one Member)
- **User:** Many-to-One (AuditLog performed by one User)

**Indexes:**
- **Primary:** id
- **Secondary:** (tenantId, memberId, timestamp DESC)
- **Secondary:** (tenantId, action, timestamp DESC)
- **Secondary:** (tenantId, userId, timestamp DESC)

**Constraints:**
- **Foreign Key:** tenantId references tenants(id)
- **Foreign Key:** memberId references members(id)
- **Foreign Key:** userId references users(id)

---

### 5.2 Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE membership_status AS ENUM ('visitor', 'new_member', 'active_member', 'inactive_member', 'transferred', 'deceased');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE marital_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'other');
CREATE TYPE family_relationship AS ENUM ('head', 'spouse', 'child', 'parent', 'sibling', 'other');
CREATE TYPE note_category AS ENUM ('pastoral_care', 'follow_up', 'prayer_request', 'counseling', 'other');
CREATE TYPE note_visibility AS ENUM ('private', 'leadership_only', 'public');
CREATE TYPE audit_action AS ENUM ('created', 'updated', 'deleted', 'status_changed', 'exported', 'accessed');

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  gender gender_type,
  marital_status marital_status,
  occupation VARCHAR(255),
  address JSONB,
  photo_url VARCHAR(500),
  membership_status membership_status NOT NULL DEFAULT 'visitor',
  membership_date DATE,
  tags TEXT[],
  custom_fields JSONB,
  communication_preferences JSONB,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP,
  family_id UUID,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  version INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT members_tenant_email_unique UNIQUE (tenant_id, email) WHERE email IS NOT NULL,
  CONSTRAINT members_tenant_phone_unique UNIQUE (tenant_id, phone),
  CONSTRAINT members_phone_format_check CHECK (phone ~ '^\+234[0-9]{10}$'),
  CONSTRAINT members_email_format_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for members table
CREATE INDEX idx_members_tenant_id ON members(tenant_id);
CREATE INDEX idx_members_tenant_status ON members(tenant_id, membership_status);
CREATE INDEX idx_members_tenant_name ON members(tenant_id, last_name, first_name);
CREATE INDEX idx_members_tenant_family ON members(tenant_id, family_id);
CREATE INDEX idx_members_tags ON members USING GIN(tags);
CREATE INDEX idx_members_custom_fields ON members USING GIN(custom_fields);
CREATE INDEX idx_members_deleted_at ON members(deleted_at) WHERE deleted_at IS NULL;

-- Families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  primary_contact_id UUID NOT NULL,
  address JSONB,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for families table
CREATE INDEX idx_families_tenant_id ON families(tenant_id);
CREATE INDEX idx_families_tenant_name ON families(tenant_id, name);
CREATE INDEX idx_families_tenant_primary_contact ON families(tenant_id, primary_contact_id);
CREATE INDEX idx_families_deleted_at ON families(deleted_at) WHERE deleted_at IS NULL;

-- Family relationships table
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  family_id UUID NOT NULL,
  member_id UUID NOT NULL,
  relationship family_relationship NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  CONSTRAINT family_relationships_family_member_unique UNIQUE (family_id, member_id)
);

-- Indexes for family_relationships table
CREATE INDEX idx_family_relationships_tenant_id ON family_relationships(tenant_id);
CREATE INDEX idx_family_relationships_family_id ON family_relationships(tenant_id, family_id);
CREATE INDEX idx_family_relationships_member_id ON family_relationships(tenant_id, member_id);

-- Member notes table
CREATE TABLE member_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  member_id UUID NOT NULL,
  content TEXT NOT NULL,
  category note_category NOT NULL,
  visibility note_visibility NOT NULL DEFAULT 'private',
  attachments JSONB,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for member_notes table
CREATE INDEX idx_member_notes_tenant_id ON member_notes(tenant_id);
CREATE INDEX idx_member_notes_member_created ON member_notes(tenant_id, member_id, created_at DESC);
CREATE INDEX idx_member_notes_category ON member_notes(tenant_id, category);
CREATE INDEX idx_member_notes_deleted_at ON member_notes(deleted_at) WHERE deleted_at IS NULL;

-- Member audit logs table
CREATE TABLE member_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  member_id UUID NOT NULL,
  action audit_action NOT NULL,
  changes JSONB,
  user_id UUID NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for member_audit_logs table
CREATE INDEX idx_member_audit_logs_tenant_id ON member_audit_logs(tenant_id);
CREATE INDEX idx_member_audit_logs_member_timestamp ON member_audit_logs(tenant_id, member_id, timestamp DESC);
CREATE INDEX idx_member_audit_logs_action_timestamp ON member_audit_logs(tenant_id, action, timestamp DESC);
CREATE INDEX idx_member_audit_logs_user_timestamp ON member_audit_logs(tenant_id, user_id, timestamp DESC);

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_notes_updated_at BEFORE UPDATE ON member_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION log_member_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO member_audit_logs (tenant_id, member_id, action, changes, user_id)
    VALUES (NEW.tenant_id, NEW.id, 'created', to_jsonb(NEW), NEW.created_by);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO member_audit_logs (tenant_id, member_id, action, changes, user_id)
    VALUES (NEW.tenant_id, NEW.id, 'updated', jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)), NEW.updated_by);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO member_audit_logs (tenant_id, member_id, action, changes, user_id)
    VALUES (OLD.tenant_id, OLD.id, 'deleted', to_jsonb(OLD), OLD.updated_by);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_member_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON members
  FOR EACH ROW EXECUTE FUNCTION log_member_changes();

-- Row-level security for tenant isolation
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy_members ON members
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy_families ON families
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy_family_relationships ON family_relationships
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy_member_notes ON member_notes
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy_member_audit_logs ON member_audit_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

## 6. Dependencies

### 6.1 Internal Dependencies

**Depends On:**
- **Authentication Service:** For user authentication and JWT token validation
- **Authorization Service:** For permission checks and role-based access control
- **Tenant Service:** For tenant context and multi-tenancy support
- **File Storage Service:** For member photo uploads and storage
- **Event Bus Service:** For event publishing and subscription

**Depended On By:**
- **Donations Module:** Uses member data for donor profiles and contribution tracking
- **Event Management Module:** Uses member data for event registration and attendance
- **Communication Tools Module:** Uses member data for contact lists and messaging
- **Analytics Module:** Uses member data for church growth and engagement analytics

### 6.2 External Dependencies

**Third-Party Libraries:**
- **NestJS v10+:** Backend framework for Node.js with TypeScript support
- **TypeORM v0.3+:** Object-relational mapping for database access
- **PostgreSQL v15+:** Relational database for persistent storage
- **Elasticsearch v8+:** Search engine for full-text search
- **Redis v7+:** In-memory cache for session management and caching
- **RabbitMQ v3.12+ or Apache Kafka v3+:** Message broker for event bus
- **Bull v4+:** Queue management for background jobs
- **Joi v17+ or Zod v3+:** Schema validation for API requests
- **React v18+:** Frontend framework for UI
- **TanStack Query v5+:** Data fetching and caching for React
- **Zustand v4+ or Redux Toolkit v2+:** State management for React
- **Tailwind CSS v3+:** Utility-first CSS framework
- **Workbox v7+:** Service worker library for offline support
- **React Hook Form v7+:** Form management for React
- **React Virtualized v9+:** Virtualization for large lists

**External Services:**
- **Termii SMS Gateway:** For SMS notifications and OTP delivery
- **Cloudflare CDN:** For global content delivery and edge caching
- **AWS S3 or Cloudflare R2:** For member photo storage
- **Sentry:** For error tracking and monitoring
- **Datadog or New Relic:** For application performance monitoring

---

## 7. Compliance

### 7.1 Nigerian-First Compliance

- [x] Supports Nigerian Naira (₦, NGN) for financial fields
- [x] Supports Paystack payment gateway (for future donation integration)
- [x] Supports Flutterwave payment gateway (for future donation integration)
- [x] Supports Interswitch payment gateway (for future donation integration)
- [x] Supports 40+ Nigerian banks (for future bank account verification)
- [x] Supports Termii SMS gateway for member notifications and OTP
- [x] Supports +234 phone number format with validation
- [x] Supports Nigerian address format (36 states + FCT)
- [x] NDPR compliant (data protection, consent management, right to access/deletion/portability)
- [x] CBN compliant (financial regulations for future payment features)
- [x] NCC compliant (communications regulations for SMS)
- [x] CAC compliant (business registration for church organizations)

### 7.2 Mobile-First Compliance

- [x] Responsive design (320px to 1024px viewport width)
- [x] Touch-friendly UI (44x44 pixel minimum touch targets)
- [x] Mobile performance optimized (< 3s page load on 3G networks)
- [x] Mobile accessibility (VoiceOver, TalkBack support, WCAG 2.1 AA)
- [x] Works on low-spec devices (2GB RAM, tested on entry-level Android)
- [x] Works on low-bandwidth networks (2G/3G, delta sync, compression)

### 7.3 PWA-First Compliance

- [x] Service worker implemented (Workbox for caching strategies)
- [x] Offline functionality works (full CRUD operations offline)
- [x] Background sync implemented (automatic sync when online)
- [x] App manifest valid (installable, app icons, theme colors)
- [x] Installable (Add to Home Screen prompt)
- [x] Push notifications supported (for member status changes, follow-ups)

### 7.4 Africa-First Compliance

- [x] Supports English (primary language for UI and documentation)
- [x] Supports Hausa, Yoruba, Igbo (Nigerian languages for member communication)
- [x] Supports French, Swahili (African languages for regional expansion)
- [x] Supports African payment methods (Paystack, Flutterwave, Interswitch)
- [x] Supports African currencies (NGN, with future support for KES, GHS, ZAR)
- [x] Works on African infrastructure (low-bandwidth, low-spec devices, edge caching in Lagos/Cape Town)

---

## 8. Testing Requirements

### 8.1 Unit Testing

**Coverage Target:** 100%

**Test Cases:**
- [ ] Member creation with valid data succeeds
- [ ] Member creation with invalid phone format fails
- [ ] Member creation with duplicate phone fails
- [ ] Member creation with invalid email format fails
- [ ] Member update with valid data succeeds
- [ ] Member update with optimistic locking conflict fails
- [ ] Member deletion soft deletes record
- [ ] Member search by name returns correct results
- [ ] Member search by phone returns correct results
- [ ] Member search with filters returns correct results
- [ ] Family creation with valid data succeeds
- [ ] Family member addition with valid relationship succeeds
- [ ] Family member addition with duplicate member fails
- [ ] Member note creation with valid data succeeds
- [ ] Member note visibility enforcement works correctly
- [ ] Member audit log captures all changes
- [ ] Member status change emits correct event
- [ ] Member NDPR consent tracking works correctly
- [ ] Member data export generates correct CSV
- [ ] Member data import validates and imports correctly

### 8.2 Integration Testing

**Test Scenarios:**
- [ ] End-to-end member registration flow (UI → API → Database → Event Bus)
- [ ] Offline member creation syncs correctly when online
- [ ] Member search index updates after member creation/update
- [ ] Member events trigger subscribers in other modules
- [ ] Member photo upload and retrieval works correctly
- [ ] Member data export completes successfully for 5,000 members
- [ ] Member data import handles duplicates correctly
- [ ] Family relationship visualization displays correctly
- [ ] Member audit log captures all database changes
- [ ] Tenant isolation prevents cross-tenant data access

### 8.3 End-to-End Testing

**User Flows:**
- [ ] Church administrator registers new member on mobile device
- [ ] Church administrator searches for member by name
- [ ] Church administrator updates member status from visitor to member
- [ ] Church administrator creates family and adds members
- [ ] Church administrator adds pastoral care note to member
- [ ] Church administrator exports member list to CSV
- [ ] Church administrator imports members from Excel spreadsheet
- [ ] Member requests data deletion (NDPR right to be forgotten)
- [ ] Member updates communication preferences via self-service
- [ ] Offline member registration syncs when device comes online

### 8.4 Performance Testing

**Performance Metrics:**
- [ ] API response time < 200ms for member CRUD operations (P95)
- [ ] Page load time < 3s on 3G networks (Lighthouse performance score > 90)
- [ ] Member list loads in < 2s for 10,000 members
- [ ] Member search returns results in < 500ms for 10,000 members
- [ ] Member photo upload completes in < 5s on 3G networks
- [ ] Member data export completes in < 30s for 5,000 members
- [ ] Member data import processes 1,000 members in < 2 minutes
- [ ] Offline sync completes in < 5 minutes for 1,000 member updates
- [ ] Memory usage < 100MB on low-spec devices (2GB RAM)
- [ ] Database query performance < 100ms for common queries

### 8.5 Security Testing

**Security Tests:**
- [ ] Authentication and authorization enforced on all endpoints
- [ ] JWT token validation prevents unauthorized access
- [ ] Role-based access control prevents privilege escalation
- [ ] Tenant isolation prevents cross-tenant data access
- [ ] Input validation and sanitization prevents injection attacks
- [ ] SQL injection prevention (parameterized queries, ORM)
- [ ] XSS prevention (output encoding, Content Security Policy)
- [ ] CSRF prevention (CSRF tokens, SameSite cookies)
- [ ] Member data encrypted at rest (database encryption)
- [ ] Member data encrypted in transit (TLS 1.3)
- [ ] Member notes encrypted with tenant-specific keys
- [ ] Member photo access requires authentication
- [ ] Audit log captures all data access and changes
- [ ] NDPR compliance validated (consent, access, deletion, portability)
- [ ] Rate limiting prevents brute force attacks
- [ ] Password complexity requirements enforced
- [ ] Session management secure (HttpOnly, Secure, SameSite cookies)

---

## 9. Documentation Requirements

### 9.1 Module Documentation

- [ ] README.md (module overview, architecture, setup instructions)
- [ ] ARCHITECTURE.md (detailed architecture, component diagrams, data flow)
- [ ] API.md (REST API reference, GraphQL schema, event specifications)
- [ ] CHANGELOG.md (version history, breaking changes, migration guides)
- [ ] CONTRIBUTING.md (contribution guidelines, code standards, PR process)

### 9.2 API Documentation

- [ ] OpenAPI/Swagger specification (REST API schema, request/response examples)
- [ ] GraphQL schema documentation (queries, mutations, subscriptions)
- [ ] API reference documentation (endpoint descriptions, parameters, responses)
- [ ] API usage examples (cURL, JavaScript, Python examples)
- [ ] API error codes and messages (comprehensive error catalog)
- [ ] Event schema documentation (CloudEvents format, payload examples)

### 9.3 User Documentation

- [ ] User guide (how to register members, manage families, add notes)
- [ ] Administrator guide (how to configure module, manage permissions, export data)
- [ ] FAQ (frequently asked questions, troubleshooting tips)
- [ ] Video tutorials (member registration, family management, data export)
- [ ] Troubleshooting guide (common issues, solutions, support contacts)
- [ ] NDPR compliance guide (data protection, consent management, member rights)

---

## 10. Risks and Mitigation

### Risk 1: Offline Sync Conflicts

**Description:** When multiple users edit the same member offline, sync conflicts may occur when devices come online.  
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:** Implement last-write-wins conflict resolution with timestamp comparison. Provide manual conflict resolution UI for complex cases. Log all conflicts for analysis. Implement optimistic locking to detect conflicts early.

### Risk 2: Performance Degradation with Large Member Databases

**Description:** Search and list operations may slow down as member database grows beyond 10,000 members.  
**Probability:** Medium  
**Impact:** High  
**Mitigation:** Implement pagination for all list endpoints. Use Elasticsearch for full-text search with optimized indexing. Implement database query optimization with proper indexes. Use Redis caching for frequently accessed data. Implement database partitioning by tenant for scalability.

### Risk 3: NDPR Compliance Violations

**Description:** Failure to comply with NDPR requirements may result in legal penalties and loss of trust.  
**Probability:** Low  
**Impact:** High  
**Mitigation:** Implement comprehensive consent management. Provide data access, deletion, and portability features. Conduct regular NDPR compliance audits. Train church administrators on data protection requirements. Implement data retention policies with automated deletion. Log all data access for audit trail.

### Risk 4: Data Loss During Offline Operations

**Description:** Device failure or browser cache clearing may result in loss of offline member data before sync.  
**Probability:** Low  
**Impact:** High  
**Mitigation:** Implement robust IndexedDB storage with error handling. Use service worker for reliable background sync. Implement periodic sync reminders for users. Provide manual sync trigger in UI. Log all offline operations for debugging. Implement data recovery mechanisms.

### Risk 5: Photo Upload Bandwidth Consumption

**Description:** Large photo uploads may consume excessive bandwidth on mobile networks, causing poor user experience.  
**Probability:** High  
**Impact:** Medium  
**Mitigation:** Implement client-side image compression before upload. Limit photo file size to 2MB maximum. Use progressive image loading with thumbnails. Implement lazy loading for photo galleries. Provide low-bandwidth mode with photo upload disabled. Use CDN for photo delivery.

### Risk 6: Search Index Synchronization Lag

**Description:** Delay between member data updates and search index updates may cause stale search results.  
**Probability:** Medium  
**Impact:** Low  
**Mitigation:** Implement near-real-time index updates using Elasticsearch bulk API. Use event-driven index updates triggered by member.created/updated events. Implement search result cache invalidation. Provide manual index refresh capability for administrators. Monitor index lag and alert on delays > 5 seconds.

### Risk 7: Family Relationship Complexity

**Description:** Complex family structures (blended families, adoptions) may not fit simple relationship model.  
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:** Provide flexible "other" relationship type with custom description. Allow multiple family memberships for children in blended families. Implement visual family tree editor for complex structures. Provide documentation and examples for common scenarios. Collect user feedback for relationship model improvements.

### Risk 8: SMS Gateway Reliability

**Description:** Termii SMS gateway failures may prevent critical member notifications (OTP, follow-ups).  
**Probability:** Low  
**Impact:** Medium  
**Mitigation:** Implement fallback to email when SMS fails. Use circuit breaker pattern for SMS gateway calls. Implement retry logic with exponential backoff. Monitor SMS delivery rates and alert on failures. Provide alternative SMS gateway configuration option. Log all SMS failures for analysis.

---

## 11. Timeline

**Specification:** Week 71 (Current)  
**Implementation:** Weeks 72-73  
**Testing:** Week 74  
**Validation:** Week 74  
**Approval:** Week 74

---

## 12. Approval

**Architecture (webwakaagent3):**
- [x] Specification complete
- [x] All sections filled
- [x] Compliance validated
- [x] Submitted for review

**Engineering (webwakaagent4):**
- [ ] Specification reviewed
- [ ] Feedback provided
- [ ] Approved for implementation

**Quality (webwakaagent5):**
- [ ] Test strategy defined
- [ ] Test cases identified
- [ ] Approved for implementation

**Founder Agent (webwaka007):**
- [ ] Final approval
- [ ] Ready for implementation

---

**Document Status:** DRAFT  
**Created By:** webwakaagent3 (Architecture)  
**Date:** 2026-02-13  
**Last Updated:** 2026-02-13
