# Booking Engine Test Strategy

**Module ID:** Hospitality Suite - Module 1  
**Module Name:** Booking Engine  
**Version:** 1.0  
**Date:** 2026-02-13  
**Status:** APPROVED  
**Author:** webwakaagent5 (Quality Assurance)  
**Related Documents:** BOOKING_ENGINE_SPECIFICATION.md, BOOKING_ENGINE_SPECIFICATION_REVIEW.md

---

## Executive Summary

This document defines the comprehensive test strategy for the Booking Engine module. The strategy ensures 100% code coverage, validates all functional and non-functional requirements, and confirms compliance with Nigerian-First, Mobile-First, PWA-First, and Africa-First standards. Testing will be conducted across five layers: unit testing, integration testing, end-to-end testing, performance testing, and security testing.

**Testing Objectives:**
- Achieve 100% unit test coverage
- Validate all 10 functional requirements
- Confirm all 5 non-functional requirements
- Validate offline-first functionality with background sync
- Confirm event-driven architecture with proper event emission
- Validate multi-gateway payment processing
- Confirm NDPR and PCI DSS compliance
- Validate mobile-first responsive design
- Confirm PWA capabilities (offline, installable, push notifications)
- Validate performance on 2G/3G networks and low-spec devices

**Test Environment:**
- **Development:** Local development environment with mocked external services
- **Staging:** Cloud-based staging environment with real external service integrations
- **Production:** Cloud-based production environment (post-deployment validation only)

---

## 1. Unit Testing Strategy

### 1.1 Scope

Unit testing covers all individual functions, methods, and components in isolation. External dependencies are mocked to ensure tests are fast, deterministic, and focused on single units of functionality.

**Coverage Target:** 100%

**Test Framework:** Jest (backend), Vitest (frontend)

**Mocking Strategy:** Mock all external dependencies (database, event bus, payment gateways, SMS gateway, email service)

### 1.2 Unit Test Cases

#### 1.2.1 Booking Service Unit Tests

**Test Suite:** `booking-service.test.ts`

**Test Cases:**

1. **TC-U-001: Create Booking - Valid Input**
   - **Description:** Test booking creation with valid input data
   - **Input:** Valid booking data (property, dates, rooms, guest info)
   - **Expected:** Booking created successfully, returns booking ID and reference
   - **Assertions:** Booking entity created, `booking.created` event emitted, database write called

2. **TC-U-002: Create Booking - Invalid Date Range**
   - **Description:** Test booking creation with check-out date before check-in date
   - **Input:** Invalid date range (check-out < check-in)
   - **Expected:** Validation error thrown
   - **Assertions:** Error code `INVALID_DATE_RANGE`, no database write, no event emitted

3. **TC-U-003: Create Booking - Room Not Available**
   - **Description:** Test booking creation when room is not available
   - **Input:** Valid booking data but room already booked
   - **Expected:** Availability error thrown
   - **Assertions:** Error code `ROOM_NOT_AVAILABLE`, no database write, no event emitted

4. **TC-U-004: Modify Booking - Valid Modification**
   - **Description:** Test booking modification with valid changes
   - **Input:** Valid booking ID and modification data (new dates)
   - **Expected:** Booking modified successfully, returns updated booking
   - **Assertions:** Booking entity updated, `booking.modified` event emitted, database write called

5. **TC-U-005: Modify Booking - Optimistic Lock Conflict**
   - **Description:** Test booking modification with concurrent update (version mismatch)
   - **Input:** Valid booking ID but outdated version number
   - **Expected:** Concurrency error thrown
   - **Assertions:** Error code `CONCURRENT_MODIFICATION`, no database write, no event emitted

6. **TC-U-006: Cancel Booking - Valid Cancellation**
   - **Description:** Test booking cancellation with valid booking ID
   - **Input:** Valid booking ID and cancellation reason
   - **Expected:** Booking cancelled successfully, refund amount calculated
   - **Assertions:** Booking status updated to `cancelled`, `booking.cancelled` event emitted, refund amount correct

7. **TC-U-007: Cancel Booking - Cancellation Not Allowed**
   - **Description:** Test booking cancellation outside cancellation policy window
   - **Input:** Valid booking ID but within 24 hours of check-in
   - **Expected:** Policy error thrown
   - **Assertions:** Error code `CANCELLATION_NOT_ALLOWED`, no database write, no event emitted

8. **TC-U-008: Calculate Total Price - Single Room**
   - **Description:** Test price calculation for single room booking
   - **Input:** Room type, rate plan, date range (4 nights)
   - **Expected:** Correct total price calculated (price per night × nights)
   - **Assertions:** Total price = 25000 × 4 = 100000 NGN

9. **TC-U-009: Calculate Total Price - Multiple Rooms**
   - **Description:** Test price calculation for multiple room booking
   - **Input:** 2 rooms, same rate plan, date range (4 nights)
   - **Expected:** Correct total price calculated (price per night × nights × quantity)
   - **Assertions:** Total price = 25000 × 4 × 2 = 200000 NGN

10. **TC-U-010: Calculate Refund Amount - Full Refund**
    - **Description:** Test refund calculation for cancellation with full refund policy
    - **Input:** Booking with full refund policy, cancellation > 24 hours before check-in
    - **Expected:** Full refund amount returned
    - **Assertions:** Refund amount = total amount (100000 NGN)

#### 1.2.2 Guest Validation Unit Tests

**Test Suite:** `guest-validation.test.ts`

