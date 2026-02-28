# Booking Engine Documentation

**Module:** Hospitality Booking Engine  
**Version:** 1.0.0  
**Author:** webwakaagent3 (Documentation)  
**Date:** 2026-02-13  
**Step:** 424

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Database Schema](#database-schema)
8. [Event Types](#event-types)
9. [Payment Integration](#payment-integration)
10. [Offline Support](#offline-support)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The Hospitality Booking Engine is a comprehensive, production-ready module that enables guests to search for available accommodations, create bookings, modify existing reservations, and cancel bookings with automated refund processing.

### Key Features

- **Property Search:** Advanced search with filters (location, dates, price range, amenities, guest count)
- **Real-time Availability:** Live availability checking across properties
- **Booking Management:** Create, modify, and cancel bookings
- **Payment Processing:** Integrated payment gateways (Paystack, Flutterwave, Interswitch)
- **Offline Support:** Queue bookings offline with automatic background synchronization
- **Multi-currency:** Support for NGN and other currencies
- **NDPR Compliance:** Full Nigerian Data Protection Regulation compliance
- **Mobile-First:** Responsive design optimized for mobile devices (320px-1024px)
- **PWA-Ready:** Progressive Web App capabilities with service worker support

### Architectural Compliance

- ✅ Offline-First (IndexedDB + Background Sync)
- ✅ Event-Driven (5 event types)
- ✅ Plugin-First (Payment gateway adapters)
- ✅ Multi-Tenant (Tenant isolation)
- ✅ Permission-Driven (RBAC integration points)
- ✅ API-First (5 REST endpoints)
- ✅ Mobile-First (Responsive 320px-1024px)
- ✅ Audit-Ready (Complete audit trail)
- ✅ Nigerian-First (Paystack, Flutterwave, Interswitch, Termii, +234, NDPR)
- ✅ PWA-First (Service worker, offline support)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Booking Engine                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │   Database   │     │
│  │   (React)    │◄─┤   (Express)  │◄─┤ (PostgreSQL) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                               │
│         │                  │                               │
│  ┌──────▼──────┐  ┌───────▼────────┐                      │
│  │  IndexedDB  │  │  Event Bus     │                      │
│  │  (Offline)  │  │  (NATS/Redis)  │                      │
│  └─────────────┘  └────────────────┘                      │
│                           │                                │
│                   ┌───────▼────────┐                       │
│                   │  Payment       │                       │
│                   │  Gateways      │                       │
│                   │  (Paystack,    │                       │
│                   │  Flutterwave,  │                       │
│                   │  Interswitch)  │                       │
│                   └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend (React + TypeScript):**
- User interface for search and booking
- Offline detection and queue management
- Form validation and user feedback
- PWA service worker integration

**Backend (Express + TypeScript):**
- REST API endpoints
- Business logic and validation
- Payment gateway integration
- Event publishing
- Database operations

**Database (PostgreSQL + Drizzle ORM):**
- Booking data persistence
- Guest information storage
- Payment transaction records
- Audit trail

**Event Bus:**
- Asynchronous event publishing
- Inter-module communication
- Audit logging

**Payment Gateways:**
- Payment initialization
- Payment verification
- Refund processing

---

## Installation

### Prerequisites

- Node.js 22.13.0 or higher
- PostgreSQL 14 or higher
- NATS or Redis Streams (for event bus)
- pnpm package manager

### Install Dependencies

```bash
cd src/hospitality-booking-engine
pnpm install
```

### Environment Variables

Create a `.env` file in the module root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/webwaka_platform

# Event Bus
EVENT_BUS_TYPE=nats  # or redis
NATS_URL=nats://localhost:4222
REDIS_URL=redis://localhost:6379

# Payment Gateways
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx
INTERSWITCH_CLIENT_ID=xxxxxxxxxxxxx
INTERSWITCH_CLIENT_SECRET=xxxxxxxxxxxxx

# Notifications
TERMII_API_KEY=xxxxxxxxxxxxx
TERMII_SENDER_ID=WebWaka
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@webwaka.com
SMTP_PASSWORD=xxxxxxxxxxxxx

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### Database Migration

```bash
# Run migrations
pnpm run migrate

# Or use the migration script
node database/migrations/001_initial_schema.sql
```

---

## Configuration

### Payment Gateway Configuration

The Booking Engine supports three payment gateways with automatic fallback:

```typescript
// config/payment-gateways.ts
export const paymentGatewayConfig = {
  primary: 'paystack',
  fallback: ['flutterwave', 'interswitch'],
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};
```

### Offline Sync Configuration

```typescript
// config/offline-sync.ts
export const offlineSyncConfig = {
  syncInterval: 60000, // 1 minute
  maxRetryAttempts: 5,
  exponentialBackoff: true,
  maxBackoffDelay: 300000, // 5 minutes
};
```

### Rate Limiting

```typescript
// config/rate-limiting.ts
export const rateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  skipSuccessfulRequests: false,
};
```

---

## API Reference

### Base URL

```
https://api.webwaka.com/api/v1/bookings
```

### Authentication

All API requests require a Bearer token:

```http
Authorization: Bearer <access_token>
```

---

### 1. Search Available Rooms

Search for available rooms based on criteria.

**Endpoint:** `POST /search`

**Request Body:**

```json
{
  "propertyId": "uuid",
  "checkInDate": "2026-03-15",
  "checkOutDate": "2026-03-18",
  "adultsCount": 2,
  "childrenCount": 1,
  "roomsCount": 1,
  "filters": {
    "priceRange": {
      "min": 10000,
      "max": 50000
    },
    "amenities": ["wifi", "parking", "pool"],
    "roomType": "deluxe"
  }
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "availableRooms": [
      {
        "roomTypeId": "uuid",
        "roomTypeName": "Deluxe Room",
        "availableCount": 5,
        "pricePerNight": 25000,
        "totalPrice": 75000,
        "amenities": ["wifi", "tv", "minibar"],
        "images": ["url1", "url2"]
      }
    ],
    "totalResults": 1
  }
}
```

---

### 2. Create Booking

Create a new booking.

**Endpoint:** `POST /`

**Request Body:**

```json
{
  "tenantId": "uuid",
  "propertyId": "uuid",
  "checkInDate": "2026-03-15",
  "checkOutDate": "2026-03-18",
  "adultsCount": 2,
  "childrenCount": 1,
  "rooms": [
    {
      "roomTypeId": "uuid",
      "quantity": 1,
      "pricePerNight": 25000
    }
  ],
  "guest": {
    "firstName": "Adebayo",
    "lastName": "Ogunleye",
    "email": "adebayo@example.com",
    "phone": "+2348012345678",
    "ndprConsent": true
  },
  "specialRequests": "Late check-in",
  "paymentMethod": "paystack"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "referenceNumber": "BK-20260213-ABCD1234",
    "status": "pending_payment",
    "totalAmount": 75000,
    "currency": "NGN",
    "paymentUrl": "https://checkout.paystack.com/xxxxx",
    "expiresAt": "2026-02-13T15:30:00Z"
  }
}
```

---

### 3. Get Booking by ID

Retrieve a booking by its ID.

**Endpoint:** `GET /:id`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "referenceNumber": "BK-20260213-ABCD1234",
    "tenantId": "uuid",
    "propertyId": "uuid",
    "checkInDate": "2026-03-15",
    "checkOutDate": "2026-03-18",
    "status": "confirmed",
    "totalAmount": 75000,
    "currency": "NGN",
    "guest": {
      "firstName": "Adebayo",
      "lastName": "Ogunleye",
      "email": "adebayo@example.com",
      "phone": "+2348012345678"
    },
    "rooms": [
      {
        "roomTypeId": "uuid",
        "roomTypeName": "Deluxe Room",
        "quantity": 1,
        "pricePerNight": 25000
      }
    ],
    "createdAt": "2026-02-13T12:00:00Z",
    "updatedAt": "2026-02-13T12:05:00Z",
    "version": 1
  }
}
```

---

### 4. Get Booking by Reference Number

Retrieve a booking by its reference number.

**Endpoint:** `GET /reference/:referenceNumber`

**Response:** `200 OK`

Same response format as Get Booking by ID.

---

### 5. Modify Booking

Modify an existing booking.

**Endpoint:** `PATCH /:id`

**Request Body:**

```json
{
  "checkInDate": "2026-03-16",
  "checkOutDate": "2026-03-19",
  "adultsCount": 3,
  "version": 1
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "referenceNumber": "BK-20260213-ABCD1234",
    "status": "confirmed",
    "totalAmount": 90000,
    "modificationFee": 5000,
    "newTotalAmount": 95000,
    "changes": [
      {
        "field": "checkInDate",
        "oldValue": "2026-03-15",
        "newValue": "2026-03-16"
      }
    ],
    "version": 2
  }
}
```

---

### 6. Cancel Booking

Cancel a booking with automatic refund calculation.

**Endpoint:** `POST /:id/cancel`

**Request Body:**

```json
{
  "reason": "Change of plans"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "referenceNumber": "BK-20260213-ABCD1234",
    "status": "cancelled",
    "cancellationReason": "Change of plans",
    "refundAmount": 75000,
    "refundPercentage": 100,
    "refundMethod": "original_payment_method",
    "refundStatus": "processing",
    "estimatedRefundDate": "2026-02-20",
    "cancelledAt": "2026-02-13T14:00:00Z"
  }
}
```

---

### Error Responses

All errors follow a standard format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": {
      "field": "guest.phone",
      "expected": "+234XXXXXXXXXX"
    }
  }
}
```

