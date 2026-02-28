# Revenue Sharing Rules

**Document Type:** Governance Guide
**Department:** Platform Ecosystem & Extensibility
**Owning Agent:** webwakaagent7
**Status:** FINAL
**Authority:** FD-2026-001, FD-2026-002
**Related Founder Decisions:** FD-2026-001, FD-2026-002
**Version:** 1.1
**Last Updated:** 2026-02-06

---

## 1. Purpose

This document outlines the revenue sharing rules for all paid plugins sold on the WebWakaHub Plugin Marketplace. The purpose of these rules is to provide a clear and transparent framework for how revenue is shared between plugin developers, partners, and WebWakaHub, in accordance with the economic model defined in the `WEBWAKA_CANONICAL_MASTER_CONTEXT.md` [1].

---

## 2. Canonical Context

This guide operates within the zero-based governance model established by FD-2026-001 and the economic and environmental invariants defined in the `WEBWAKA_CANONICAL_MASTER_CONTEXT.md` [1]. It is a key component of the Plugin Marketplace Rules and is designed to be a fair and equitable system for all parties involved.

---

## 3. Revenue Sharing Model

The revenue sharing model is based on the actor hierarchy defined in the `WEBWAKA_CANONICAL_MASTER_CONTEXT.md` [1]. The following table illustrates the flow of revenue from a plugin sale:

| Actor | Level | Role | Revenue Share |
| :--- | :--- | :--- | :--- |
| **Super Admin** | L1 | Platform Owner | Receives platform fees from Partners. |
| **Partner** | L2 | Manages Tenants | Sets platform fees for Tenants and earns a share of their revenue. |
| **Tenant** | L3 | Manages Vendors | Sets commissions for Vendors and earns a share of their revenue. |
| **Vendor** | L4 | Sells to Customers | Earns a commission on plugin sales. |
| **Agent** | L5 | Facilitates Sales | Earns a commission on plugin sales, deducted before platform fees. |

### 3.1. Commission Precedence

Agent commissions are deducted first, before any platform fees. This ensures that sales agents are always compensated for their efforts, regardless of the platform fee structures.

### 3.2. Platform Fee Inheritance

Platform fees flow upward through the actor hierarchy (Tenant → Partner → Super Admin). Each level can define their own fee structure, subject to limits set by the level above.

### 3.3. Markup Limits

Partners can set markup limits for their Tenants, and Tenants can set commission limits for their Vendors. This provides a mechanism for controlling the overall cost of using the platform and preventing excessive fees.

---

## 4. Non-Goals

- This document does not define the pricing of plugins on the marketplace.
- This document does not cover the payment processing fees associated with plugin sales.
- This document does not describe the process for developers to receive their revenue share payments.

---

## 5. Long-Term Implications

A clear and fair revenue sharing model will incentivize developers to create high-quality paid plugins for the WebWakaHub Plugin Marketplace. This will create a new revenue stream for both developers and WebWakaHub, and it will help to fund the ongoing development and maintenance of the platform. A poorly designed or unfair revenue sharing model, on the other hand, will discourage developers from creating paid plugins, limiting the growth and potential of the marketplace.

---

## 6. References

[1] WebWakaHub. (2026). *WEBWAKA_CANONICAL_MASTER_CONTEXT.md*. webwaka-governance. Retrieved from https://github.com/WebWakaHub/webwaka-governance/blob/master/WEBWAKA_CANONICAL_MASTER_CONTEXT.md