**Test Cases:**

1. **TC-U-011: Validate Phone Number - Valid Nigerian Format**
   - **Description:** Test phone number validation with valid +234 format
   - **Input:** `+2348012345678`
   - **Expected:** Validation passes
   - **Assertions:** No validation error

2. **TC-U-012: Validate Phone Number - Invalid Format**
   - **Description:** Test phone number validation with invalid format
   - **Input:** `08012345678` (missing +234 prefix)
   - **Expected:** Validation error thrown
   - **Assertions:** Error code `INVALID_PHONE_FORMAT`

3. **TC-U-013: Validate Email - Valid Format**
   - **Description:** Test email validation with valid email format
   - **Input:** `chinedu.okafor@example.com`
   - **Expected:** Validation passes
   - **Assertions:** No validation error

4. **TC-U-014: Validate Email - Invalid Format**
   - **Description:** Test email validation with invalid email format
   - **Input:** `invalid-email`
   - **Expected:** Validation error thrown
   - **Assertions:** Error code `INVALID_EMAIL_FORMAT`

5. **TC-U-015: Validate NDPR Consent - Consent Given**
   - **Description:** Test NDPR consent validation when consent is given
   - **Input:** `ndprConsent: true`
   - **Expected:** Validation passes
   - **Assertions:** No validation error

6. **TC-U-016: Validate NDPR Consent - Consent Not Given**
   - **Description:** Test NDPR consent validation when consent is not given
   - **Input:** `ndprConsent: false`
   - **Expected:** Validation error thrown
   - **Assertions:** Error code `NDPR_CONSENT_REQUIRED`

#### 1.2.3 Payment Gateway Adapter Unit Tests

**Test Suite:** `payment-gateway-adapter.test.ts`

**Test Cases:**

1. **TC-U-017: Initialize Payment - Paystack**
   - **Description:** Test payment initialization with Paystack gateway
   - **Input:** Booking ID, amount (100000 NGN), gateway (`paystack`)
   - **Expected:** Payment URL returned from Paystack
   - **Assertions:** Paystack API called with correct parameters, payment URL returned

2. **TC-U-018: Initialize Payment - Flutterwave**
   - **Description:** Test payment initialization with Flutterwave gateway
   - **Input:** Booking ID, amount (100000 NGN), gateway (`flutterwave`)
   - **Expected:** Payment URL returned from Flutterwave
   - **Assertions:** Flutterwave API called with correct parameters, payment URL returned

3. **TC-U-019: Initialize Payment - Interswitch**
   - **Description:** Test payment initialization with Interswitch gateway
   - **Input:** Booking ID, amount (100000 NGN), gateway (`interswitch`)
   - **Expected:** Payment URL returned from Interswitch
   - **Assertions:** Interswitch API called with correct parameters, payment URL returned

4. **TC-U-020: Verify Payment - Successful Payment**
   - **Description:** Test payment verification with successful payment callback
   - **Input:** Payment reference, gateway (`paystack`), status (`success`)
   - **Expected:** Payment verified successfully, `payment.completed` event emitted
   - **Assertions:** Payment status updated to `completed`, event emitted

5. **TC-U-021: Verify Payment - Failed Payment**
   - **Description:** Test payment verification with failed payment callback
   - **Input:** Payment reference, gateway (`paystack`), status (`failed`)
   - **Expected:** Payment verification fails, `payment.failed` event emitted
   - **Assertions:** Payment status updated to `failed`, event emitted

6. **TC-U-022: Process Refund - Successful Refund**
   - **Description:** Test refund processing with successful refund
   - **Input:** Payment ID, refund amount (100000 NGN), gateway (`paystack`)
   - **Expected:** Refund processed successfully
   - **Assertions:** Gateway refund API called, refund status updated

7. **TC-U-023: Gateway Fallback - Primary Fails**
   - **Description:** Test gateway fallback when primary gateway (Paystack) fails
   - **Input:** Booking ID, amount, primary gateway fails
   - **Expected:** Fallback to secondary gateway (Flutterwave)
   - **Assertions:** Paystack API called and failed, Flutterwave API called and succeeded

#### 1.2.4 Offline Sync Engine Unit Tests

**Test Suite:** `offline-sync-engine.test.ts`

**Test Cases:**

1. **TC-U-024: Queue Offline Booking - Valid Booking**
   - **Description:** Test queuing booking when offline
   - **Input:** Valid booking data, network offline
   - **Expected:** Booking queued in IndexedDB
   - **Assertions:** Booking stored in IndexedDB with status `pending_sync`

2. **TC-U-025: Sync Queued Booking - Network Restored**
   - **Description:** Test syncing queued booking when network is restored
   - **Input:** Queued booking in IndexedDB, network online
   - **Expected:** Booking synced to server, `booking.synced` event emitted
   - **Assertions:** API called with booking data, IndexedDB entry updated to `synced`

3. **TC-U-026: Resolve Sync Conflict - Server Wins**
   - **Description:** Test conflict resolution when server has newer data
   - **Input:** Queued booking conflicts with server booking
   - **Expected:** Server data wins, local booking discarded
   - **Assertions:** Local booking marked as `conflict`, user notified

4. **TC-U-027: Retry Failed Sync - Exponential Backoff**
   - **Description:** Test retry logic for failed sync with exponential backoff
   - **Input:** Queued booking, sync fails (network error)
   - **Expected:** Sync retried with exponential backoff (1s, 2s, 4s, 8s)
   - **Assertions:** Retry attempts logged, backoff intervals correct

