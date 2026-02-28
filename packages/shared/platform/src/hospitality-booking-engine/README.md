# Hospitality Booking Engine

**Module ID:** Hospitality Suite - Module 1  
**Version:** 1.0.0  
**Status:** In Development  
**Author:** webwakaagent4 (Engineering)

---

## Overview

The Hospitality Booking Engine provides comprehensive reservation and booking management capabilities for hospitality businesses operating in Nigeria and across Africa. This module enables guests to search for available accommodations, make reservations, manage bookings, and process payments through Nigerian-first payment gateways.

## Key Features

- **Real-time Availability Search:** Fast, filtered search across properties and room types
- **Multi-Property Support:** Tenant-scoped multi-property booking management
- **Payment Gateway Integration:** Paystack, Flutterwave, and Interswitch support
- **Offline-First:** Background sync with conflict resolution
- **Event-Driven:** All booking state changes emit events
- **Mobile-First:** Responsive UI optimized for African devices (320px-1024px)
- **PWA Capabilities:** Installable, offline-capable progressive web app
- **NDPR Compliant:** Nigerian Data Protection Regulation compliance
- **Multi-Currency:** Nigerian Naira (₦) primary, multi-currency support

## Architecture

### Components

1. **Booking API** (`/api`) - Express REST API with JWT authentication
2. **Booking UI** (`/ui`) - React PWA with offline capabilities
3. **Booking Service** (`/services`) - Domain logic and state management
4. **Payment Gateway Adapters** (`/adapters`) - Paystack, Flutterwave, Interswitch
5. **Event Publisher** (`/events`) - Event emission and schema validation
6. **Offline Sync Engine** (`/services/offline-sync`) - Background sync with conflict resolution
7. **Database Schema** (`/database`) - Drizzle ORM with PostgreSQL
8. **Notification Service** (`/services/notification`) - SMS (Termii) and email

### Technology Stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, TypeScript, TailwindCSS, Vite
- **Database:** PostgreSQL with Drizzle ORM
- **Event Bus:** NATS / Redis Streams
- **Cache:** Redis
- **Payment Gateways:** Paystack, Flutterwave, Interswitch
- **SMS Gateway:** Termii
- **Email:** SMTP

## Directory Structure

```
hospitality-booking-engine/
├── api/                    # REST API endpoints
│   ├── routes/            # API route handlers
│   ├── middleware/        # Authentication, validation, rate limiting
│   └── controllers/       # Request/response handling
├── ui/                    # React PWA frontend
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API client services
│   └── sw.ts             # Service worker
├── services/              # Domain services
│   ├── booking-service.ts       # Booking business logic
│   ├── offline-sync-engine.ts  # Offline sync logic
│   └── notification-service.ts # SMS and email notifications
├── adapters/              # External service adapters
│   ├── payment-gateway-adapter.ts  # Payment gateway abstraction
│   ├── paystack-adapter.ts        # Paystack implementation
│   ├── flutterwave-adapter.ts     # Flutterwave implementation
│   └── interswitch-adapter.ts     # Interswitch implementation
├── events/                # Event definitions and publishers
│   ├── event-publisher.ts        # Event publishing logic
│   ├── event-subscriber.ts       # Event consumption logic
│   └── schemas/                  # Event schema definitions
├── database/              # Database schema and migrations
│   ├── schema.ts                 # Drizzle schema definitions
│   └── migrations/               # Database migrations
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── __tests__/            # Unit and integration tests
```

## API Endpoints

### Booking Management

- `POST /api/v1/bookings/search` - Search available rooms
- `POST /api/v1/bookings` - Create new booking
- `GET /api/v1/bookings/:id` - Get booking details
- `PATCH /api/v1/bookings/:id` - Modify booking
- `POST /api/v1/bookings/:id/cancel` - Cancel booking

### Payment Processing

- `POST /api/v1/payments/initialize` - Initialize payment
- `POST /api/v1/payments/webhook` - Payment gateway webhook
- `GET /api/v1/payments/:id` - Get payment status

## Events

### Published Events

- `booking.created` - Emitted when booking is created
- `booking.modified` - Emitted when booking is modified
- `booking.cancelled` - Emitted when booking is cancelled
- `payment.completed` - Emitted when payment is successful
- `booking.synced` - Emitted when offline booking is synced

### Consumed Events

- `property.availability.updated` - Updates room availability
- `payment.completed` - Confirms booking after payment

## Database Schema

### Tables

- `bookings` - Booking records
- `booking_rooms` - Booking-room relationships
- `guests` - Guest information
- `payments` - Payment records
- `booking_events` - Audit trail

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/webwaka

# Event Bus
NATS_URL=nats://localhost:4222

# Payment Gateways
PAYSTACK_SECRET_KEY=sk_test_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxx
INTERSWITCH_CLIENT_ID=xxx
INTERSWITCH_CLIENT_SECRET=xxx

# SMS Gateway
TERMII_API_KEY=xxx
TERMII_SENDER_ID=WebWaka

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@webwaka.com
SMTP_PASS=xxx

# JWT
JWT_SECRET=xxx
JWT_EXPIRY=15m

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60000
```

## Testing

### Unit Tests

```bash
npm run test:unit -- hospitality-booking-engine
```

### Integration Tests

```bash
npm run test:integration -- hospitality-booking-engine
```

### E2E Tests

```bash
npm run test:e2e -- hospitality-booking-engine
```

### Coverage

```bash
npm run test:coverage -- hospitality-booking-engine
```

Target: 100% code coverage

## Development

### Setup

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Build UI only
npm run build:ui

# Build API only
npm run build:api
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [User Guide](./USER_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

## Compliance

- **Nigerian-First:** Paystack, Flutterwave, Interswitch, Termii, +234 format, NDPR
- **Mobile-First:** Responsive 320px-1024px, touch-friendly, < 3s load on 3G
- **PWA-First:** Service worker, offline, installable, push notifications
- **Africa-First:** English, Hausa, Yoruba, Igbo, low-bandwidth, low-spec devices

## License

PROPRIETARY - All Rights Reserved

---

**Maintained by:** webwakaagent4 (Backend Engineering)  
**Organization:** WebWaka  
**Last Updated:** 2026-02-13