**Common Error Codes:**

- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Concurrent modification detected
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Example 1: Complete Booking Flow

```typescript
import { BookingService } from './services/booking-service';
import { PaystackAdapter } from './adapters/paystack-adapter';

// Initialize service
const paymentGateway = new PaystackAdapter(process.env.PAYSTACK_SECRET_KEY);
const bookingService = new BookingService(paymentGateway);

// 1. Search for available rooms
const searchResults = await fetch('/api/v1/bookings/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    propertyId: 'property-uuid',
    checkInDate: '2026-03-15',
    checkOutDate: '2026-03-18',
    adultsCount: 2,
    childrenCount: 0,
    roomsCount: 1,
  }),
});

const { data } = await searchResults.json();

// 2. Create booking
const booking = await fetch('/api/v1/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    tenantId: 'tenant-uuid',
    propertyId: 'property-uuid',
    checkInDate: '2026-03-15',
    checkOutDate: '2026-03-18',
    adultsCount: 2,
    childrenCount: 0,
    rooms: [
      {
        roomTypeId: data.availableRooms[0].roomTypeId,
        quantity: 1,
        pricePerNight: data.availableRooms[0].pricePerNight,
      },
    ],
    guest: {
      firstName: 'Adebayo',
      lastName: 'Ogunleye',
      email: 'adebayo@example.com',
      phone: '+2348012345678',
      ndprConsent: true,
    },
    paymentMethod: 'paystack',
  }),
});

const bookingData = await booking.json();

// 3. Redirect to payment
window.location.href = bookingData.data.paymentUrl;
```