#### 1.2.5 Event Publisher Unit Tests

**Test Suite:** `event-publisher.test.ts`

**Test Cases:**

1. **TC-U-028: Publish Event - booking.created**
   - **Description:** Test publishing `booking.created` event
   - **Input:** Booking entity
   - **Expected:** Event published to event bus
   - **Assertions:** Event payload correct, event type `booking.created`, event published

2. **TC-U-029: Publish Event - booking.modified**
   - **Description:** Test publishing `booking.modified` event
   - **Input:** Booking entity with changes
   - **Expected:** Event published to event bus with change tracking
   - **Assertions:** Event payload includes old and new values, event type `booking.modified`

3. **TC-U-030: Publish Event - Schema Validation Fails**
   - **Description:** Test event publishing with invalid event schema
   - **Input:** Invalid event payload (missing required field)
   - **Expected:** Schema validation error thrown
   - **Assertions:** Event not published, error logged

#### 1.2.6 React Component Unit Tests

**Test Suite:** `booking-ui.test.tsx`

**Test Cases:**

1. **TC-U-031: Search Form - Render**
   - **Description:** Test search form renders correctly
   - **Input:** None
   - **Expected:** Search form displayed with all fields
   - **Assertions:** Check-in date field, check-out date field, guests field, location field visible

2. **TC-U-032: Search Form - Submit Valid Search**
   - **Description:** Test search form submission with valid input
   - **Input:** Valid search parameters
   - **Expected:** Search API called with correct parameters
   - **Assertions:** API called, loading state displayed, results rendered

3. **TC-U-033: Booking Form - Render**
   - **Description:** Test booking form renders correctly
   - **Input:** Selected room data
   - **Expected:** Booking form displayed with guest information fields
   - **Assertions:** First name, last name, email, phone, NDPR consent fields visible

4. **TC-U-034: Booking Form - Phone Number Auto-Format**
   - **Description:** Test phone number auto-formatting to +234 format
   - **Input:** User types `08012345678`
   - **Expected:** Phone number auto-formatted to `+2348012345678`
   - **Assertions:** Input value updated to +234 format

5. **TC-U-035: Booking Form - NDPR Consent Required**
   - **Description:** Test NDPR consent checkbox validation
   - **Input:** User submits form without checking NDPR consent
   - **Expected:** Validation error displayed
   - **Assertions:** Error message `NDPR consent is required` displayed

---

## 2. Integration Testing Strategy

### 2.1 Scope

Integration testing validates interactions between multiple components and external services. Tests use real database connections and real external service integrations (in staging environment).

**Coverage Target:** 80% of integration points

**Test Framework:** Vitest (API integration tests), Playwright (UI integration tests)

**Test Environment:** Staging environment with real PostgreSQL, real event bus (NATS/Redis), real payment gateway sandbox APIs

### 2.2 Integration Test Cases

#### 2.2.1 End-to-End Booking Flow Integration Tests

**Test Suite:** `booking-flow-integration.test.ts`

**Test Cases:**

1. **TC-I-001: Complete Booking Flow - Paystack**
   - **Description:** Test complete booking flow from search to payment confirmation
   - **Steps:**
     1. Search for available rooms (POST /api/v1/bookings/search)
     2. Select room and create booking (POST /api/v1/bookings)
     3. Initialize payment with Paystack (redirect to Paystack)
     4. Simulate payment callback (Paystack webhook)
     5. Verify booking confirmed (GET /api/v1/bookings/{id})
   - **Expected:** Booking created, payment completed, booking confirmed, SMS and email sent
   - **Assertions:** Booking status `confirmed`, payment status `paid`, `booking.created` event emitted, `payment.completed` event emitted

2. **TC-I-002: Complete Booking Flow - Flutterwave**
   - **Description:** Test complete booking flow with Flutterwave payment
   - **Steps:** Same as TC-I-001 but with Flutterwave gateway
   - **Expected:** Booking created, payment completed, booking confirmed
   - **Assertions:** Same as TC-I-001

3. **TC-I-003: Complete Booking Flow - Interswitch**
   - **Description:** Test complete booking flow with Interswitch payment
   - **Steps:** Same as TC-I-001 but with Interswitch gateway
   - **Expected:** Booking created, payment completed, booking confirmed
   - **Assertions:** Same as TC-I-001

4. **TC-I-004: Booking Modification Flow**
   - **Description:** Test booking modification flow
   - **Steps:**
     1. Create booking (POST /api/v1/bookings)
     2. Modify booking dates (PATCH /api/v1/bookings/{id})
     3. Verify booking updated (GET /api/v1/bookings/{id})
   - **Expected:** Booking modified, `booking.modified` event emitted, notification sent
   - **Assertions:** Booking dates updated, event emitted, SMS and email sent

5. **TC-I-005: Booking Cancellation Flow**
   - **Description:** Test booking cancellation flow
   - **Steps:**
     1. Create booking (POST /api/v1/bookings)
     2. Cancel booking (POST /api/v1/bookings/{id}/cancel)
     3. Verify refund processed (GET /api/v1/bookings/{id})
   - **Expected:** Booking cancelled, refund processed, `booking.cancelled` event emitted
   - **Assertions:** Booking status `cancelled`, refund status `pending`, event emitted

#### 2.2.2 Event-Driven Integration Tests

**Test Suite:** `event-driven-integration.test.ts`

**Test Cases:**

