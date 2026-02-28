# Migration Wave Targets

**Date:** 2026-02-14
**Authority:** Chief of Staff (webwakaagent1)
**Status:** APPROVED FOR EXECUTION

---

## Purpose

This document identifies the specific duplication targets for each migration wave under the Reuse Remediation and Enforcement Program. These targets have been identified through comprehensive analysis of the webwaka-platform repository and governance documents.

---

## Wave 1: Cosmetic Alignment (Weeks 1-4)

**Objective:** Identify all duplicate capabilities and assign a single, authoritative owner for each. Update the Capability Registry to reflect this ownership.

### Target 1: Donations vs Fundraising (CRITICAL)

**Duplicate Modules:**
- `src/donations/` (Church Suite - webwakaagent4)
- `src/fundraising-module/` (Unknown owner)

**Analysis:**
- Both modules handle donation processing
- Both have payment gateway integration
- Both have campaign management
- Estimated overlap: 80%+

**Action:**
- **Authoritative Module:** `donations` (more recent, better structured)
- **Owner:** webwakaagent4
- **Deprecated Module:** `fundraising-module`
- **Migration Timeline:** Wave 3 (Weeks 9-16)

---

### Target 2: Events vs Booking (CRITICAL)

**Duplicate Modules:**
- `src/events/` (Church Suite Event Management - webwakaagent4)
- `src/event-system/` (Platform event bus - different purpose, NOT duplicate)
- `src/booking-scheduling/` (Shared booking capability)
- `src/hospitality-booking-engine/` (Hospitality Suite specific)

