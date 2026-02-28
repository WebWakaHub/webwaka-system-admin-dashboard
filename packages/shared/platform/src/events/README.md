# Event Management Module

**Module:** Church Suite Module 3 - Event Management  
**Author:** webwakaagent4 (Engineering & Delivery)  
**Date:** 2026-02-13  
**Version:** 1.0

---

## Overview

The Event Management module provides comprehensive event and attendance management for churches, including event creation, registration, QR code-based check-in, and analytics.

---

## Features

### Core Features
- **Event Creation & Management** - Create and manage church events (services, conferences, retreats, workshops)
- **Event Registration** - Member registration with capacity management and waitlist
- **QR Code Check-In** - Fast, contactless attendance tracking
- **Attendance Analytics** - Real-time attendance statistics and reporting
- **Recurring Events** - Support for daily, weekly, monthly, yearly events
- **Volunteer Management** - Assign and track event volunteers
- **Multi-Tenant** - Complete church-level data isolation

### Event Types
- Services (Sunday service, midweek service)
- Conferences
- Retreats
- Workshops
- Meetings
- Social events
- Outreach programs

---

## Architecture

### Models (4)

1. **Event** - Core event entity
   - Event details (name, description, type, dates, location)
   - Capacity management
   - Recurring event support
   - Status tracking (draft, published, cancelled, completed)

2. **Registration** - Event registration entity
   - Member registration tracking
   - QR code generation
   - Payment status (for paid events)
   - Waitlist support

3. **Attendance** - Attendance tracking entity
   - Check-in time tracking
   - Check-in method (QR code, manual, self check-in, mobile app)
   - QR code validation

4. **EventVolunteer** - Volunteer assignment entity
   - Role assignment (usher, greeter, tech, worship, etc.)
   - Status tracking (invited, confirmed, declined, completed)

### Services (3)

1. **EventService** - Event management business logic
2. **RegistrationService** - Registration and ticketing logic
3. **AttendanceService** - Check-in and attendance tracking logic

### Controllers (3)

1. **EventController** - Event REST API endpoints
2. **RegistrationController** - Registration REST API endpoints
3. **AttendanceController** - Attendance REST API endpoints

---

## API Endpoints

### Events

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/events` | Create event | Required |
| GET | `/api/v1/events/:id` | Get event by ID | Required |
| GET | `/api/v1/events` | List events | Required |
| POST | `/api/v1/events/:id/publish` | Publish event | Admin |
| POST | `/api/v1/events/:id/cancel` | Cancel event | Admin |
| GET | `/api/v1/events/upcoming` | Get upcoming events | Required |

### Registrations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/registrations` | Register for event | Required |
| POST | `/api/v1/registrations/:id/cancel` | Cancel registration | Required |
| GET | `/api/v1/registrations/qr/:qrCode` | Get by QR code | Required |
| GET | `/api/v1/events/:eventId/registrations` | Get event registrations | Admin |
| GET | `/api/v1/members/:memberId/registrations` | Get member registrations | Required |

### Attendance

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/attendance/check-in` | Check in to event | Required |
| GET | `/api/v1/events/:eventId/attendance` | Get event attendance | Admin |
| GET | `/api/v1/members/:memberId/attendance` | Get member attendance | Required |
| GET | `/api/v1/events/:eventId/attendance/stats` | Get attendance stats | Admin |

---

## Event-Driven Architecture

### Published Events

1. **event.created** - New event created
2. **event.published** - Event published to members
3. **event.cancelled** - Event cancelled
4. **member.registered** - Member registered for event
5. **registration.cancelled** - Registration cancelled
6. **member.checked_in** - Member checked in to event
7. **event.capacity_reached** - Event reached capacity

All events are CloudEvents 1.0 compliant.

---

## QR Code System

### QR Code Format
```
EVT-{eventId}-{memberId}-{random}-{timestamp}
Example: EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000
```

### Features
- Unique QR code per registration
- Embedded event and member IDs
- Validation and extraction utilities
- Support for mobile scanning

---

## Usage Examples

### Create Event
```typescript
const event = await eventService.createEvent(churchId, userId, {
  name: 'Sunday Service',
  eventType: EventType.SERVICE,
  startDate: '2026-02-16T10:00:00Z',
  endDate: '2026-02-16T12:00:00Z',
  location: 'Main Sanctuary',
  capacity: 500,
  registrationRequired: false,
});
```

### Register for Event
```typescript
const { registration, qrCodeData } = await registrationService.registerForEvent(churchId, {
  eventId: 'event-123',
  memberId: 'member-456',
  ticketType: TicketType.FREE,
});
```

### Check In with QR Code
```typescript
const attendance = await attendanceService.checkIn(churchId, userId, {
  eventId: 'event-123',
  qrCode: 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000',
  checkInMethod: CheckInMethod.QR_CODE,
});
```

---

## Compliance

### Nigerian-First ✅
- Support for Nigerian event types (crusades, vigils, etc.)
- Local time zone support (WAT)
- SMS reminders via Nigerian providers

### Mobile-First ✅
- QR code scanning on mobile devices
- Self check-in capability
- Mobile-optimized registration forms

### PWA-First ✅
- Offline event viewing
- Cached QR codes
- Background sync for check-ins

---

## Dependencies

- TypeORM (database ORM)
- class-validator (DTO validation)
- Express (HTTP framework)
- uuid (ID generation)

---

## Future Enhancements

1. Email/SMS event reminders
2. Event calendar integration
3. Volunteer scheduling
4. Event feedback and surveys
5. Live streaming integration
6. Event photo gallery
7. Event merchandise sales

---

## Testing

Unit tests and integration tests are located in `__tests__/` directory.

Run tests:
```bash
npm test src/events
```

---

## License

Proprietary - WebWaka Platform
