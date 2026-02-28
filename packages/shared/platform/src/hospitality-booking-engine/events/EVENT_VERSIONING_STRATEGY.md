# Event Versioning Strategy

**Module:** Hospitality Booking Engine  
**Author:** webwakaagent4  
**Date:** 2026-02-13

---

## Overview

This document defines the event versioning strategy for the Hospitality Booking Engine to ensure backward compatibility and smooth evolution of event schemas over time.

---

## Versioning Principles

### 1. Semantic Versioning

Event schemas follow semantic versioning (MAJOR.MINOR):

- **MAJOR version** - Incompatible changes (breaking changes)
- **MINOR version** - Backward-compatible additions

Example: `booking.created.v1`, `booking.created.v2`

### 2. Backward Compatibility

- **MINOR version changes** must be backward compatible
- Consumers must handle missing fields gracefully
- New optional fields can be added without version bump

### 3. Forward Compatibility

- Consumers must ignore unknown fields
- Producers should not rely on consumers understanding new fields immediately

---

## Event Schema Structure

All events follow this structure:

```json
{
  "eventId": "uuid",
  "eventType": "booking.created",
  "occurredAt": "ISO 8601 timestamp",
  "tenantId": "string",
  "metadata": {
    "version": "1.0",
    "source": "hospitality-booking-engine",
    "correlationId": "uuid"
  },
  "data": {
    // Event-specific data
  }
}
```

---

## Versioning Rules

### Rule 1: Adding Optional Fields (No Version Bump)

**Allowed:**
- Adding new optional fields to `data`
- Adding new fields to `metadata`

**Example:**
```json
// v1.0
{
  "data": {
    "bookingId": "123",
    "totalAmount": 100000
  }
}

// v1.0 (with new optional field)
{
  "data": {
    "bookingId": "123",
    "totalAmount": 100000,
    "currency": "NGN"  // New optional field
  }
}
```

### Rule 2: Removing Fields (MAJOR Version Bump)

**Breaking change - requires v2.0:**
- Removing any field
- Renaming any field
- Changing field type

**Example:**
```json
// v1.0
{
  "data": {
    "bookingId": "123",
    "guestName": "John Doe"
  }
}

// v2.0 (breaking change)
{
  "data": {
    "bookingId": "123",
    "guest": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Rule 3: Changing Field Semantics (MAJOR Version Bump)

**Breaking change - requires v2.0:**
- Changing the meaning of a field
- Changing field validation rules
- Changing field format

---

## Event Schema Registry

All event schemas are stored in `events/schemas/` directory:

```
events/schemas/
├── booking-created.v1.json
├── booking-modified.v1.json
├── booking-cancelled.v1.json
├── payment-completed.v1.json
└── booking-synced.v1.json
```

---

## Version Migration Strategy

### Publishing Multiple Versions

When introducing breaking changes, publish both versions for a transition period:

```typescript
// Publish v1 (deprecated)
await eventPublisher.publishBookingCreatedV1(data);

// Publish v2 (new)
await eventPublisher.publishBookingCreatedV2(data);
```

### Deprecation Timeline

1. **Week 0**: Announce v2, publish both v1 and v2
2. **Week 4**: Mark v1 as deprecated in documentation
3. **Week 8**: Stop publishing v1, only publish v2
4. **Week 12**: Remove v1 code

---

## Consumer Guidelines

### Handling Missing Fields

Consumers must handle missing optional fields:

```typescript
const currency = event.data.currency || 'NGN'; // Default value
```

### Ignoring Unknown Fields

Consumers must ignore unknown fields:

```typescript
// Don't throw errors for unknown fields
const { bookingId, totalAmount, ...rest } = event.data;
// Process known fields, ignore rest
```

### Version Detection

Consumers can detect version from metadata:

```typescript
const version = event.metadata.version;

if (version === '1.0') {
  // Handle v1
} else if (version === '2.0') {
  // Handle v2
} else {
  // Unknown version - log warning and skip
}
```

---

## Testing Strategy

### Version Compatibility Tests

Test that consumers can handle:
- Events with missing optional fields
- Events with extra unknown fields
- Events from different versions

### Schema Validation

Validate all events against JSON schemas:

```typescript
import Ajv from 'ajv';
import bookingCreatedV1Schema from './schemas/booking-created.v1.json';

const ajv = new Ajv();
const validate = ajv.compile(bookingCreatedV1Schema);

if (!validate(event)) {
  throw new Error('Event validation failed');
}
```

---

## Monitoring

### Version Metrics

Track event versions in monitoring:
- Count of v1 events published
- Count of v2 events published
- Count of v1 events consumed
- Count of v2 events consumed

### Deprecation Alerts

Alert when deprecated versions are still being consumed after deprecation period.

---

## Example: Adding New Event Type

When adding a new event type:

1. Create schema file: `events/schemas/booking-confirmed.v1.json`
2. Add event type to enum: `EventType.BOOKING_CONFIRMED`
3. Implement publisher method: `publishBookingConfirmed()`
4. Document event in API docs
5. Update consumers

---

## Conclusion

Following this versioning strategy ensures:
- ✅ Backward compatibility for consumers
- ✅ Smooth evolution of event schemas
- ✅ Clear communication of breaking changes
- ✅ Graceful deprecation of old versions

---

**Document Status:** COMPLETE  
**Last Updated:** 2026-02-13  
**Author:** webwakaagent4 (Engineering)