1. **TC-I-006: booking.created Event Consumption**
   - **Description:** Test Property Management module consumes `booking.created` event
   - **Steps:**
     1. Create booking (emits `booking.created` event)
     2. Verify Property Management receives event
     3. Verify inventory updated in Property Management
   - **Expected:** Event consumed, inventory decremented
   - **Assertions:** Event received by Property Management, room availability reduced

2. **TC-I-007: booking.cancelled Event Consumption**
   - **Description:** Test Property Management module consumes `booking.cancelled` event
   - **Steps:**
     1. Cancel booking (emits `booking.cancelled` event)
     2. Verify Property Management receives event
     3. Verify inventory released in Property Management
   - **Expected:** Event consumed, inventory incremented
   - **Assertions:** Event received by Property Management, room availability increased

3. **TC-I-008: payment.completed Event Consumption**
   - **Description:** Test Booking Service consumes `payment.completed` event
   - **Steps:**
     1. Simulate payment completion (emits `payment.completed` event)
     2. Verify Booking Service receives event
     3. Verify booking status updated to `confirmed`
   - **Expected:** Event consumed, booking confirmed
   - **Assertions:** Event received by Booking Service, booking status `confirmed`

#### 2.2.3 Offline Sync Integration Tests

**Test Suite:** `offline-sync-integration.test.ts`

**Test Cases:**

1. **TC-I-009: Offline Booking Creation and Sync**
   - **Description:** Test offline booking creation and sync when network restored
   - **Steps:**
     1. Simulate network offline
     2. Create booking (queued in IndexedDB)
     3. Simulate network online
     4. Trigger background sync
     5. Verify booking synced to server
   - **Expected:** Booking queued offline, synced when online, `booking.synced` event emitted
   - **Assertions:** Booking in IndexedDB, booking in database, sync status `synced`

2. **TC-I-010: Offline Booking Sync Conflict**
   - **Description:** Test offline booking sync with conflict (room no longer available)
   - **Steps:**
     1. Create booking offline (queued in IndexedDB)
     2. Simulate same room booked by another user online
     3. Trigger background sync
     4. Verify conflict detected and resolved
   - **Expected:** Conflict detected, user notified, alternative options offered
   - **Assertions:** Sync status `conflict`, user notification sent

#### 2.2.4 Payment Gateway Integration Tests

**Test Suite:** `payment-gateway-integration.test.ts`

**Test Cases:**

1. **TC-I-011: Paystack Payment - Successful**
   - **Description:** Test successful payment via Paystack sandbox
   - **Steps:**
     1. Initialize payment with Paystack
     2. Simulate successful payment callback
     3. Verify payment status updated
   - **Expected:** Payment completed, booking confirmed
   - **Assertions:** Payment status `completed`, booking status `confirmed`

2. **TC-I-012: Paystack Payment - Failed**
   - **Description:** Test failed payment via Paystack sandbox
   - **Steps:**
     1. Initialize payment with Paystack
     2. Simulate failed payment callback
     3. Verify payment status updated
   - **Expected:** Payment failed, booking remains pending
   - **Assertions:** Payment status `failed`, booking status `pending`

3. **TC-I-013: Flutterwave Payment - Successful**
   - **Description:** Test successful payment via Flutterwave sandbox
   - **Steps:** Same as TC-I-011 but with Flutterwave
   - **Expected:** Payment completed, booking confirmed
   - **Assertions:** Same as TC-I-011

4. **TC-I-014: Gateway Fallback - Paystack to Flutterwave**
   - **Description:** Test gateway fallback when Paystack fails
   - **Steps:**
     1. Initialize payment with Paystack
     2. Simulate Paystack API failure
     3. Verify fallback to Flutterwave
     4. Complete payment via Flutterwave
   - **Expected:** Paystack fails, Flutterwave succeeds, payment completed
   - **Assertions:** Paystack attempt logged, Flutterwave payment completed

#### 2.2.5 Notification Integration Tests

**Test Suite:** `notification-integration.test.ts`

**Test Cases:**

1. **TC-I-015: SMS Notification - Booking Confirmation**
   - **Description:** Test SMS notification sent via Termii for booking confirmation
   - **Steps:**
     1. Create booking
     2. Verify SMS sent via Termii API
   - **Expected:** SMS sent successfully
   - **Assertions:** Termii API called, SMS delivery status `sent`

2. **TC-I-016: Email Notification - Booking Confirmation**
   - **Description:** Test email notification sent for booking confirmation
   - **Steps:**
     1. Create booking
     2. Verify email sent via SMTP
   - **Expected:** Email sent successfully
   - **Assertions:** SMTP server called, email delivery status `sent`

3. **TC-I-017: SMS Fallback to Email**
   - **Description:** Test SMS fallback to email when SMS fails
   - **Steps:**
     1. Create booking
     2. Simulate SMS delivery failure
     3. Verify email sent as fallback
   - **Expected:** SMS fails, email sent successfully
   - **Assertions:** SMS delivery status `failed`, email delivery status `sent`

---

## 3. End-to-End Testing Strategy

### 3.1 Scope

End-to-end testing validates complete user flows from UI to database using real browser automation. Tests simulate real user interactions on real devices and networks.

**Test Framework:** Playwright

**Test Environment:** Staging environment with real UI, real API, real database, real payment gateway sandboxes

**Test Devices:**
- **Desktop:** Chrome, Firefox, Safari (1920x1080)
- **Mobile:** iPhone SE (375x667), Samsung Galaxy A13 (360x800), iPad (768x1024)

