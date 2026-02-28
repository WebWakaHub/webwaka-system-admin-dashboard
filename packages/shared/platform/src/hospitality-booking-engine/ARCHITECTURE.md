# Hospitality Booking Engine - Architecture Documentation

**Module ID:** Hospitality Suite - Module 1  
**Version:** 1.0.0  
**Author:** webwakaagent4 (Engineering)  
**Date:** 2026-02-13

---

## Overview

The Hospitality Booking Engine is a comprehensive, event-driven, offline-first reservation management system designed for hospitality businesses operating in Nigeria and across Africa. It implements all 10 WebWaka architectural invariants and provides complete booking lifecycle management from search to cancellation.

## Architectural Invariants Compliance

### 1. Offline-First ✅

The module implements comprehensive offline capabilities:

- **Offline Sync Engine:** Queues bookings created while offline in IndexedDB
- **Background Sync:** Automatically syncs queued bookings when network is restored
- **Conflict Resolution:** Implements "server wins" strategy with user notification
- **Exponential Backoff:** Retries failed syncs with increasing delays (1s, 2s, 4s, 8s, 16s)
- **Service Worker:** Caches UI assets for offline access

### 2. Event-Driven ✅

All booking state changes emit events:

- `booking.created` - Emitted when booking is created
- `booking.modified` - Emitted when booking is modified
- `booking.cancelled` - Emitted when booking is cancelled
- `payment.completed` - Emitted when payment is successful
- `booking.synced` - Emitted when offline booking is synced

Events are published to NATS/Redis Streams with schema validation and versioning.

### 3. Plugin-First ✅

The module is designed as a plugin to the minimal kernel:

- **No Direct Dependencies:** Communicates with other modules only via events
- **Self-Contained:** All booking logic encapsulated within the module
- **Pluggable:** Can be enabled/disabled without affecting other modules

### 4. Multi-Tenant ✅

All entities are tenant-scoped:

- **Tenant Isolation:** All database queries filter by `tenantId`
- **Tenant-Scoped Events:** All events include `tenantId`
- **Tenant-Scoped APIs:** All API endpoints enforce tenant isolation

### 5. Permission-Driven ✅

All operations check permissions:

- **JWT Authentication:** All API endpoints require valid JWT token
- **Permission Checks:** Operations validate user permissions before execution
- **Tenant Membership:** Users can only access data from their tenant

### 6. API-First ✅

All functionality exposed via REST API:

- `POST /api/v1/bookings/search` - Search available rooms
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking details
- `PATCH /api/v1/bookings/:id` - Modify booking
- `POST /api/v1/bookings/:id/cancel` - Cancel booking

### 7. Mobile-First ✅

Optimized for mobile devices:

- **Responsive Design:** UI adapts to 320px-1024px viewports
- **Touch-Friendly:** All interactive elements ≥ 44x44 pixels
- **Performance:** Page load < 3s on 3G networks
- **Low-Spec Support:** Runs on devices with 2GB RAM

### 8. Audit-Ready ✅

Complete audit trail:

- **Booking Events Table:** Records all booking state changes
- **Version Field:** Optimistic locking tracks concurrent modifications
- **Audit Fields:** `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on all entities
- **Event Log:** All events stored with timestamps and actor information

### 9. Nigerian-First ✅

Designed for Nigerian market:

- **Payment Gateways:** Paystack, Flutterwave, Interswitch
- **SMS Gateway:** Termii for Nigerian SMS delivery
- **Phone Format:** +234XXXXXXXXXX validation and auto-formatting
- **Currency:** Nigerian Naira (₦, NGN) as primary currency
- **NDPR Compliance:** Data protection consent and deletion support

### 10. PWA-First ✅

Progressive Web App capabilities:

- **Service Worker:** Caches assets for offline access
- **App Manifest:** Enables "Add to Home Screen"
- **Background Sync:** Syncs offline bookings when online
- **Push Notifications:** Supports booking reminders (future)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Hospitality Booking Engine               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Booking UI  │  │  Booking API │  │ Booking Svc  │      │
│  │   (React)    │→ │  (Express)   │→ │   (Domain)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                                      ↓              │
│  ┌──────────────┐                    ┌──────────────┐      │
│  │ Offline Sync │                    │    Event     │      │
│  │    Engine    │                    │  Publisher   │      │
│  └──────────────┘                    └──────────────┘      │
│         ↓                                      ↓              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  IndexedDB   │  │   Payment    │  │  Event Bus   │      │
│  │   (Offline)  │  │   Gateway    │  │ (NATS/Redis) │      │
│  └──────────────┘  │   Adapter    │  └──────────────┘      │
│                    └──────────────┘                          │
│                           ↓                                   │
│         ┌─────────────────┴─────────────────┐               │
│         ↓                 ↓                 ↓                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐          │
│  │ Paystack │      │Flutterwave│      │Interswitch│          │
│  └──────────┘      └──────────┘      └──────────┘          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Notification │  │   Database   │                        │
│  │   Service    │  │ (PostgreSQL) │                        │
│  └──────────────┘  └──────────────┘                        │
│         ↓                                                     │
│  ┌──────────┐                                               │
│  │  Termii  │                                               │
│  │   SMS    │                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Booking UI (PWA)

**Technology:** React, TypeScript, TailwindCSS, Vite

**Responsibilities:**
- Render booking search and creation forms
- Handle user interactions
- Manage offline state with IndexedDB
- Register service worker for offline caching
- Emit background sync events

**Key Files:**
- `ui/components/` - React components
- `ui/pages/` - Page components
- `ui/hooks/` - Custom React hooks
- `ui/services/` - API client services
- `ui/sw.ts` - Service worker

#### 2. Booking API

**Technology:** Express, TypeScript

**Responsibilities:**
- Handle HTTP requests
- Validate request data
- Authenticate users (JWT)
- Enforce rate limiting
- Return HTTP responses

**Key Files:**
- `api/routes/booking-routes.ts` - Route definitions
- `api/controllers/booking-controller.ts` - Request handlers
- `api/middleware/` - Authentication, validation, rate limiting

#### 3. Booking Service

**Technology:** TypeScript

**Responsibilities:**
- Implement booking business logic
- Validate booking rules
- Calculate pricing
- Manage booking state machine
- Emit domain events

**Key Files:**
- `services/booking-service.ts` - Core business logic

**State Machine:**
```
pending → confirmed → checked_in → checked_out
   ↓
