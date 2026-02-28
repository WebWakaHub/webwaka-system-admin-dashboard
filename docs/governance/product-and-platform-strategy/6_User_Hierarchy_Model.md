# User Hierarchy Model

**Document Type:** Product & Platform Strategy
**Department:** Product & Platform Strategy (webwakaagent2)
**Status:** DRAFT

---

## 1. Introduction

This document defines the canonical user hierarchy for the WebWaka platform. This model is fundamental to the platform's multi-tenancy and delegation capabilities, establishing a clear structure for access, control, and data ownership. It is designed to be flexible enough to accommodate a wide range of business models while maintaining a secure and logical separation of concerns.

## 2. Hierarchy Levels

The WebWaka platform employs a five-tiered user hierarchy.

| Level | Role | Description | Scope of Control |
|---|---|---|---|
| 1 | **Super Admin** | The highest level of authority, typically held by WebWaka platform administrators. | Manages the entire platform, including partner onboarding, suite configuration, and system-wide settings. Has visibility into all platform data. |
| 2 | **Partner** | An organization that licenses the WebWaka platform to offer services to its own customers (Tenants). | Manages a portfolio of Tenants. Can customize branding, set pricing (within platform limits), and manage tenant lifecycle. |
| 3 | **Tenant** | A business or organization that uses a Partner's services to run its operations. | Manages its own business operations within a specific suite (e.g., a multi-vendor marketplace or a transport cooperative). Manages its own users (Vendors, End Users). |
| 4 | **Vendor / Agent** | An individual or sub-entity operating within a Tenant's ecosystem. | Manages their own specific activities, such as a seller managing their products in a marketplace or a booking agent selling tickets. |
| 5 | **End User** | The final customer interacting with a Tenant's or Vendor's services. | Interacts with the platform to purchase goods, book services, or consume content. Has control only over their own personal data and activities. |

## 3. Example Scenario: Multi-Vendor Marketplace

- **Super Admin:** WebWaka team provisions the Commerce Suite.
- **Partner:** A commercial bank licenses the Commerce Suite to offer to its SME customers.
- **Tenant:** An entrepreneur uses the Partner's offering to create a marketplace for local artisans.
- **Vendor:** An individual artisan signs up to sell their crafts on the Tenant's marketplace.
- **End User:** A customer buys a handmade bag from the artisan's storefront on the marketplace.

This hierarchical structure ensures that each level has the appropriate level of access and control, creating a scalable and governable ecosystem.