**Network Conditions:**
- **4G:** 4 Mbps, 50ms latency
- **3G:** 750 Kbps, 100ms latency
- **2G:** 250 Kbps, 300ms latency

### 3.2 End-to-End Test Cases

#### 3.2.1 Guest Booking Flow

**Test Suite:** `guest-booking-flow-e2e.test.ts`

**Test Cases:**

1. **TC-E-001: Guest Books Hotel - Desktop Chrome**
   - **Description:** Test complete booking flow on desktop Chrome
   - **Steps:**
     1. Navigate to booking page
     2. Enter search criteria (Lagos, 2026-03-01 to 2026-03-05, 2 guests)
     3. Click search button
     4. Verify search results displayed
     5. Select room (Deluxe Room)
     6. Enter guest information (name, email, phone, NDPR consent)
     7. Select payment gateway (Paystack)
     8. Click book button
     9. Redirect to Paystack payment page
     10. Complete payment (sandbox)
     11. Redirect back to confirmation page
     12. Verify booking confirmation displayed
   - **Expected:** Booking completed successfully, confirmation displayed
   - **Assertions:** Booking reference displayed, payment status `paid`, SMS and email sent

2. **TC-E-002: Guest Books Hotel - Mobile iPhone SE**
   - **Description:** Test complete booking flow on mobile iPhone SE
   - **Steps:** Same as TC-E-001 but on iPhone SE (375x667)
   - **Expected:** Booking completed successfully, UI responsive
   - **Assertions:** Same as TC-E-001, UI elements visible and usable

3. **TC-E-003: Guest Books Hotel - Mobile Samsung Galaxy A13**
   - **Description:** Test complete booking flow on mobile Samsung Galaxy A13
   - **Steps:** Same as TC-E-001 but on Samsung Galaxy A13 (360x800)
   - **Expected:** Booking completed successfully, UI responsive
   - **Assertions:** Same as TC-E-001, UI elements visible and usable

4. **TC-E-004: Guest Books Hotel - 3G Network**
   - **Description:** Test complete booking flow on 3G network (750 Kbps, 100ms latency)
   - **Steps:** Same as TC-E-001 but with 3G network throttling
   - **Expected:** Booking completed successfully, page load < 3s
   - **Assertions:** Same as TC-E-001, page load time < 3s

5. **TC-E-005: Guest Books Hotel - Offline Mode**
   - **Description:** Test booking creation in offline mode
   - **Steps:**
     1. Navigate to booking page (online)
     2. Service worker caches assets
     3. Simulate network offline
     4. Enter search criteria (uses cached data)
     5. Select room
     6. Enter guest information
     7. Click book button (booking queued in IndexedDB)
     8. Verify offline indicator displayed
     9. Simulate network online
     10. Verify booking synced to server
     11. Verify confirmation displayed
   - **Expected:** Booking queued offline, synced when online
   - **Assertions:** Booking in IndexedDB, booking synced to server, confirmation displayed

#### 3.2.2 Guest Booking Modification Flow

**Test Suite:** `guest-booking-modification-e2e.test.ts`

**Test Cases:**

1. **TC-E-006: Guest Modifies Booking Dates**
   - **Description:** Test booking date modification flow
   - **Steps:**
     1. Navigate to booking lookup page
     2. Enter booking reference
     3. Click lookup button
     4. Verify booking details displayed
     5. Click modify button
     6. Change check-in date (2026-03-02) and check-out date (2026-03-06)
     7. Click save button
     8. Verify modification confirmation displayed
   - **Expected:** Booking dates modified successfully
   - **Assertions:** Booking dates updated, modification confirmation displayed, SMS and email sent

2. **TC-E-007: Guest Modifies Guest Information**
   - **Description:** Test guest information modification flow
   - **Steps:**
     1. Lookup booking (same as TC-E-006 steps 1-4)
     2. Click modify button
     3. Change phone number (+2348087654321)
     4. Click save button
     5. Verify modification confirmation displayed
   - **Expected:** Guest information modified successfully
   - **Assertions:** Phone number updated, modification confirmation displayed

#### 3.2.3 Guest Booking Cancellation Flow

**Test Suite:** `guest-booking-cancellation-e2e.test.ts`

**Test Cases:**

1. **TC-E-008: Guest Cancels Booking**
   - **Description:** Test booking cancellation flow
   - **Steps:**
     1. Lookup booking (same as TC-E-006 steps 1-4)
     2. Click cancel button
     3. Enter cancellation reason ("Change of plans")
     4. Click confirm cancellation button
     5. Verify cancellation policy displayed
     6. Confirm cancellation
     7. Verify cancellation confirmation displayed
   - **Expected:** Booking cancelled successfully, refund processed
   - **Assertions:** Booking status `cancelled`, refund amount displayed, SMS and email sent

---

## 4. Performance Testing Strategy

### 4.1 Scope

Performance testing validates system performance under load and stress conditions. Tests measure response times, throughput, resource utilization, and scalability.

**Test Framework:** k6 (load testing), Lighthouse (frontend performance)

**Test Environment:** Staging environment with production-like infrastructure

**Performance Targets:**
- API response time < 200ms (95th percentile)
- Page load time < 3s on 3G (95th percentile)
- Search time < 2s on 3G
- Support 10,000 concurrent users per tenant
- Support 1,000 bookings per minute across all tenants

### 4.2 Performance Test Cases

