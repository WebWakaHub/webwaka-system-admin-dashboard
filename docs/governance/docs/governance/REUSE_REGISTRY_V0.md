# Reuse Registry v0

**Date:** 2026-02-14
**Status:** ACTIVE - Interim Registry Under Construction
**Authority:** Chief of Staff (webwakaagent1)

---

## Purpose

This registry is the canonical source of truth for all platform capabilities. Before creating any new capability, you MUST search this registry. If a capability exists, you must reuse or extend it. If you believe a new capability is required, you must submit an ARB review.

**Law:** If it is not in this registry, it does not exist as a reusable capability.

---

## High-Risk Domains (Require ARB Review for New Capabilities)

| Capability | Owning Team | Layer | Status | Known Overlaps | Description |
|---|---|---|---|---|---|
| **Identity & Auth** | TBD | Platform | Active | user-identity | User authentication, authorization, SSO, OAuth |
| **Payments** | TBD | Platform | Active | payment-billing | Payment processing, gateway integration, transactions |
| **Messaging & Communication** | webwakaagent4 | Shared Service | Active | communication-tools, module-system/communication, sites-funnels-email-campaign-builder | SMS, Email, Push, In-App messaging |
| **Membership Management** | webwakaagent4 | Shared Service | Active | member-management, user-identity | Member profiles, roles, permissions |
| **Events & Booking** | webwakaagent4 | Shared Service | Active | events, event-system, booking-scheduling, hospitality-booking-engine | Event creation, registration, attendance, booking |
| **Donations & Fundraising** | webwakaagent4 | Shared Service | Active | donations, fundraising-module | Donation processing, campaigns, recurring donations |
| **Inventory** | TBD | Shared Service | Active | inventory-sync | Inventory tracking, stock management |
| **Orders** | TBD | Shared Service | Active | commerce, sales | Order processing, fulfillment |
| **Pricing** | TBD | Shared Service | Active | economic-engine | Pricing rules, discounts, promotions |

---

## Platform-Level Capabilities

| Capability | Owning Team | Layer | Status | Known Overlaps | Description |
|---|---|---|---|---|---|
| **AI Abstraction Layer** | TBD | Platform | Active | ai-abstraction-layer | AI model integration, prompt management |
| **AI Extension Framework** | TBD | Platform | Active | ai-extension-framework | AI capability extensions |
| **Analytics & Reporting** | TBD | Platform | Active | analytics-reporting, political-analytics-module | Data analytics, reporting, dashboards |
| **Audit System** | TBD | Platform | Active | audit-system | Audit trails, compliance logging |
| **Fraud Prevention** | TBD | Platform | Active | fraud-prevention | Fraud detection, risk management |
| **Search & Discovery** | TBD | Platform | Active | search-discovery | Search indexing, full-text search |
| **Plugin System** | TBD | Platform | Active | plugin-system | Plugin architecture, extensions |
| **Module System** | TBD | Platform | Active | module-system | Module loading, dependency management |
| **Event System** | TBD | Platform | Active | event-system | Event bus, pub/sub, event-driven architecture |

---

## Shared Services

| Capability | Owning Team | Layer | Status | Known Overlaps | Description |
|---|---|---|---|---|---|
| **Booking & Scheduling** | TBD | Shared Service | Active | booking-scheduling, hospitality-booking-engine | Appointment booking, calendar management |
| **Campaign Management** | TBD | Shared Service | Active | campaign-management | Marketing campaigns, email campaigns |
| **Contract Management** | TBD | Shared Service | Active | contract-management | Contract creation, signing, storage |
| **Headless CMS** | TBD | Shared Service | Active | headless-cms | Content management, content delivery |
| **Logistics** | TBD | Shared Service | Active | logistics, fleet-management, transportation | Logistics, delivery, fleet management |
| **No-Code Builder** | TBD | Shared Service | Active | no-code-builder | Visual application builder |
| **POS (Point of Sale)** | TBD | Shared Service | Active | pos | Point of sale, retail transactions |
| **Website Builder** | TBD | Shared Service | Active | website-builder, sites-funnels-website-builder | Website creation, templates |

---

## Suite-Specific Modules (Should NOT Be Duplicated)

| Capability | Owning Team | Layer | Status | Known Overlaps | Description |
|---|---|---|---|---|---|
| **Community Organizing** | TBD | Suite | Active | community-organizing-module, community-platform | Community management, organizing tools |
| **Constituency Management** | TBD | Suite | Active | constituency-management | Political constituency tracking |
| **Hospitality Management** | TBD | Suite | Active | hospitality-property-management, hospitality-guest-management, hospitality-channel-management | Hotel/property management |
| **Motor Park Management** | TBD | Suite | Active | motor-park, transport-company | Transport terminal management |
| **Polling & Results** | TBD | Suite | Active | polling-results | Election polling, results tracking |
| **Voter Engagement** | TBD | Suite | Active | voter-engagement-module | Voter outreach, engagement |
| **Sites & Funnels** | TBD | Suite | Active | sites-funnels-landing-page-builder, sites-funnels-sales-funnel-builder, sites-funnels-form-builder | Landing pages, sales funnels, forms |

---

## Shared Utilities

| Capability | Owning Team | Layer | Status | Known Overlaps | Description |
|---|---|---|---|---|---|
| **Shared Libraries** | TBD | Platform | Active | shared | Common utilities, helpers, types |
| **MVM (Module Version Manager)** | TBD | Platform | Active | mvm | Module versioning, dependency resolution |
| **SVM (Service Version Manager)** | TBD | Platform | Active | svm | Service versioning, API versioning |

---

## Critical Duplication Alerts

The following capabilities have known overlaps and are scheduled for migration:

1. **Donations vs Fundraising:** `donations` vs. `fundraising-module` - **Wave 1 Priority**
2. **Events vs Booking:** `events` vs. `event-system` vs. `booking-scheduling` vs. `hospitality-booking-engine` - **Wave 1 Priority**
3. **Member vs User:** `member-management` vs. `user-identity` - **Wave 2 Priority**
4. **Communication Fragmentation:** `communication-tools` vs. `module-system/communication` vs. `sites-funnels-email-campaign-builder` - **Wave 2 Priority**

---

## How to Use This Registry

1. **Before starting any new task:** Search this registry for existing capabilities.
2. **If found:** Complete a `REUSE_DECLARATION.md` indicating reuse or extension.
3. **If not found:** Complete a `REUSE_DECLARATION.md` and submit to ARB for new capability approval.
4. **If unsure:** Escalate to Chief of Staff or ARB.

---

**Last Updated:** 2026-02-14
**Next Review:** 2026-02-21
