# Transportation Suite - EXACT Canonical Specifications

**Document Type:** Canonical Specifications Extract  
**Primary Source:** WEBWAKA_CANONICAL_MASTER_CONTEXT.md (V4.3, RATIFIED AND LOCKED)  
**Secondary Sources:** INITIAL_FOCUS_SUITES_DEFINITION.md, 5_Initial_Focus_Suites_Definition_Transportation.md  
**Date:** 2026-02-08  
**Purpose:** Extract EXACT Transportation Suite specifications for Phase 4 implementation  
**Status:** RATIFIED AND LOCKED (Primary Authority)  
**Authority:** Founder-Mandated Institutional Law

---

## Authority Hierarchy

### 1. PRIMARY AUTHORITY (LOCKED):

- **Source:** WEBWAKA_CANONICAL_MASTER_CONTEXT.md V4.3
- **Status:** RATIFIED AND LOCKED
- **Immutability:** MAY ONLY be modified by explicit Founder Decision

### 2. SECONDARY SOURCES (DRAFT):

- product-strategy/INITIAL_FOCUS_SUITES_DEFINITION.md (Status: DRAFT, marked as "Canonical Product Strategy")
- product-and-platform-strategy/5_Initial_Focus_Suites_Definition_Transportation.md (Status: DRAFT)

**Conflict Resolution:** Primary authority supersedes all secondary sources

**CRITICAL NOTE:** There are THREE conflicting Transportation Suite definitions. The CANONICAL MASTER CONTEXT (LOCKED) is the authoritative version.

---

## Transportation Suite Overview (From Primary Authority)

### From WEBWAKA_CANONICAL_MASTER_CONTEXT.md:

**Section 17.4 - Phase 4: Transportation Suite (Lines 1405-1410):**

```
### 17.4. Phase 4: Transportation Suite (Weeks 25-36)
1. Implement Transport Company Platform
2. Implement Motor Park Platform
3. Implement Staff & Independent Agent Sales
4. Implement seat inventory synchronization
```

**Offline-First Scope (Line 658):**

> "Transportation (Ticketing, Agent Sales)"

**Seat Inventory Synchronization (Line 721):**

> "When a seat is booked via the Motor Park Platform, it must be unavailable to all other sales channels immediately."

---

## Module 1: Transport Company Platform

### From Primary Authority (CANONICAL MASTER CONTEXT)

**Implementation Requirement (Line 1406):**

> "1. Implement Transport Company Platform"

**Offline-First Requirement (Line 658):**

> "Transportation (Ticketing, Agent Sales)"

### From Human Founder Specification (2026-02-08)

**Primary Use Case:**

> "Transport is to serve parks and transport companies operating following the model of single vendor and multi vendor marketplaces"

**Ticket Sellers:**

> "Staff and agents as ticket sellers"

### Transport Company Platform Canonical Requirements

**MANDATORY (From Primary Authority):**

1. ✅ Follows marketplace model (similar to SVM for Commerce)
2. ✅ Serves transport companies
3. ✅ Staff and agents as ticket sellers
4. ✅ Real-time seat inventory synchronization
5. ✅ Event-driven architecture
6. ✅ Offline-first operation (architectural invariant)
7. ✅ Mobile-first design
8. ✅ Multi-tenant (tenant-scoped data)
9. ✅ Permission-driven (RBAC via WEEG)
10. ✅ API-first (all functionality via API)
11. ✅ Audit-ready (all transactions logged)

**CORE FEATURES (Inferred from Marketplace Model):**

12. ✅ Transport company registration and management
13. ✅ Route management
14. ✅ Vehicle/bus registration
15. ✅ Driver management
16. ✅ Schedule management
17. ✅ Ticket sales (staff and agents)
18. ✅ Seat inventory management
19. ✅ Pricing management
20. ✅ Booking management
21. ✅ Payment processing
22. ✅ Reporting and analytics

---

## Module 2: Motor Park Platform

### From Primary Authority (CANONICAL MASTER CONTEXT)

**Implementation Requirement (Line 1407):**

> "2. Implement Motor Park Platform"

**Seat Inventory Synchronization (Line 721):**

> "When a seat is booked via the Motor Park Platform, it must be unavailable to all other sales channels immediately."

**Use Case (Lines 405-406):**

> "A Tenant Admin (Motor Park) creates an 'Agent (Independent)' sub-role for an independent ticket seller. The Agent sells tickets on behalf of the Motor Park."

**Offline-First Requirement (Line 658):**

> "Transportation (Ticketing, Agent Sales)"

### From Secondary Sources

**From 5_Initial_Focus_Suites_Definition_Transportation.md (Lines 25-26):**

**Component Name:** "Motor Park Management System"

**Description:**