**Analysis:**
- `events` handles church events, registration, attendance
- `booking-scheduling` is a general booking capability
- `hospitality-booking-engine` is hospitality-specific
- `event-system` is NOT a duplicate (it's the event-driven architecture bus)
- Estimated overlap between events/booking: 60%
- Estimated overlap between booking/hospitality-booking: 70%

**Action:**
- **Authoritative Module:** `booking-scheduling` (general-purpose, reusable)
- **Owner:** TBD (assign in Week 2)
- **Extension Required:** `events` should extend `booking-scheduling`
- **Deprecated Module:** Consider consolidating `hospitality-booking-engine` into `booking-scheduling` with hospitality extensions
- **Migration Timeline:** Wave 3 (Weeks 17-24)

---

### Target 3: Member Management vs User Identity (HIGH)

**Duplicate Modules:**
- `src/member-management/` (Church Suite - webwakaagent4)
- `src/user-identity/` (Platform identity layer)

**Analysis:**
- `member-management` handles church member profiles, roles, permissions
- `user-identity` handles platform-wide authentication and authorization
- Estimated overlap: 50% (member-management should extend user-identity)

**Action:**
- **Authoritative Module:** `user-identity` (platform-level)
- **Owner:** TBD (assign in Week 2)
- **Extension Required:** `member-management` should extend `user-identity` for church-specific features
- **Migration Timeline:** Wave 2 (Weeks 5-8)

---

### Target 4: Communication Fragmentation (CRITICAL)

**Duplicate Modules:**
- `src/communication-tools/` (Church Suite - webwakaagent4)
- `src/module-system/communication/` (Module system communication)
- `src/sites-funnels-email-campaign-builder/` (Sites & Funnels email)

**Analysis:**
- All three modules handle messaging (SMS, Email, Push)
- All three have overlapping features
- Estimated overlap: 70%+

**Action:**
- **Authoritative Module:** `communication-tools` (most complete implementation)
- **Owner:** webwakaagent4
- **Deprecated Modules:** `module-system/communication`, `sites-funnels-email-campaign-builder` (email portion)
- **Migration Timeline:** Wave 3 (Weeks 9-16)

---

## Wave 2: Contract Alignment (Weeks 5-8)

**Objective:** For each set of duplicate capabilities, define a single, unified API contract. All new features must use this new contract.

### Target 1: User/Member Identity Contract

**Action:**
- Define unified identity API contract
- Ensure `member-management` extends `user-identity` contract
- Document extension points for suite-specific identity features

**Deliverables:**
- `USER_IDENTITY_API_CONTRACT.md`
- `MEMBER_MANAGEMENT_EXTENSION_GUIDE.md`

---

### Target 2: Booking/Events Contract

**Action:**
- Define unified booking API contract
- Ensure `events` extends `booking-scheduling` contract
- Document extension points for event-specific features

**Deliverables:**
- `BOOKING_API_CONTRACT.md`
- `EVENT_MANAGEMENT_EXTENSION_GUIDE.md`

---

### Target 3: Communication Contract

**Action:**
- Define unified communication API contract
- Consolidate SMS, Email, Push notification interfaces
- Document extension points for suite-specific messaging

**Deliverables:**
- `COMMUNICATION_API_CONTRACT.md`
- `MESSAGING_EXTENSION_GUIDE.md`

---

## Wave 3: Functional Consolidation (Weeks 9-24)

**Objective:** Gradually migrate all consumers of the duplicate capabilities to use the single, authoritative implementation.

### Phase 3A: Donations Consolidation (Weeks 9-12)

**Action:**
- Identify all consumers of `fundraising-module`
- Migrate consumers to `donations` module
- Verify functionality parity
- Deprecate `fundraising-module`

**Estimated Effort:** 4 weeks
**Risk Level:** Medium

---

### Phase 3B: Communication Consolidation (Weeks 13-16)

**Action:**
- Identify all consumers of `module-system/communication` and `sites-funnels-email-campaign-builder`
- Migrate consumers to `communication-tools` module
- Verify functionality parity
- Deprecate duplicate modules

**Estimated Effort:** 4 weeks
**Risk Level:** High (multiple consumers)

---

### Phase 3C: Booking Consolidation (Weeks 17-24)

**Action:**
- Refactor `events` to extend `booking-scheduling`
- Migrate `hospitality-booking-engine` consumers to `booking-scheduling` with extensions
- Verify functionality parity
- Deprecate `hospitality-booking-engine`

**Estimated Effort:** 8 weeks
**Risk Level:** High (complex domain)

---

## Wave 4: Legacy Retirement (Weeks 25-30)

**Objective:** Once all consumers have been migrated, the duplicate implementations will be deprecated and then retired.

### Retirement Schedule

| Module | Deprecation Date | End-of-Life Date | Removal Date |
|---|---|---|---|
| `fundraising-module` | Week 13 | Week 21 | Week 25 |
| `module-system/communication` | Week 17 | Week 25 | Week 29 |
| `sites-funnels-email-campaign-builder` (email) | Week 17 | Week 25 | Week 29 |
| `hospitality-booking-engine` | Week 25 | Week 33 | Week 37 |

---

## Risk Assessment

| Target | Risk Level | Mitigation Strategy |
|---|---|---|---|
| Donations consolidation | Medium | Comprehensive testing, gradual rollout |
| Communication consolidation | High | Feature parity verification, consumer mapping |
| Booking consolidation | High | Phased migration, extensive testing |
| Member/User identity | Medium | Clear extension contract, backward compatibility |

---

## Success Metrics

-   **Wave 1 Success:** 100% of duplicate capabilities have assigned owners
-   **Wave 2 Success:** Unified API contracts defined and published
-   **Wave 3 Success:** 90%+ of consumers migrated to authoritative modules
-   **Wave 4 Success:** All deprecated modules removed from codebase

---

## Wave Ownership

| Wave | Owner | Start Date | End Date |
|---|---|---|---|
| Wave 1 | Chief of Staff (webwakaagent1) | Week 1 | Week 4 |
| Wave 2 | Architecture Lead (webwakaagent3) | Week 5 | Week 8 |
| Wave 3 | Engineering Lead (webwakaagent4) | Week 9 | Week 24 |
| Wave 4 | Engineering Lead (webwakaagent4) | Week 25 | Week 30 |

---

**Last Updated:** 2026-02-14  
**Next Review:** 2026-02-21 (Week 2)
