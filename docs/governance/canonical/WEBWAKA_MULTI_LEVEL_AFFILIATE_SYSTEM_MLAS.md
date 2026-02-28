# Multi-Level Affiliate System (MLAS) - EXACT Canonical Specifications

**Document Type:** Canonical Specifications Extract  
**Source:** WEBWAKA_CANONICAL_MASTER_CONTEXT.md (V4.3, RATIFIED AND LOCKED)  
**Date:** 2026-02-08  
**Purpose:** Extract EXACT Multi-Level Affiliate System specifications  
**Status:** RATIFIED AND LOCKED  
**Authority:** Founder-Mandated Institutional Law

---

## Authority

**Source Document:**  
`/home/ubuntu/webwaka-governance/canonical/WEBWAKA_CANONICAL_MASTER_CONTEXT.md`

**Version:** V4.3  
**Status:** RATIFIED AND LOCKED  
**Section:** Section 4 - Economic & Affiliate Graph

---

## MLAS Overview

**Canonical Name:** Economic & Affiliate Graph  
**Also Known As:** Multi-Level Affiliate System (MLAS)  
**Status:** NON-NEGOTIABLE (Line 456)

**Definition (Line 456):**

> "The WebWaka platform is designed to support complex, multi-level economic relationships. This section defines the canonical Economic & Affiliate Graph, a non-negotiable model for all revenue sharing, commissions, and remuneration."

---

## Core Principles (Section 4.1, Lines 458-463)

1. **No Hardcoded Economics:** All economic relationships are configurable and inheritable.
2. **Separation of Concerns:** Subscription revenue is distinct from transactional revenue.
3. **Delegable Authority:** Higher-level actors can define economic models for lower-level actors.
4. **Auditability:** All economic events are auditable and traceable.

---

## Revenue Sharing Chains (Section 4.2, Lines 465-474)

### Multi-Level Hierarchy:

**Super Admin (L1) → Partner (L2) → Tenant (L3) → Vendor (L4) → Agent (L5)**

### Economic Authority at Each Level:

- **Super Admin (L1):** Sets the base pricing for the platform
- **Partners (L2):** Can mark up pricing for their Tenants
- **Tenants (L3):** Can charge Vendors subscription fees and/or transaction commissions
- **Vendors (L4):** Can employ Agents and define their commission structures
- **Agents (L5):** Earn commissions on transactions they facilitate

---

## Commission Inheritance & Overrides (Section 4.3, Lines 476-479)

### Inheritance:

Economic models are inherited down the hierarchy unless explicitly overridden.

### Overrides:

Higher-level actors can set limits on the overrides that lower-level actors can apply.

---

## Revenue Types (Section 4.4, Lines 481-484)

### 1. Subscription Revenue:

Recurring fees for access to the platform and its suites.

### 2. Transactional Revenue:

Commissions and fees charged on a per-transaction basis.

---

## Agent Types & Remuneration (Section 4.5, Lines 486-489)

### 1. Staff Agents:

- Salaried employees of a Vendor or Tenant
- Fixed compensation

### 2. Independent Agents:

- Commission-based agents who are not employees
- Percentage-based compensation on transactions

---

## Contractual Boundaries (Section 4.6, Lines 491-494)

- Each level of the hierarchy operates under a distinct contractual agreement
- The platform must support the creation and management of these contracts

---

## End-to-End Transaction Example (Section 4.7, Lines 498-586)

### Transaction Scenario (Lines 502-513)

**Actors:**
- **Partner (L2):** Operates white-labelled platform for SMEs in Nigeria
- **Tenant (L3):** Fashion retailer using Multi-Vendor Marketplace suite
- **Vendor (L4):** Shoe seller on the Tenant's marketplace
- **Agent (L4 sub-role):** Independent sales agent working for the Vendor
- **End User (L5):** Customer purchasing shoes

**Transaction:**
- End User purchases shoes for ₦20,000
- Agent facilitated the sale via referral link

### Economic Flow Breakdown (Lines 515-525)