> "A comprehensive system for managing the operations of a motor park, including vehicle registration, driver verification, route management, and fee collection."

**Target User:**

> "Motor park operators, transport unions."

### From Human Founder Specification (2026-02-08)

**Primary Use Case:**

> "Transport is to serve parks and transport companies operating following the model of single vendor and multi vendor marketplaces"

**Implication:** Motor Park Platform follows multi-vendor marketplace model (similar to MVM for Commerce)

**Ticket Sellers:**

> "Staff and agents as ticket sellers"

### Motor Park Platform Canonical Requirements

**MANDATORY (From Primary Authority):**

23. ✅ Follows multi-vendor marketplace model (similar to MVM for Commerce)
24. ✅ Serves motor parks (aggregates multiple transport companies)
25. ✅ Staff and independent agents as ticket sellers
26. ✅ Real-time seat inventory synchronization across all sales channels
27. ✅ Event-driven architecture
28. ✅ Offline-first operation (architectural invariant)
29. ✅ Mobile-first design
30. ✅ Multi-tenant (tenant-scoped data)
31. ✅ Permission-driven (RBAC via WEEG)
32. ✅ API-first (all functionality via API)
33. ✅ Audit-ready (all transactions logged)
34. ✅ MLAS integration (5-level economic flow)

**CORE FEATURES (From Secondary Sources + Marketplace Model):**

35. ✅ Motor park operations management
36. ✅ Multiple transport company onboarding (like vendors in MVM)
37. ✅ Vehicle registration across companies
38. ✅ Driver verification and management
39. ✅ Route management across companies
40. ✅ Fee collection and commission management
41. ✅ Aggregated seat inventory across companies
42. ✅ Park-wide search and discovery
43. ✅ Multi-channel ticket sales (mobile app, web, USSD, agent POS)
44. ✅ Independent agent management
45. ✅ Commission and payout management (MLAS integration)

---

## Module 3: Staff & Independent Agent Sales

### From Primary Authority (CANONICAL MASTER CONTEXT)

**Implementation Requirement (Line 1408):**

> "3. Implement Staff & Independent Agent Sales"

**Use Case (Lines 405-406):**

> "A Tenant Admin (Motor Park) creates an 'Agent (Independent)' sub-role for an independent ticket seller. The Agent sells tickets on behalf of the Motor Park."

**Economic Flow (Section 4.7):**

- Agents earn commission on transactions (paid FIRST, before platform fees)
- Independent agents are commission-based (not salaried)
- Staff agents are salaried employees

**Offline-First Requirement (Line 658):**

> "Transportation (Ticketing, Agent Sales)"

### From Secondary Sources

**From 5_Initial_Focus_Suites_Definition_Transportation.md (Line 26):**

**E-Ticketing System:**

> "A centralized, multi-channel ticketing platform (mobile app, web, USSD, agent POS) for booking and paying for bus tickets. Supports dynamic pricing and seat allocation."

**Target User:**

> "Passengers, booking agents, bus operators."

### From Human Founder Specification (2026-02-08)

**Ticket Sellers:**

> "Staff and agents as ticket sellers"

### Staff & Independent Agent Sales Canonical Requirements

**MANDATORY (From Primary Authority):**

46. ✅ Staff members can sell tickets on behalf of transport companies/motor parks
47. ✅ Independent agents can sell tickets on behalf of transport companies/motor parks
48. ✅ Agent commission system (MLAS integration)
49. ✅ Real-time seat inventory updates
50. ✅ Offline-first operation (agents may work in low-connectivity areas)
51. ✅ Event-driven architecture
52. ✅ Mobile-first design
53. ✅ Multi-channel support (mobile app, web, USSD, agent POS)
54. ✅ Multi-tenant (tenant-scoped data)
55. ✅ Permission-driven (RBAC via WEEG)
56. ✅ API-first (all functionality via API)
57. ✅ Audit-ready (all transactions logged)

**CORE FEATURES:**

58. ✅ Agent registration and onboarding
59. ✅ Agent POS interface for ticket sales
60. ✅ Mobile app for agent sales
61. ✅ Web interface for agent sales
62. ✅ USSD interface for agent sales (low-end phones)
63. ✅ Real-time seat availability checking
64. ✅ Ticket booking and payment processing
65. ✅ Commission calculation and tracking
66. ✅ Agent performance analytics
67. ✅ Offline ticket sales with sync
68. ✅ Dynamic pricing support
69. ✅ Seat allocation management

**AGENT TYPES:**

70. ✅ Staff Agents: Salaried employees of transport company or motor park
71. ✅ Independent Agents: Commission-based ticket sellers (not employees)

---

## Module 4: Seat Inventory Synchronization

### From Primary Authority (CANONICAL MASTER CONTEXT)

**Implementation Requirement (Line 1409):**