#### 4.2.1 API Performance Tests

**Test Suite:** `api-performance.test.js` (k6)

**Test Cases:**

1. **TC-P-001: Search API - Load Test**
   - **Description:** Test search API performance under normal load
   - **Load:** 1,000 concurrent users, 10 requests per second per user, 5 minutes duration
   - **Expected:** 95th percentile response time < 200ms
   - **Assertions:** Response time < 200ms (95th percentile), error rate < 1%

2. **TC-P-002: Create Booking API - Load Test**
   - **Description:** Test create booking API performance under normal load
   - **Load:** 1,000 concurrent users, 5 requests per second per user, 5 minutes duration
   - **Expected:** 95th percentile response time < 200ms
   - **Assertions:** Response time < 200ms (95th percentile), error rate < 1%

3. **TC-P-003: Search API - Stress Test**
   - **Description:** Test search API performance under stress load
   - **Load:** 10,000 concurrent users, 10 requests per second per user, 5 minutes duration
   - **Expected:** System remains stable, graceful degradation
   - **Assertions:** Response time < 500ms (95th percentile), error rate < 5%, no crashes

4. **TC-P-004: Create Booking API - Throughput Test**
   - **Description:** Test create booking API throughput
   - **Load:** Ramp up to 1,000 bookings per minute
   - **Expected:** System handles 1,000 bookings per minute
   - **Assertions:** Throughput >= 1,000 bookings/minute, error rate < 1%

#### 4.2.2 Frontend Performance Tests

**Test Suite:** `frontend-performance.test.js` (Lighthouse)

**Test Cases:**

1. **TC-P-005: Search Page - 4G Network**
   - **Description:** Test search page performance on 4G network
   - **Network:** 4G (4 Mbps, 50ms latency)
   - **Expected:** Page load time < 2s, Lighthouse score > 90
   - **Assertions:** First Contentful Paint < 1s, Time to Interactive < 2s, Lighthouse Performance score > 90

2. **TC-P-006: Search Page - 3G Network**
   - **Description:** Test search page performance on 3G network
   - **Network:** 3G (750 Kbps, 100ms latency)
   - **Expected:** Page load time < 3s, Lighthouse score > 80
   - **Assertions:** First Contentful Paint < 2s, Time to Interactive < 3s, Lighthouse Performance score > 80

3. **TC-P-007: Booking Page - 3G Network**
   - **Description:** Test booking page performance on 3G network
   - **Network:** 3G (750 Kbps, 100ms latency)
   - **Expected:** Page load time < 3s, Lighthouse score > 80
   - **Assertions:** First Contentful Paint < 2s, Time to Interactive < 3s, Lighthouse Performance score > 80

4. **TC-P-008: PWA Performance - Offline**
   - **Description:** Test PWA performance in offline mode
   - **Network:** Offline (cached assets)
   - **Expected:** Page load time < 1s (from cache)
   - **Assertions:** Page loads from cache, no network requests, Time to Interactive < 1s

#### 4.2.3 Database Performance Tests

**Test Suite:** `database-performance.test.js`

**Test Cases:**

1. **TC-P-009: Search Query Performance**
   - **Description:** Test search query performance with large dataset
   - **Dataset:** 1 million bookings, 10,000 properties
   - **Expected:** Query execution time < 100ms
   - **Assertions:** Query time < 100ms, index usage confirmed

2. **TC-P-010: Booking Creation Performance**
   - **Description:** Test booking creation performance with concurrent writes
   - **Load:** 1,000 concurrent booking creations
   - **Expected:** Transaction time < 50ms
   - **Assertions:** Transaction time < 50ms, no deadlocks, no data loss

---

## 5. Security Testing Strategy

### 5.1 Scope

Security testing validates system security, identifies vulnerabilities, and confirms compliance with security standards (PCI DSS, NDPR).

**Test Framework:** OWASP ZAP (automated security scanning), manual penetration testing

**Test Environment:** Staging environment

**Security Targets:**
- No critical or high-severity vulnerabilities
- PCI DSS Level 1 compliant
- NDPR compliant
- All data encrypted at rest and in transit

### 5.2 Security Test Cases

#### 5.2.1 Authentication and Authorization Tests

**Test Suite:** `auth-security.test.ts`

**Test Cases:**

1. **TC-S-001: JWT Authentication - Valid Token**
   - **Description:** Test API access with valid JWT token
   - **Input:** Valid JWT token in Authorization header
   - **Expected:** API access granted
   - **Assertions:** API returns 200 OK

2. **TC-S-002: JWT Authentication - Invalid Token**
   - **Description:** Test API access with invalid JWT token
   - **Input:** Invalid JWT token in Authorization header
   - **Expected:** API access denied
   - **Assertions:** API returns 401 Unauthorized

3. **TC-S-003: JWT Authentication - Expired Token**
   - **Description:** Test API access with expired JWT token
   - **Input:** Expired JWT token in Authorization header
   - **Expected:** API access denied
   - **Assertions:** API returns 401 Unauthorized

4. **TC-S-004: Tenant Isolation - Access Other Tenant Data**
   - **Description:** Test tenant isolation by attempting to access another tenant's booking
   - **Input:** Valid JWT token for Tenant A, booking ID from Tenant B
   - **Expected:** Access denied
   - **Assertions:** API returns 403 Forbidden

#### 5.2.2 Input Validation Tests

**Test Suite:** `input-validation-security.test.ts`

**Test Cases:**