| Step | Actor | Action | Amount | Running Total |
|------|-------|--------|--------|---------------|
| 1 | End User (L5) | Pays ₦20,000 for shoes | -₦20,000 | ₦0 |
| 2 | Platform | Receives payment and holds in escrow | +₦20,000 | ₦20,000 |
| 3 | Agent (L4 sub-role) | Earns 5% commission (pre-configured by Vendor) | +₦1,000 | ₦19,000 |
| 4 | Vendor (L4) | Earns net revenue after Agent commission | +₦14,000 | ₦5,000 |
| 5 | Tenant (L3) | Charges 20% platform fee on Vendor revenue | +₦3,000 | ₦2,000 |
| 6 | Partner (L2) | Charges 40% markup on Tenant platform fee | +₦1,200 | ₦800 |
| 7 | Super Admin (L1) | Receives base platform fee (remainder) | +₦800 | ₦0 |

### Distribution Summary (Lines 527-536)

**Total Transaction Value:** ₦20,000

**Distribution:**
- **Agent (L4 sub-role):** ₦1,000 (5% of transaction)
- **Vendor (L4):** ₦14,000 (70% of transaction, after Agent commission)
- **Tenant (L3):** ₦3,000 (15% of transaction, platform fee)
- **Partner (L2):** ₦1,200 (6% of transaction, markup on Tenant fee)
- **Super Admin (L1):** ₦800 (4% of transaction, base platform fee)

### Key Observations (Lines 538-543)

1. The Agent earns a commission on the gross transaction value (before platform fees)
2. The Vendor earns the majority of the transaction value (70%)
3. The Tenant earns a platform fee on the Vendor's revenue
4. The Partner earns a markup on the Tenant's platform fee
5. The Super Admin earns the base platform fee (the remainder after all other deductions)

---

## Revenue Routing Rules (Section 4.7.4, Lines 545-567)

### Rule 1: Commission Precedence (Lines 547-549)

- Agent commissions are deducted FIRST, before any platform fees
- This ensures that sales agents are always compensated, regardless of platform fee structures

### Rule 2: Platform Fee Inheritance (Lines 551-553)

- Platform fees flow UPWARD through the actor hierarchy (Tenant → Partner → Super Admin)
- Each level can define their own fee structure, subject to limits set by the level above

### Rule 3: Markup Limits (Lines 555-557)

**Partners can set markup limits for their Tenants:**
- Example: "Tenants cannot charge Vendors more than 25% platform fee"

**Tenants can set commission limits for their Vendors:**
- Example: "Vendors cannot offer Agents more than 10% commission"

### Rule 4: Auditability (Lines 559-567)

**Every transaction must record:**
- Gross transaction value
- Agent commission (if applicable)
- Vendor net revenue
- Tenant platform fee
- Partner markup
- Super Admin base fee
- All economic events are immutable and auditable

---

## Alternative Scenarios (Section 4.7.5, Lines 569-585)

### Scenario A: No Agent Involved (Lines 571-573)

- If the transaction is completed without an Agent, the Agent commission (₦1,000) is added to the Vendor's net revenue
- New Vendor revenue: ₦15,000 (instead of ₦14,000)

### Scenario B: Direct Tenant (No Partner) (Lines 575-577)

- If the Tenant is a direct client of the Super Admin (no Partner intermediary), the Partner markup (₦1,200) is added to the Super Admin's base fee
- New Super Admin fee: ₦2,000 (instead of ₦800)

### Scenario C: Subscription-Only Model (Lines 579-585)

- If the Tenant uses a subscription-only model (no transaction fees), the Vendor pays a fixed monthly fee (e.g., ₦50,000/month) instead of per-transaction fees

**Economic flow:**
- Vendor pays ₦50,000/month to Tenant
- Tenant pays ₦20,000/month to Partner (40% markup)
- Partner pays ₦12,000/month to Super Admin (60% of Partner fee)
- Super Admin retains ₦12,000/month as base platform fee

---

## Economic Leakage, Fraud & Abuse Prevention (Section 4E, Lines 589-625)

### Critical Requirement (Line 591):