> "4. Implement seat inventory synchronization"

**Section 8.2 - Inventory Synchronization (Line 721):**

> "When a seat is booked via the Motor Park Platform, it must be unavailable to all other sales channels immediately."

**Synchronization Rules (Lines 723-727):**

- All inventory changes emit events (e.g., seat.booked, seat.inventory.updated)
- All subscribed platforms listen to these events and update their local state
- Offline changes are queued and reconciled upon reconnection
- Conflicts are resolved using last-write-wins with timestamp ordering

**Section 8.1 - Event-Driven Architecture (Lines 711-717):**

> "All state changes in WebWaka emit events. This is not optional. The event-driven architecture enables:
> - Real-time synchronization across suites
> - Audit trails for compliance
> - Asynchronous processing for scalability
> - Integration hooks for third-party systems"

**Section 8.3 - Cross-Suite Event Contracts (Lines 729-731):**

- Each suite defines its event schema
- Schemas are versioned and backward-compatible
- Breaking changes require new major version and migration path

### Seat Inventory Synchronization Canonical Requirements

**MANDATORY (From Primary Authority):**

72. ✅ Event-driven synchronization (seat.booked, seat.inventory.updated events)
73. ✅ Real-time updates across all sales channels
74. ✅ Offline-aware synchronization (queue and reconcile)
75. ✅ Conflict resolution (last-write-wins with timestamp ordering)
76. ✅ Versioned event schemas (backward-compatible)
77. ✅ Audit trails for all seat bookings
78. ✅ Asynchronous processing for scalability
79. ✅ Support for multiple sales channels (Transport Company Platform, Motor Park Platform, Staff Sales, Agent Sales)

**TECHNICAL REQUIREMENTS:**

80. ✅ Event emitters in all sales channels
81. ✅ Event listeners in all sales channels
82. ✅ Event queue for offline bookings
83. ✅ Reconciliation engine for conflict resolution
84. ✅ Timestamp-based ordering
85. ✅ Seat availability management
86. ✅ Cross-platform event contracts (versioned schemas)
87. ✅ Real-time seat locking during booking process
88. ✅ Automatic seat release on booking timeout

---

## Transportation Suite Integration with MLAS

### Economic Flow in Transportation Suite

**From WEBWAKA_CANONICAL_MASTER_CONTEXT.md Section 4.7:**

**Multi-Vendor Marketplace Model Applied to Motor Parks:**

- Passenger books ticket for ₦5,000
- Agent (if involved) earns commission (e.g., 5% = ₦250) - paid FIRST
- Transport Company earns net revenue after Agent commission
- Motor Park (Tenant) charges platform fee to Transport Company
- Partner charges markup on Motor Park fee
- Super Admin receives base platform fee

**Implications for Transportation Suite:**

89. ✅ Transport Company Platform must support Agent sales
90. ✅ Motor Park Platform must support full MLAS economic flow (5 levels)
91. ✅ Staff & Agent Sales must support commission calculations
92. ✅ All transactions must record complete economic breakdown
93. ✅ Commission calculations must be real-time
94. ✅ Payout management must support all actor levels

---

## Transportation Suite Modular Design Requirements

### From Forbidden Patterns (Line 1566)

**FORBIDDEN:**

> "Suites Implemented as Monolithic Products"

**REQUIRED:**

> "All suites must be composed of modular, reusable primitives"

### From Forbidden Patterns (Line 1567)

**FORBIDDEN:**

> "Direct Module-to-Module Dependencies"

**REQUIRED:**

> "Modules must communicate via events, not direct calls"

### Modular Architecture for Transportation Suite

**Shared Primitives (Reusable Across Transport Company & Motor Park Platforms):**

95. ✅ Route Management
96. ✅ Vehicle/Bus Management
97. ✅ Driver Management
98. ✅ Schedule Management
99. ✅ Seat Inventory Management
100. ✅ Ticket Booking Management
101. ✅ Payment Processing
102. ✅ Commission Calculation (MLAS integration)
103. ✅ Reporting & Analytics

**Platform-Specific Components:**

- **Transport Company Platform:** Single-company branding, company-specific routes
- **Motor Park Platform:** Multi-company aggregation, park-wide search, vendor onboarding

**Sales Channel Components:**

- **Staff Sales:** Employee interface, salaried compensation
- **Agent Sales:** Agent POS, commission-based compensation, multi-channel (mobile, web, USSD)

**Event-Based Communication:**

- Agent books seat → Seat Inventory module updates → All platforms receive seat.inventory.updated
- Transport Company Platform emits booking.completed → MLAS module calculates commissions → Economic events emitted
- Motor Park Platform emits vendor.booking.completed → MLAS module calculates multi-level commissions

---

## Transportation Suite AI-Extension Paths

