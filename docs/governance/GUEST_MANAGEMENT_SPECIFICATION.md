# Guest Management Specification

**Module:** Guest Management  
**Author:** webwakaagent3 (Specification)  
**Date:** 2026-02-13  
**Step:** 444  
**Status:** DRAFT

---

## 1. Module Overview

The Guest Management module provides comprehensive guest relationship management for hospitality businesses, including guest profiles, preferences, communication history, loyalty programs, feedback management, and personalized guest experiences.

---

## 2. Functional Requirements

### FR1: Guest Profile Management
**Description:** Create and manage comprehensive guest profiles

**Acceptance Criteria:**
- Guest CRUD operations
- Personal information (name, email, phone, address)
- Nigerian-First (+234 phone format, Nigerian address)
- Identity verification (NIN, passport, driver's license)
- Profile photos
- Emergency contacts
- Special requirements (dietary, accessibility, allergies)
- NDPR compliance (consent management, data portability, right to be forgotten)

### FR2: Guest Preferences
**Description:** Track and manage guest preferences

**Acceptance Criteria:**
- Room preferences (floor, view, bed type, smoking/non-smoking)
- Amenity preferences (pillow type, temperature, minibar)
- Service preferences (housekeeping schedule, wake-up calls)
- Communication preferences (email, SMS, WhatsApp)
- Language preferences
- Dietary preferences
- Accessibility requirements

### FR3: Booking History
**Description:** Track complete guest booking history

**Acceptance Criteria:**
- View all past bookings
- Booking details and invoices
- Stay patterns and frequency
- Favorite properties and room types
- Average spend per booking
- Booking source tracking
- Cancellation history

### FR4: Communication Management
**Description:** Manage all guest communications

**Acceptance Criteria:**
- Email communication history
- SMS communication history (Termii integration)
- WhatsApp messages (optional)
- In-app notifications
- Communication templates
- Automated messages (pre-arrival, post-departure)
- Communication preferences respected

### FR5: Loyalty Program
**Description:** Implement guest loyalty and rewards program

**Acceptance Criteria:**
- Points accumulation (per stay, per spend)
- Tier levels (Silver, Gold, Platinum)
- Tier benefits (upgrades, discounts, early check-in/late check-out)
- Points redemption
- Referral rewards
- Birthday/anniversary rewards
- Loyalty dashboard

### FR6: Feedback Management
**Description:** Collect and manage guest feedback

**Acceptance Criteria:**
- Post-stay surveys
- Rating system (1-5 stars)
- Review collection
- Feedback categories (cleanliness, service, amenities, value)
- Response management
- Sentiment analysis
- Feedback reports

### FR7: Guest Segmentation
**Description:** Segment guests for targeted marketing

**Acceptance Criteria:**
- Demographic segmentation
- Behavioral segmentation (frequent, occasional, one-time)
- Value segmentation (high-value, medium-value, low-value)
- Preference-based segmentation
- Custom segments
- Segment analytics

### FR8: Guest Communication Campaigns
**Description:** Run targeted communication campaigns

**Acceptance Criteria:**
- Email campaigns
- SMS campaigns
- Segment-based targeting
- Campaign templates
- Campaign scheduling
- Campaign analytics (open rate, click rate, conversion)
- A/B testing

### FR9: Guest Portal
**Description:** Self-service portal for guests

**Acceptance Criteria:**
- View profile and preferences
- Update personal information
- View booking history
- Manage loyalty points
- Submit feedback
- Request services
- Mobile-first responsive design
- PWA support

### FR10: Multi-Property Guest Management
**Description:** Unified guest management across properties

**Acceptance Criteria:**
- Single guest profile across properties
- Cross-property booking history
- Cross-property loyalty program
- Property-specific preferences
- Centralized guest dashboard

---

## 3. Non-Functional Requirements

### NFR1: Performance
- Guest profile load: < 500ms
- Search guests: < 1 second
- Support 100,000+ guest profiles per tenant

### NFR2: Security
- Encrypted PII (personally identifiable information)
- NDPR compliance (Nigerian Data Protection Regulation)
- Role-based access control
- Audit trail for all guest data access

### NFR3: Scalability
- Handle 10,000+ new guests per month
- Support 1,000,000+ guest profiles

### NFR4: Reliability
- 99.9% uptime
- Data backup and recovery
- Zero data loss

### NFR5: Maintainability
- Modular architecture
- Comprehensive logging
- API versioning

---

## 4. API Specification

### REST Endpoints

1. **POST /api/v1/guests** - Create guest profile
2. **GET /api/v1/guests** - List guests
3. **GET /api/v1/guests/:id** - Get guest profile
4. **PUT /api/v1/guests/:id** - Update guest profile
5. **DELETE /api/v1/guests/:id** - Delete guest (NDPR right to be forgotten)
6. **GET /api/v1/guests/:id/bookings** - Get guest booking history
7. **GET /api/v1/guests/:id/preferences** - Get guest preferences
8. **PUT /api/v1/guests/:id/preferences** - Update guest preferences
9. **GET /api/v1/guests/:id/loyalty** - Get loyalty status
10. **POST /api/v1/guests/:id/feedback** - Submit feedback
11. **GET /api/v1/guests/segments** - Get guest segments
12. **POST /api/v1/campaigns** - Create communication campaign

### Event Types

1. **guest.created** - New guest profile created
2. **guest.updated** - Guest profile updated
3. **guest.deleted** - Guest profile deleted (NDPR)
4. **guest.booking.completed** - Guest completed a stay
5. **guest.loyalty.tier.upgraded** - Guest tier upgraded
6. **guest.feedback.submitted** - Feedback submitted
7. **campaign.sent** - Campaign sent to guests

---

## 5. Data Model

### Entities

1. **Guest** - Guest profile
2. **GuestPreference** - Guest preferences
3. **GuestLoyalty** - Loyalty program data
4. **GuestFeedback** - Guest feedback and reviews
5. **GuestSegment** - Guest segmentation
6. **Campaign** - Communication campaigns

### Database Schema (PostgreSQL)

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL, -- +234 format
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  nationality VARCHAR(2), -- ISO country code
  nin VARCHAR(11), -- Nigerian National Identification Number
  address JSONB, -- Nigerian address (state, LGA)
  emergency_contact JSONB,
  special_requirements TEXT[],
  profile_photo_url VARCHAR(500),
  consent JSONB NOT NULL, -- NDPR consent tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INT DEFAULT 1
);