> "WebWaka acknowledges that real-world platforms fail not only from poor design, but from economic leakage, abuse, and informal bypassing. The platform MUST proactively detect, deter, and mitigate such risks."

### Threat Classes Addressed (Lines 593-598)

- Off-platform settlements bypassing platform fees
- Shadow inventory and unrecorded sales
- Fake or circular agent commissions
- Self-dealing and role abuse
- Excessive AI, SMS, or API cost abuse

### Enforcement Principles (Lines 600-625)

#### 1. Event-Based Anomaly Detection (Lines 602-606)

The platform MUST emit events sufficient to detect:
- Transaction pattern anomalies
- Commission irregularities
- Inventory inconsistencies

#### 2. Progressive Enforcement Model (Lines 608-614)

Enforcement MUST follow a graduated model:
1. Detect
2. Warn
3. Throttle
4. Suspend
5. Escalate

#### 3. Human Review Integration (Lines 616-617)

Automated flags MUST be reviewable by authorized humans with full context.

#### 4. No Silent Penalties (Lines 619-620)

Economic enforcement actions MUST be visible, explainable, and auditable.

#### 5. Offline-Aware Fraud Controls (Lines 622-623)

Fraud detection MUST account for delayed sync and offline batching.

### Critical Statement (Line 625):

> "Leakage prevention is a core platform responsibility, not an optional add-on."

---

## MLAS Implementation Requirements

### Technical Requirements

#### 1. Configurable Economic Models

- All commission rates, platform fees, and markups must be configurable
- Configuration must be inheritable down the hierarchy
- Higher levels can set limits on lower levels

#### 2. Real-Time Economic Calculations

- Transaction processing must calculate all splits in real-time
- Escrow management for transaction funds
- Automated distribution to all levels

#### 3. Auditability & Compliance

- Immutable transaction records
- Complete audit trail for all economic events
- Compliance with financial regulations

#### 4. Fraud Prevention

- Event-based anomaly detection
- Progressive enforcement mechanisms
- Human review workflows
- Offline-aware fraud controls

#### 5. Contract Management

- Support for contractual agreements at each level
- Contract creation and management interfaces
- Contract enforcement mechanisms

#### 6. Multi-Currency Support

- Support for local currencies (₦, KES, GHS, etc.)
- Currency conversion where needed
- Exchange rate management

---

## Glossary (From Line 1665)

### Affiliate Graph:

> "The economic model for multi-level revenue sharing and commission inheritance. The Affiliate Graph defines how commissions flow from End Users to Super Admin."

**Common Misinterpretation:**

> "❌ Confusing Affiliate Graph with Actor Hierarchy (Affiliate Graph is economic, Actor Hierarchy is organizational)"

---

## Forbidden Patterns (From Line 1564)

**FORBIDDEN:**

> "Hardcoded Roles, Pricing, Permissions, or Economics: All such configurations must be managed through the WEEG."

**Requirement:**
- All economic relationships MUST be configurable
- NO hardcoded commission rates
- NO hardcoded platform fees
- NO hardcoded pricing

---

## Summary

The Multi-Level Affiliate System (MLAS), canonically known as the **Economic & Affiliate Graph**, is a **NON-NEGOTIABLE** platform capability that enables:

1. **5-Level Revenue Sharing:** Super Admin → Partner → Tenant → Vendor → Agent
2. **Configurable Economics:** All rates, fees, and commissions are configurable and inheritable
3. **Dual Revenue Streams:** Subscription revenue + Transactional revenue
4. **Commission Precedence:** Agents paid first, then platform fees flow upward
5. **Fraud Prevention:** Event-based detection, progressive enforcement, human review
6. **Auditability:** Immutable records, complete audit trails, regulatory compliance

**Status:** MUST be implemented as a core platform capability, not an optional feature.

---

**Document Status:** COMPLETE  
**Source Authority:** WEBWAKA_CANONICAL_MASTER_CONTEXT.md V4.3 (RATIFIED AND LOCKED)  
**Created:** 2026-02-08  
**Integrated:** 2026-02-09  
**Next Action:** Integrate into Phase 3 implementation plan