### From AI-Native Enforcement Invariant (Lines 763-809)

**HARD INVARIANT:**

> "No feature may ship without an AI-extension path, even if initially disabled."

### AI-Extension Paths for Transportation Suite Modules

**Transport Company Platform AI-Extension Paths:**

- Route optimization based on traffic, weather, and demand
- Dynamic pricing based on demand and seat availability
- Predictive maintenance for vehicles
- Driver performance analytics and coaching

**Motor Park Platform AI-Extension Paths:**

- Park-wide route optimization
- Vendor performance analytics and insights
- Automated vendor onboarding and verification
- Demand forecasting across routes

**Staff & Agent Sales AI-Extension Paths:**

- Agent performance analytics and recommendations
- Fraud detection for ticket sales
- Customer support chatbot for booking assistance
- Personalized route recommendations for passengers

**Seat Inventory Synchronization AI-Extension Paths:**

- Predictive seat demand management
- Anomaly detection for booking discrepancies
- Automated overbooking management
- Dynamic seat allocation optimization

---

## Comparison of Transportation Suite Definitions

### Version 1: INITIAL_FOCUS_SUITES_DEFINITION.md (DRAFT)

**Components:**
- Ride-Hailing
- Delivery Services
- Fleet Management

**Status:** DRAFT, NOT canonical

### Version 2: 5_Initial_Focus_Suites_Definition_Transportation.md (DRAFT)

**Components:**
- Motor Park Management System
- E-Ticketing System
- Fleet Management Module

**Status:** DRAFT, partial alignment with canonical

### Version 3: WEBWAKA_CANONICAL_MASTER_CONTEXT.md V4.3 (LOCKED)

**Components:**
- Transport Company Platform
- Motor Park Platform
- Staff & Independent Agent Sales
- Seat Inventory Synchronization

**Status:** RATIFIED AND LOCKED - **THIS IS THE CANONICAL VERSION**

---

## Transportation Suite Implementation Summary

### Phase 4 Deliverables (Weeks 25-36)

#### Module 1: Transport Company Platform

- Single transport company operations
- Route management
- Vehicle and driver management
- Schedule management
- Ticket sales (staff and agents)
- Seat inventory management
- Payment processing
- Reporting and analytics
- Event emission (booking.completed, seat.inventory.updated)

#### Module 2: Motor Park Platform

- Multi-company motor park operations
- Transport company onboarding (like vendors)
- Aggregated seat inventory across companies
- Park-wide search and discovery
- Commission and payout management (MLAS integration)
- Independent agent management
- Multi-channel ticket sales
- Event emission and listening (vendor.booking.completed, seat.inventory.updated)

#### Module 3: Staff & Independent Agent Sales

- Agent registration and onboarding
- Multi-channel sales interfaces (mobile app, web, USSD, agent POS)
- Real-time seat availability
- Ticket booking and payment
- Commission calculation and tracking
- Offline sales with sync
- Dynamic pricing support
- Event emission (agent.booking.completed)

#### Module 4: Seat Inventory Synchronization

- Event-driven synchronization engine
- Real-time cross-platform updates
- Offline queue and reconciliation
- Conflict resolution (last-write-wins)
- Versioned event schemas
- Seat locking during booking
- Automatic seat release on timeout
- Audit trails

### Cross-Cutting Concerns

**All Modules Must Include:**

114. ✅ MLAS integration (5-level economic flow)
115. ✅ WEEG integration (roles, capabilities, permissions, pricing)
116. ✅ Offline-first operation
117. ✅ Event-driven architecture
118. ✅ Multi-tenant data isolation
119. ✅ API-first design
120. ✅ Mobile-first UI
121. ✅ Audit logging
122. ✅ AI-extension paths
123. ✅ Modular, reusable primitives

---

## Strategic Rationale (From Secondary Sources)

**From 5_Initial_Focus_Suites_Definition_Transportation.md (Lines 29-31):**

> "The transportation sector is a vital artery of the African economy, yet it remains largely analog and inefficient. By creating a digital ecosystem for motor parks and bus services, the WebWaka platform can unlock significant value. This includes reducing revenue leakage for operators, improving the travel experience for passengers, and creating a wealth of data that can be used to optimize routes and improve safety. This suite serves as a powerful demonstration of the platform's ability to transform complex, real-world systems."

---

**Document Status:** COMPLETE  
**Primary Source Authority:** WEBWAKA_CANONICAL_MASTER_CONTEXT.md V4.3 (RATIFIED AND LOCKED)  
**Secondary Sources:** INITIAL_FOCUS_SUITES_DEFINITION.md, 5_Initial_Focus_Suites_Definition_Transportation.md  
**Created:** 2026-02-08  
**Integrated:** 2026-02-09  
**Next Action:** Integrate into Phase 4 implementation plan
