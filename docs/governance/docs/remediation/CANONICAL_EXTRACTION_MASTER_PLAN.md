# Canonical Extraction Master Plan (CEMP)

**Authority:** Founder  
**Executor:** webwaka007  
**Priority:** SYSTEM-CRITICAL  
**Status:** DRAFT

---

## 0. Why This Mandate Exists

Forensic review of the platform reality has produced an undeniable conclusion:

The modular, reusable, capability-driven architecture we intended to govern does not yet physically exist in the codebase.

We currently have:
- suites acting as monoliths
- duplicated engines
- registries that do not match code
- undefined ownership
- broken dependency routing

Therefore:

**Enforcement before extraction is impossible.**

**You cannot police a city that has not been built.**

---

## 1. Immediate Strategic Shift

Effective immediately:

- No new governance sophistication
- No new enforcement layers
- No new blueprints
- No new suites
- No refactoring disguised as feature work

Until we create real, separable, canonical capabilities.

---

## 2. The Mission

This document designs the transformation that converts:

**Monolithic Reality → Canonical Modular Platform**

This is structural surgery.

---

## 3. End State Required (Non-Negotiable)

At completion of the extraction program:
1. Suites contain zero core business logic
2. Capabilities live in independent modules
3. Every reusable function has a single authoritative home
4. Dependencies flow inward, never sideways
5. Registry matches code
6. Ownership is real, named, enforceable
7. Future reuse becomes mechanical

---



## 5. Canonical Target Allocation

| Classification | Target Repository | Purpose |
|---|---|---|
| PLATFORM_CORE_INFRASTRUCTURE | `webwaka-modules-*` / `webwaka-platform-core` | Foundational, non-business logic |
| PLATFORM_CORE_AI | `webwaka-platform-core` | Universal AI infrastructure |
| PLATFORM_CORE_IDENTITY | `webwaka-platform-core` | Universal identity & access |
| PLATFORM_UTILITIES | `webwaka-platform-core` | Shared utilities |
| PLATFORM_CAPABILITY_* | `webwaka-platform-capabilities` | Reusable business primitives |
| SUITE_MONOLITHIC_* | `webwaka-suite-*` | Thin orchestration layers (post-extraction) |

---

## 6. Extraction Sequencing Logic (5 Waves)

### WAVE 1 - Platform Core Infrastructure (5 capabilities)

**Must be extracted first as they are foundational dependencies.**

- audit-system
- event-system
- module-system
- modules
- plugin-system

### WAVE 2 - Platform Core (Identity, AI, Utilities) (4 capabilities)

- ai-abstraction-layer
- ai-extension-framework
- shared
- user-identity

### WAVE 3 - Platform Capabilities (Core & Shared) (10 capabilities)

- analytics-reporting
- booking-scheduling
- communication-tools
- contract-management
- fraud-prevention
- headless-cms
- member-management
- no-code-builder
- payment-billing
- search-discovery

### WAVE 4 - Platform Capabilities (Domain-Specific) (12 capabilities)

- commerce
- community-platform
- donations
- economic-engine
- events
- fundraising-module
- inventory-sync
- logistics
- mvm
- pos
- sales
- svm

### WAVE 5 - Suite Extraction (LAST) (20 capabilities)

**Suites must be converted to thin orchestration layers AFTER all capabilities are extracted.**

- campaign-management
- community-organizing-module
- constituency-management
- fleet-management
- hospitality-booking-engine
- hospitality-channel-management
- hospitality-guest-management
- hospitality-property-management
- motor-park
- political-analytics-module
- polling-results
- sites-funnels-email-campaign-builder
- sites-funnels-form-builder
- sites-funnels-landing-page-builder
- sites-funnels-sales-funnel-builder
- sites-funnels-website-builder
- transport-company
- transportation
- voter-engagement-module
- website-builder

---

## 7. Dependency Re-Routing Plan

1. **Extraction:** Move capability code from `webwaka-platform` to target repository (e.g., `webwaka-platform-capabilities`).
2. **Publication:** Publish extracted capability as a versioned package (e.g., `@webwaka/payment-billing@1.0.0`).
3. **Installation:** Add the new package as a dependency to `webwaka-platform`'s `package.json`.
4. **Re-Routing:** Update all internal imports (e.g., `from '../payment-billing/...'`) to external package imports (e.g., `from '@webwaka/payment-billing'`).
5. **Validation:** Run tests to ensure re-routed dependencies work correctly.
6. **Cleanup:** Once all consumers are re-routed, the original capability directory in `webwaka-platform` can be deleted.

---

## 8. Suite Conversion Model

Suites will be converted from monolithic modules to thin orchestration layers:

- **Experience Layer:** UI/UX components specific to the suite.
- **Orchestration:** Business logic that composes platform capabilities (e.g., a `bookHotelRoom` function that calls `booking-scheduling`, `payment-billing`, and `user-identity` capabilities).
- **Configuration:** Suite-specific configuration and settings.

**Suites will contain ZERO core business logic.**

---

## 9. Ownership Establishment

| Capability | Proposed Owner | Decision Authority |
|---|---|---|
| **PLATFORM_CORE** | webwakaagent2 (Platform Core Team) | ARB + Founder |
| **PLATFORM_CAPABILITIES** | webwakaagent3 (Capabilities Team) | ARB + Founder |
| **SUITES** | webwakaagent4 (Suites Team) | ARB + Founder |

**Note:** This is a proposed ownership model. Final ownership will be assigned by Founder.

---

## 10. Registry Rebuild Logic

1. **Automated Discovery:** The capability registry will be rebuilt automatically from the codebase by scanning for `@webwaka/*` packages in `package.json` files.
2. **Single Source of Truth:** The codebase becomes the single source of truth for what capabilities exist.
3. **CI Enforcement:** CI will fail any build where a capability is used without being a declared dependency.

---

## 11. Completion Definition

Extraction is complete when:

1. All 51 capabilities have been extracted into their target repositories.
2. All suites have been converted to thin orchestration layers.
3. `webwaka-platform` contains only suite orchestration code and no core business logic.
4. The capability registry is 100% automated from the codebase.
5. All tests pass after re-routing.

Only then can enforcement regimes operate.