1. **TC-S-005: SQL Injection - Search Query**
   - **Description:** Test SQL injection prevention in search query
   - **Input:** Search query with SQL injection payload (`' OR '1'='1`)
   - **Expected:** Input sanitized, no SQL injection
   - **Assertions:** Query returns empty results, no database error

2. **TC-S-006: XSS Prevention - Guest Name**
   - **Description:** Test XSS prevention in guest name field
   - **Input:** Guest name with XSS payload (`<script>alert('XSS')</script>`)
   - **Expected:** Input sanitized, no script execution
   - **Assertions:** Name stored as plain text, no script execution in UI

3. **TC-S-007: CSRF Prevention - Booking Creation**
   - **Description:** Test CSRF prevention in booking creation
   - **Input:** Booking creation request without CSRF token
   - **Expected:** Request rejected
   - **Assertions:** API returns 403 Forbidden

#### 5.2.3 Data Encryption Tests

**Test Suite:** `encryption-security.test.ts`

**Test Cases:**

1. **TC-S-008: Data Encryption at Rest - Guest Data**
   - **Description:** Test guest data encryption in database
   - **Input:** Guest data stored in database
   - **Expected:** Data encrypted with AES-256
   - **Assertions:** Database query returns encrypted data, decryption with key succeeds

2. **TC-S-009: Data Encryption in Transit - API Requests**
   - **Description:** Test data encryption in transit for API requests
   - **Input:** API request over HTTPS
   - **Expected:** Data encrypted with TLS 1.3
   - **Assertions:** TLS 1.3 negotiated, certificate valid

#### 5.2.4 PCI DSS Compliance Tests

**Test Suite:** `pci-dss-compliance.test.ts`

**Test Cases:**

1. **TC-S-010: No Card Data Storage**
   - **Description:** Test that no card data is stored in database
   - **Input:** Payment processed via Paystack
   - **Expected:** No card data stored, only payment reference
   - **Assertions:** Database contains no card numbers, only gateway transaction ID

2. **TC-S-011: Payment Gateway Tokenization**
   - **Description:** Test payment gateway tokenization
   - **Input:** Payment processed via Paystack
   - **Expected:** Card data tokenized by gateway
   - **Assertions:** Only token stored, no raw card data

#### 5.2.5 NDPR Compliance Tests

**Test Suite:** `ndpr-compliance.test.ts`

**Test Cases:**

1. **TC-S-012: NDPR Consent Collection**
   - **Description:** Test NDPR consent collection during booking
   - **Input:** Booking creation with NDPR consent checkbox
   - **Expected:** Consent recorded in database
   - **Assertions:** Guest record has `ndprConsent: true`, `ndprConsentDate` timestamp

2. **TC-S-013: NDPR Data Access - Guest Requests Data**
   - **Description:** Test guest data access API (NDPR right to access)
   - **Input:** Guest requests their data via API
   - **Expected:** Guest data returned in structured format
   - **Assertions:** API returns all guest data (bookings, payments, personal info)

3. **TC-S-014: NDPR Data Deletion - Guest Requests Deletion**
   - **Description:** Test guest data deletion API (NDPR right to deletion)
   - **Input:** Guest requests data deletion via API
   - **Expected:** Guest data soft-deleted (marked as deleted, not physically removed)
   - **Assertions:** Guest record has `deletedAt` timestamp, data not returned in queries

---

## 6. Compliance Testing Strategy

### 6.1 Nigerian-First Compliance Tests

**Test Cases:**

1. **TC-C-001: Nigerian Naira Currency Display**
   - **Description:** Test Naira (₦) symbol displayed correctly
   - **Expected:** All prices display ₦ symbol
   - **Assertions:** Currency symbol ₦ visible, format ₦1,000.00

2. **TC-C-002: Paystack Payment Gateway Integration**
   - **Description:** Test Paystack payment gateway integration
   - **Expected:** Paystack payment completes successfully
   - **Assertions:** Payment URL from Paystack, payment callback processed

3. **TC-C-003: Termii SMS Notification**
   - **Description:** Test SMS notification via Termii
   - **Expected:** SMS sent successfully
   - **Assertions:** Termii API called, SMS delivery status `sent`

4. **TC-C-004: +234 Phone Number Format**
   - **Description:** Test +234 phone number format validation
   - **Expected:** Phone number validated and formatted correctly
   - **Assertions:** Phone number format +234XXXXXXXXXX

### 6.2 Mobile-First Compliance Tests

**Test Cases:**

1. **TC-C-005: Responsive Design - 320px Viewport**
   - **Description:** Test responsive design on 320px viewport (iPhone SE portrait)
   - **Expected:** UI elements visible and usable
   - **Assertions:** No horizontal scrolling, all elements visible

2. **TC-C-006: Touch Targets - 44x44 Pixels**
   - **Description:** Test touch targets meet 44x44 pixel minimum
   - **Expected:** All interactive elements at least 44x44 pixels
   - **Assertions:** Button sizes >= 44x44 pixels

3. **TC-C-007: Page Load Time - 3G Network**
   - **Description:** Test page load time on 3G network
   - **Expected:** Page load < 3s on 3G
   - **Assertions:** Page load time < 3s (95th percentile)

### 6.3 PWA-First Compliance Tests

**Test Cases:**

1. **TC-C-008: Service Worker - Offline Caching**
   - **Description:** Test service worker caches assets for offline use
   - **Expected:** Assets cached, page loads offline
   - **Assertions:** Service worker registered, assets in cache storage