cancelled
```

#### 4. Event Publisher

**Technology:** TypeScript, NATS/Redis Streams

**Responsibilities:**
- Publish domain events to event bus
- Validate event schemas
- Ensure at-least-once delivery
- Version events

**Key Files:**
- `events/event-publisher.ts` - Event publishing logic
- `events/schemas/` - Event schema definitions

#### 5. Offline Sync Engine

**Technology:** TypeScript, IndexedDB, Background Sync API

**Responsibilities:**
- Queue offline bookings in IndexedDB
- Sync queued bookings when online
- Detect and resolve conflicts
- Implement exponential backoff retry

**Key Files:**
- `services/offline-sync-engine.ts` - Sync logic

**Sync Flow:**
```
1. User creates booking offline
2. Booking queued in IndexedDB
3. Background sync event registered
4. Network restored
5. Background sync triggered
6. Booking synced to server
7. Conflicts detected and resolved
8. User notified of sync status
```

#### 6. Payment Gateway Adapter

**Technology:** TypeScript, Axios

**Responsibilities:**
- Abstract payment gateway APIs
- Implement multi-gateway fallback
- Initialize payments
- Verify payment status
- Process refunds

**Key Files:**
- `adapters/payment-gateway-adapter.ts` - Adapter interface
- `adapters/paystack-adapter.ts` - Paystack implementation
- `adapters/flutterwave-adapter.ts` - Flutterwave implementation
- `adapters/interswitch-adapter.ts` - Interswitch implementation

**Fallback Strategy:**
```
1. Try primary gateway (Paystack)
2. If fails, try Flutterwave
3. If fails, try Interswitch
4. If all fail, return error
```

#### 7. Notification Service

**Technology:** TypeScript, Termii, SMTP

**Responsibilities:**
- Send booking confirmations via SMS
- Send booking confirmations via email
- Implement SMS-first with email fallback
- Generate notification templates

**Key Files:**
- `services/notification-service.ts` - Notification logic

**Notification Flow:**
```
1. Try SMS via Termii
2. If SMS fails, try email via SMTP
3. Log notification result
```

#### 8. Database Layer

**Technology:** Drizzle ORM, PostgreSQL

**Responsibilities:**
- Define database schema
- Manage database migrations
- Query and persist data
- Enforce data integrity

**Key Files:**
- `database/schema.ts` - Schema definitions
- `database/migrations/` - Migration files

**Database Tables:**
- `bookings` - Booking records
- `booking_rooms` - Booking-room relationships
- `guests` - Guest information
- `payments` - Payment records
- `booking_events` - Audit trail
- `offline_sync_queue` - Offline sync queue

---

## Data Flow

### Booking Creation Flow

```
1. User fills booking form
2. UI validates input
3. UI sends POST /api/v1/bookings
4. API validates request
5. API calls BookingService.createBooking()
6. Service validates business rules
7. Service checks room availability
8. Service creates guest record
9. Service calculates total amount
10. Service generates booking reference
11. Service saves booking to database
12. Service initializes payment via PaymentGatewayAdapter
13. PaymentGatewayAdapter calls Paystack API
14. Paystack returns payment URL
15. Service emits booking.created event
16. API returns booking ID and payment URL
17. UI redirects to payment URL
18. User completes payment
19. Paystack sends webhook callback
20. API verifies payment
21. Service updates booking status to confirmed
22. Service emits payment.completed event
23. NotificationService sends SMS confirmation
24. If SMS fails, NotificationService sends email
```

### Offline Booking Flow

```
1. User creates booking while offline
2. UI detects offline state
3. UI queues booking in IndexedDB
4. UI registers background sync event
5. UI shows offline indicator
6. Network restored
7. Background sync triggered
8. OfflineSyncEngine fetches queued bookings
9. OfflineSyncEngine syncs each booking
10. OfflineSyncEngine detects conflicts
11. If no conflicts, booking created on server
12. If conflicts, user notified with alternatives
13. OfflineSyncEngine emits booking.synced event
14. UI updates sync status
```

---

## Security Architecture

### Authentication

- **JWT Tokens:** All API endpoints require valid JWT token
- **Token Expiry:** Tokens expire after 15 minutes
- **Refresh Tokens:** Long-lived refresh tokens for token renewal

### Authorization

- **Tenant Isolation:** Users can only access data from their tenant
- **Permission Checks:** Operations validate user permissions

### Data Protection

- **Encryption at Rest:** AES-256 encryption for sensitive data
- **Encryption in Transit:** TLS 1.3 for all API requests
- **No Card Storage:** Card data tokenized by payment gateways (PCI DSS compliance)

### NDPR Compliance

- **Consent Collection:** NDPR consent checkbox required during booking
- **Data Access:** API endpoint for guests to access their data
- **Data Deletion:** Soft delete with `deletedAt` timestamp

---

## Performance Optimization

### Database Optimization

- **Indexes:** Composite indexes on frequently queried columns
- **Connection Pooling:** pg-pool with max 20 connections per instance
- **Query Optimization:** Use Drizzle ORM for efficient queries

### API Optimization

- **Rate Limiting:** 1000 requests per minute per tenant
- **Caching:** Redis for frequently accessed data
- **Compression:** Brotli compression for all text assets

### Frontend Optimization

- **Code Splitting:** React.lazy for route-level code splitting
- **Lazy Loading:** Load images and components on demand
- **Service Worker:** Cache assets for offline access
- **CDN:** Edge caching in Lagos and Abuja

---

## Monitoring and Observability

### Logging

- **Structured Logging:** JSON-formatted logs with correlation IDs
- **Log Levels:** ERROR, WARN, INFO, DEBUG
- **Log Aggregation:** Centralized log collection (e.g., ELK stack)

### Metrics

- **API Metrics:** Request count, response time, error rate
- **Database Metrics:** Query time, connection count
- **Payment Metrics:** Payment success rate, gateway availability

### Tracing

- **Distributed Tracing:** OpenTelemetry for request tracing
- **Correlation IDs:** Track requests across services

---

## Deployment Architecture

### Infrastructure

- **Cloud Provider:** AWS/Azure/GCP
- **Compute:** Kubernetes (EKS/AKS/GKE)
- **Database:** Managed PostgreSQL (RDS/Azure Database/Cloud SQL)
- **Cache:** Managed Redis (ElastiCache/Azure Cache/Memorystore)
- **Event Bus:** Managed NATS/Redis Streams

### Scaling Strategy

- **Horizontal Scaling:** Auto-scale API instances based on CPU/memory
- **Database Scaling:** Read replicas for read-heavy workloads
- **CDN:** Edge caching for static assets

### High Availability

- **Multi-AZ Deployment:** Deploy across multiple availability zones
- **Health Checks:** Kubernetes liveness and readiness probes
- **Automatic Failover:** Database automatic failover to standby

---

## Testing Strategy

### Unit Testing

- **Framework:** Jest
- **Coverage Target:** 100%
- **Mocking:** Mock all external dependencies

### Integration Testing

- **Framework:** Vitest
- **Coverage Target:** 80%
- **Environment:** Staging with real services

### End-to-End Testing

- **Framework:** Playwright
- **Coverage:** All user flows
- **Devices:** Desktop, mobile (iPhone SE, Samsung Galaxy A13)

### Performance Testing

- **Framework:** k6
- **Targets:** API response time < 200ms, page load < 3s on 3G

### Security Testing

- **Framework:** OWASP ZAP
- **Targets:** No critical vulnerabilities, PCI DSS compliance

---

## Future Enhancements

### Phase 2 (Weeks 26-30)

- **Advanced Search:** Filters by amenities, star rating, property type
- **Dynamic Pricing:** Rate optimization based on demand
- **Multi-Currency:** Support for USD, GBP, EUR
- **Multi-Language:** French, Swahili support

### Phase 3 (Weeks 31-35)

- **Loyalty Program:** Integration with Guest Management
- **Group Bookings:** Support for group reservations
- **Corporate Accounts:** B2B booking management
- **Reporting:** Analytics and business intelligence

---

## Conclusion

The Hospitality Booking Engine is a production-ready, enterprise-grade booking system that implements all WebWaka architectural invariants and compliance requirements. It provides a solid foundation for hospitality businesses to manage reservations efficiently while delivering an excellent user experience on African infrastructure.

---

**Document Status:** COMPLETE  
**Last Updated:** 2026-02-13  
**Author:** webwakaagent4 (Engineering)
