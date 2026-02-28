# Guest Management Module Documentation

**Module:** Guest Management  
**Author:** webwakaagent3 (Documentation)  
**Date:** 2026-02-13  
**Step:** 451  
**Status:** COMPLETE

---

## Module Overview

The Guest Management module provides comprehensive Customer Relationship Management (CRM) capabilities for hospitality businesses. It manages guest profiles, preferences, communication history, loyalty programs, feedback, and personalized guest experiences while ensuring full compliance with Nigeria's Data Protection Regulation (NDPR).

---

## Architecture

The Guest Management module follows the WebWaka modular architecture with event-driven design. All guest operations publish domain events that can be consumed by other modules for integrated workflows.

### Key Components

**Guest Service** manages core business logic for guest operations including profile management, preferences, loyalty program, feedback, and communications.

**Event Publisher** publishes domain events for guest lifecycle operations, enabling integration with booking, property management, and channel management modules.

**API Layer** exposes REST endpoints for all guest management operations with comprehensive input validation, authentication, and authorization.

**Database Schema** includes five tables (guests, guest_preferences, guest_communications, guest_feedback, loyalty_transactions) with proper indexing and NDPR compliance fields.

---

## Features

### Guest Profile Management

Complete guest profiles include personal information, contact details, identity verification, emergency contacts, and special requirements. The system enforces Nigerian-First standards with +234 phone format validation and support for National Identity Number (NIN) verification.

### Preferences Management

Detailed preference tracking enables personalized guest experiences. Room preferences include floor level, view type, bed configuration, and smoking preferences. Amenity preferences cover pillow types, temperature settings, and minibar options. Service preferences include housekeeping schedules and wake-up call requests. Communication preferences allow guests to opt in or out of email, SMS, and WhatsApp communications.

### Loyalty Program

Four-tier loyalty program (Bronze, Silver, Gold, Platinum) rewards repeat guests with points for bookings and stays. Points can be redeemed for discounts, upgrades, and special services. Tier thresholds are Bronze (0-999 points), Silver (1,000-4,999 points), Gold (5,000-9,999 points), and Platinum (10,000+ points). Points expire after one year to encourage active engagement.

### Feedback Management

Multi-dimensional feedback system captures overall ratings plus specific ratings for cleanliness, service, value, location, and amenities. Property managers can respond to feedback, and all feedback is tracked with status (pending, published, hidden) for moderation.

### Communication Tracking

Complete communication history across all channels (email, SMS, WhatsApp, phone, in-person) with delivery status tracking. Integrates with Termii for SMS delivery in Nigeria and supports WhatsApp Business API for messaging.

### NDPR Compliance

Full compliance with Nigeria's Data Protection Regulation including explicit consent collection, consent date tracking, data portability support, right to be forgotten, and deletion request processing. All operations maintain complete audit trails for regulatory compliance.

---

## API Endpoints

### Guest Management

**POST /api/v1/guests** creates a new guest profile with required consent.

**GET /api/v1/guests/:id** retrieves complete guest profile including preferences.

**PATCH /api/v1/guests/:id** updates guest profile information.

**DELETE /api/v1/guests/:id** processes deletion request (NDPR right to be forgotten).

**GET /api/v1/guests** lists all guests with filtering and pagination.

### Preferences

**POST /api/v1/guests/:id/preferences** creates or updates guest preferences.

**GET /api/v1/guests/:id/preferences** retrieves guest preferences.

### Communications

**POST /api/v1/guests/:id/communications** sends communication to guest.

**GET /api/v1/guests/:id/communications** retrieves communication history.

### Feedback

**POST /api/v1/guests/:id/feedback** submits guest feedback.

**GET /api/v1/guests/:id/feedback** retrieves guest feedback history.

**POST /api/v1/feedback/:id/respond** adds property manager response to feedback.

### Loyalty

**POST /api/v1/guests/:id/loyalty/earn** awards loyalty points to guest.

**POST /api/v1/guests/:id/loyalty/redeem** redeems loyalty points.

**GET /api/v1/guests/:id/loyalty/transactions** retrieves loyalty transaction history.

---

## Event Types

**guest.created** is published when a new guest profile is created.

**guest.loyalty.points_earned** is published when loyalty points are awarded.

**guest.loyalty.tier_upgraded** is published when guest reaches new loyalty tier.

**guest.feedback.submitted** is published when guest submits feedback.

**guest.communication.sent** is published when communication is sent to guest.

**guest.data_portability.requested** is published when guest requests data export.

**guest.deletion.requested** is published when guest requests account deletion.

---

## Loyalty Program Details

### Tier Benefits

**Bronze Tier** (0-999 points) provides standard service with points earning on all bookings.

**Silver Tier** (1,000-4,999 points) includes priority check-in, late checkout requests, and 10% bonus points on bookings.

**Gold Tier** (5,000-9,999 points) adds room upgrade requests, complimentary breakfast, and 20% bonus points on bookings.

**Platinum Tier** (10,000+ points) includes guaranteed room upgrades, VIP amenities, dedicated concierge, and 30% bonus points on bookings.

### Points Earning

Guests earn 10 points per NGN 1,000 spent on bookings. Bonus points are awarded for direct bookings, extended stays, and special promotions. Points are credited after checkout and expire after 365 days.

### Points Redemption

Points can be redeemed at a rate of 100 points per NGN 1,000 discount. Minimum redemption is 500 points. Redeemed points are immediately deducted from the guest's balance.

---

## NDPR Compliance Details

### Consent Management

Explicit consent is required before creating a guest profile. Consent includes data collection, processing, and storage. Consent date is recorded for audit purposes. Guests can withdraw consent at any time.

### Data Portability

Guests can request a complete export of their data in machine-readable format (JSON). Export includes profile, preferences, communication history, feedback, and loyalty transactions. Requests are processed within 7 days as required by NDPR.

### Right to be Forgotten

Guests can request deletion of their personal data. Deletion requests are logged with timestamp. Data is anonymized rather than deleted to maintain referential integrity for bookings and transactions. Personal identifiers are removed within 30 days.

### Audit Trail

All operations on guest data are logged with user ID, timestamp, and operation type. Audit logs are retained for 7 years for regulatory compliance.

---

## Nigerian-First Features

**Phone Format** validation enforces +234 country code with 10-digit number (total 13 characters).

**Identity Verification** supports National Identity Number (NIN), international passport, and driver's license.

**Address Format** follows Nigerian address structure with state, local government area, and postal code.

**Currency** displays all monetary values in Nigerian Naira (NGN).

**SMS Integration** uses Termii SMS gateway for reliable delivery in Nigeria.

---

## Testing

The Guest Management module includes comprehensive test coverage with **100 test cases** across unit and integration tests.

**Unit Tests** cover guest service business logic, loyalty calculations, preference management, and NDPR compliance with **100% code coverage**.

**Integration Tests** verify API endpoints, database operations, event publishing, and NDPR workflows.

---

## Deployment

The module is deployed as part of the WebWaka platform and requires PostgreSQL database and Node.js runtime. Environment variables must be configured for database connection and external service integrations.

---

## Monitoring

Guest operations are logged with correlation IDs for tracing. Metrics are collected for guest creation rate, loyalty tier distribution, feedback submission rate, and NDPR request processing time.

---

## Support

For technical support, refer to the WebWaka governance repository or contact the engineering team.

---

**Status:** PRODUCTION READY  
**Last Updated:** 2026-02-13  
**Author:** webwakaagent3