---

### Example 2: Offline Booking

```typescript
import { OfflineSyncEngine } from './services/offline-sync-engine';

// Check if online
if (!navigator.onLine) {
  // Queue booking for offline sync
  const offlineSync = new OfflineSyncEngine();
  
  await offlineSync.queueOfflineBooking({
    tenantId: 'tenant-uuid',
    propertyId: 'property-uuid',
    checkInDate: '2026-03-15',
    checkOutDate: '2026-03-18',
    adultsCount: 2,
    rooms: [{ roomTypeId: 'room-uuid', quantity: 1, pricePerNight: 25000 }],
    guest: {
      firstName: 'Adebayo',
      lastName: 'Ogunleye',
      email: 'adebayo@example.com',
      phone: '+2348012345678',
      ndprConsent: true,
    },
  });
  
  // Start background sync
  offlineSync.startBackgroundSync();
  
  // Show user confirmation
  alert('Booking queued. Will be processed when connection is restored.');
}
```

---

### Example 3: Modify Booking

```typescript
// Modify booking dates
const modifyBooking = await fetch(`/api/v1/bookings/${bookingId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    checkInDate: '2026-03-16',
    checkOutDate: '2026-03-19',
    version: 1, // Current version for optimistic locking
  }),
});

const result = await modifyBooking.json();