2. **TC-C-009: App Manifest - Installable**
   - **Description:** Test app manifest enables installation
   - **Expected:** App installable via "Add to Home Screen"
   - **Assertions:** App manifest valid, install prompt displayed

3. **TC-C-010: Background Sync - Offline Booking**
   - **Description:** Test background sync for offline bookings
   - **Expected:** Offline bookings synced when online
   - **Assertions:** Background sync registered, bookings synced

### 6.4 Africa-First Compliance Tests

**Test Cases:**

1. **TC-C-011: Multi-Language Support - English, Hausa, Yoruba, Igbo**
   - **Description:** Test multi-language support for Nigerian languages
   - **Expected:** UI text displays in selected language
   - **Assertions:** Language selector works, UI text translated

2. **TC-C-012: Low-Spec Device Support - 2GB RAM**
   - **Description:** Test app performance on low-spec device (2GB RAM)
   - **Expected:** App runs smoothly, memory usage < 100MB
   - **Assertions:** Memory usage < 100MB, no crashes

3. **TC-C-013: Low-Bandwidth Network - 2G**
   - **Description:** Test app functionality on 2G network (250 Kbps)
   - **Expected:** App loads and functions (degraded performance acceptable)
   - **Assertions:** Page loads (may take longer), core functionality works

---

## 7. Test Execution Plan

### 7.1 Test Phases

**Phase 1: Unit Testing (Week 25, Days 1-2)**
- Execute all unit tests (TC-U-001 to TC-U-035)
- Target: 100% code coverage
- Tools: Jest, Vitest
- Environment: Local development

**Phase 2: Integration Testing (Week 25, Days 3-4)**
- Execute all integration tests (TC-I-001 to TC-I-017)
- Target: 80% integration coverage
- Tools: Vitest, Playwright
- Environment: Staging

**Phase 3: End-to-End Testing (Week 25, Day 5)**
- Execute all E2E tests (TC-E-001 to TC-E-008)
- Target: All user flows validated
- Tools: Playwright
- Environment: Staging

**Phase 4: Performance Testing (Week 25, Days 6-7)**
- Execute all performance tests (TC-P-001 to TC-P-010)
- Target: All performance targets met
- Tools: k6, Lighthouse
- Environment: Staging

**Phase 5: Security Testing (Week 25, Days 8-9)**
- Execute all security tests (TC-S-001 to TC-S-014)
- Target: No critical vulnerabilities
- Tools: OWASP ZAP, manual testing
- Environment: Staging

**Phase 6: Compliance Testing (Week 25, Day 10)**
- Execute all compliance tests (TC-C-001 to TC-C-013)
- Target: All compliance requirements met
- Tools: Manual testing, Lighthouse
- Environment: Staging

### 7.2 Test Automation

**CI/CD Pipeline:**
- Unit tests run on every commit (GitHub Actions)
- Integration tests run on every pull request
- E2E tests run on merge to master
- Performance tests run nightly
- Security tests run weekly

**Test Reporting:**
- Jest/Vitest coverage reports published to Codecov
- Playwright test results published to GitHub Actions
- k6 performance reports published to Grafana
- OWASP ZAP security reports published to GitHub Security

### 7.3 Test Data Management

**Test Data Strategy:**
- Use seed data for unit and integration tests
- Use factory pattern for test data generation
- Use database transactions for test isolation (rollback after each test)
- Use separate staging database (not production)

**Test Data Sets:**
- **Small:** 10 properties, 100 bookings (for unit tests)
- **Medium:** 100 properties, 1,000 bookings (for integration tests)
- **Large:** 1,000 properties, 100,000 bookings (for performance tests)

---

## 8. Test Deliverables

### 8.1 Test Documentation

1. **Test Plan:** This document (BOOKING_ENGINE_TEST_STRATEGY.md)
2. **Test Cases:** All test cases documented in this document
3. **Test Scripts:** Automated test scripts in repository (`/tests` directory)
4. **Test Data:** Test data seed scripts in repository (`/tests/fixtures` directory)

### 8.2 Test Reports

1. **Unit Test Coverage Report:** Jest/Vitest coverage report (HTML format)
2. **Integration Test Results Report:** Vitest test results (JSON format)
3. **E2E Test Results Report:** Playwright test results (HTML format)
4. **Performance Test Report:** k6 performance report (JSON format, Grafana dashboard)
5. **Security Test Report:** OWASP ZAP security report (HTML format)
6. **Compliance Test Report:** Manual compliance checklist (Markdown format)

### 8.3 Success Criteria

**Test Strategy Approved:**
- [x] All test types defined (unit, integration, E2E, performance, security, compliance)
- [x] 100% code coverage target set
- [x] All functional requirements covered by tests
- [x] All non-functional requirements covered by tests
- [x] Test automation strategy defined
- [x] Test execution plan defined
- [x] Test deliverables defined

**Testing Complete:**
- [ ] All unit tests pass (100% coverage)
- [ ] All integration tests pass (80% coverage)
- [ ] All E2E tests pass (all user flows validated)
- [ ] All performance tests pass (all targets met)
- [ ] All security tests pass (no critical vulnerabilities)
- [ ] All compliance tests pass (all requirements met)
- [ ] Test reports published

---

**Test Strategy Status:** APPROVED  
**Author:** webwakaagent5 (Quality Assurance)  
**Date:** 2026-02-13  
**Next Step:** Step 420 - Implement Booking Engine (webwakaagent4)