CREATE TABLE guest_preferences (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id),
  room_preferences JSONB,
  amenity_preferences JSONB,
  service_preferences JSONB,
  communication_preferences JSONB,
  dietary_preferences TEXT[],
  accessibility_requirements TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guest_loyalty (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id),
  points INT DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'SILVER', -- SILVER, GOLD, PLATINUM
  tier_since TIMESTAMP,
  lifetime_stays INT DEFAULT 0,
  lifetime_spend DECIMAL(10,2) DEFAULT 0,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES guests(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guest_feedback (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id),
  booking_id UUID REFERENCES bookings(id),
  property_id UUID NOT NULL,
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  cleanliness_rating INT,
  service_rating INT,
  amenities_rating INT,
  value_rating INT,
  review_text TEXT,
  sentiment VARCHAR(20), -- positive, neutral, negative
  response TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guest_segments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL, -- segmentation rules
  guest_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- email, sms
  segment_id UUID REFERENCES guest_segments(id),
  template_id UUID,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(20) NOT NULL, -- draft, scheduled, sent, failed
  stats JSONB, -- sent_count, opened_count, clicked_count
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Architectural Invariants Compliance

1. **Offline-First:** ✅ Offline guest profile access
2. **Event-Driven:** ✅ 7 event types
3. **Plugin-First:** ✅ Communication channel plugins
4. **Multi-Tenant:** ✅ Tenant isolation
5. **Permission-Driven:** ✅ RBAC integration
6. **API-First:** ✅ 12 REST endpoints
7. **Mobile-First:** ✅ Responsive guest portal
8. **Audit-Ready:** ✅ Complete audit trail for PII access
9. **Nigerian-First:** ✅ +234 phone, NIN, Nigerian address, NDPR compliance
10. **PWA-First:** ✅ Guest portal as PWA

---

## 7. Testing Requirements

- **Unit Tests:** 120 test cases, 100% coverage
- **Integration Tests:** 90 test cases
- **E2E Tests:** 35 test cases
- **Performance Tests:** 10 test cases
- **Security Tests:** 20 test cases (PII encryption, NDPR compliance)

---

## 8. Dependencies

### Internal
- Booking Engine (booking history)
- Property Management (property data)
- Auth Module (guest portal authentication)

### External
- Termii (SMS)
- SMTP (Email)
- WhatsApp Business API (optional)

---

## 9. Risks & Mitigation

### Risk 1: PII Data Breach
**Mitigation:** Encryption at rest and in transit, access controls, audit trail

### Risk 2: NDPR Non-Compliance
**Mitigation:** Consent management, data portability, right to be forgotten

### Risk 3: Guest Data Loss
**Mitigation:** Automated backups, disaster recovery plan

### Risk 4: Campaign Spam
**Mitigation:** Unsubscribe option, frequency limits, preference management

### Risk 5: Loyalty Program Abuse
**Mitigation:** Fraud detection, points expiration, terms and conditions

---

## 10. Implementation Timeline

**Duration:** 10 days (Week 27)

- Days 1-2: Guest profile and preferences
- Days 3-4: Loyalty program
- Days 5-6: Feedback management
- Days 7-8: Guest portal
- Days 9-10: Testing and bug fixes

---

**Status:** DRAFT - Ready for Review  
**Author:** webwakaagent3  
**Task:** Step 444