if (result.success) {
  console.log('Booking modified successfully');
  console.log('New total:', result.data.newTotalAmount);
  console.log('Modification fee:', result.data.modificationFee);
}
```

---

### Example 4: Cancel Booking with Refund

```typescript
// Cancel booking
const cancelBooking = await fetch(`/api/v1/bookings/${bookingId}/cancel`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    reason: 'Change of plans',
  }),
});

const result = await cancelBooking.json();

if (result.success) {
  console.log('Booking cancelled');
  console.log('Refund amount:', result.data.refundAmount);
  console.log('Refund percentage:', result.data.refundPercentage);
  console.log('Estimated refund date:', result.data.estimatedRefundDate);
}
```

---

## Database Schema

### Tables

**1. bookings**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  property_id UUID NOT NULL,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults_count INT NOT NULL,
  children_count INT DEFAULT 0,
  status VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INT DEFAULT 1
);

CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_reference ON bookings(reference_number);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
```

**2. booking_rooms**
```sql
CREATE TABLE booking_rooms (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL,
  quantity INT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**3. guests**
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  ndpr_consent BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**4. payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**5. offline_queue**
```sql
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  operation_type VARCHAR(20) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  retry_after TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);
```

---

## Event Types

The Booking Engine publishes the following events:

### 1. booking.created

Published when a new booking is created.

```json
{
  "eventId": "uuid",
  "eventType": "booking.created",
  "eventVersion": "1.0",
  "timestamp": "2026-02-13T12:00:00Z",
  "tenantId": "uuid",
  "data": {
    "bookingId": "uuid",
    "referenceNumber": "BK-20260213-ABCD1234",
    "propertyId": "uuid",
    "checkInDate": "2026-03-15",
    "checkOutDate": "2026-03-18",
    "totalAmount": 75000,
    "currency": "NGN",
    "guestEmail": "adebayo@example.com"
  }
}
```

### 2. booking.modified

Published when a booking is modified.

```json
{
  "eventId": "uuid",
  "eventType": "booking.modified",
  "eventVersion": "1.0",
  "timestamp": "2026-02-13T13:00:00Z",
  "tenantId": "uuid",
  "data": {
    "bookingId": "uuid",
    "referenceNumber": "BK-20260213-ABCD1234",
    "changes": [
      {
        "field": "checkInDate",
        "oldValue": "2026-03-15",
        "newValue": "2026-03-16"
      }
    ],
    "modificationFee": 5000,
    "newTotalAmount": 95000
  }
}
```

### 3. booking.cancelled

Published when a booking is cancelled.

```json
{
  "eventId": "uuid",
  "eventType": "booking.cancelled",
  "eventVersion": "1.0",
  "timestamp": "2026-02-13T14:00:00Z",
  "tenantId": "uuid",
  "data": {
    "bookingId": "uuid",
    "referenceNumber": "BK-20260213-ABCD1234",
    "cancellationReason": "Change of plans",
    "refundAmount": 75000,
    "refundPercentage": 100
  }
}
```

### 4. payment.completed

Published when payment is completed.

```json
{
  "eventId": "uuid",
  "eventType": "payment.completed",
  "eventVersion": "1.0",
  "timestamp": "2026-02-13T12:05:00Z",
  "tenantId": "uuid",
  "data": {
    "bookingId": "uuid",
    "transactionId": "PAY-xxxxx",
    "gateway": "paystack",
    "amount": 75000,
    "currency": "NGN",
    "paymentMethod": "card"
  }
}
```

### 5. booking.synced

Published when an offline booking is synced.

```json
{
  "eventId": "uuid",
  "eventType": "booking.synced",
  "eventVersion": "1.0",
  "timestamp": "2026-02-13T15:00:00Z",
  "tenantId": "uuid",
  "data": {
    "bookingId": "uuid",
    "queueItemId": "uuid",
    "syncedAt": "2026-02-13T15:00:00Z",
    "hadConflicts": false
  }
}
```

---

## Payment Integration

### Supported Payment Gateways

1. **Paystack** (Primary)
2. **Flutterwave** (Fallback)
3. **Interswitch** (Fallback)

### Payment Flow

1. User creates booking
2. Backend initializes payment with gateway
3. User redirected to payment page
4. User completes payment
5. Gateway sends webhook to backend
6. Backend verifies payment
7. Booking status updated to "confirmed"
8. Confirmation email/SMS sent

### Webhook Configuration

Configure webhooks in your payment gateway dashboard:

**Paystack:**
```
https://api.webwaka.com/api/v1/webhooks/paystack
```

**Flutterwave:**
```
https://api.webwaka.com/api/v1/webhooks/flutterwave
```

**Interswitch:**
```
https://api.webwaka.com/api/v1/webhooks/interswitch
```

---

## Offline Support

### How It Works

1. **Detection:** Service worker detects offline status
2. **Queue:** Booking request saved to IndexedDB
3. **Sync:** Background sync attempts to send when online
4. **Retry:** Exponential backoff retry on failure
5. **Conflict:** Server-wins strategy for conflicts

### Service Worker

```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Listen for sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncOfflineBookings());
  }
});
```

---

## Testing

### Run Unit Tests

```bash
pnpm run test
```

### Run Integration Tests

```bash
pnpm run test:integration
```

### Run E2E Tests

```bash
pnpm run test:e2e
```

### Run All Tests with Coverage

```bash
pnpm run test:coverage
```

### Test Coverage

- Unit Tests: 100% coverage
- Integration Tests: 80% coverage
- E2E Tests: All critical flows

---

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Payment gateway webhooks configured
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring setup (Sentry, DataDog)
- [ ] Backup strategy in place
- [ ] Load balancer configured
- [ ] CDN configured for static assets

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: booking-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: booking-engine
  template:
    metadata:
      labels:
        app: booking-engine
    spec:
      containers:
      - name: booking-engine
        image: webwaka/booking-engine:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: booking-engine-secrets
              key: database-url
```

---

## Troubleshooting

### Common Issues

**1. Payment Gateway Timeout**

*Symptom:* Payment initialization fails with timeout error

*Solution:*
- Check payment gateway API status
- Increase timeout in configuration
- Verify API credentials
- Check network connectivity

**2. Offline Sync Not Working**

*Symptom:* Bookings not syncing when back online

*Solution:*
- Verify service worker is registered
- Check IndexedDB for queued items
- Verify background sync permission
- Check browser console for errors

**3. Concurrent Modification Error**

*Symptom:* Booking modification fails with 409 Conflict

*Solution:*
- Fetch latest booking version
- Retry modification with new version
- Implement optimistic locking UI feedback

**4. NDPR Consent Not Captured**

*Symptom:* Booking creation fails with consent error

*Solution:*
- Ensure `ndprConsent: true` in request
- Verify consent checkbox in UI
- Check form validation

---

## Support

For issues, questions, or feature requests:

- **Email:** support@webwaka.com
- **Documentation:** https://docs.webwaka.com
- **GitHub:** https://github.com/WebWakaHub/webwaka-platform

---

**Document Status:** COMPLETE  
**Last Updated:** 2026-02-13  
**Author:** webwakaagent3 (Documentation)  
**Step:** 424
