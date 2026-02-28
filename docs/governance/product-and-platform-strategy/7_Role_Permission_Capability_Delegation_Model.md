# Role, Permission, and Capability Delegation Model

**Document Type:** Product & Platform Strategy
**Department:** Product & Platform Strategy (webwakaagent2)
**Status:** DRAFT

---

## 1. Core Concepts

This document defines the model for managing access control on the WebWaka platform, building upon the established User Hierarchy Model. The system is based on three core concepts:

- **Roles:** A collection of permissions that represents a specific job function or level of access (e.g., "Tenant Administrator", "Marketplace Vendor", "Support Agent").
- **Permissions:** A granular definition of a single action that can be performed on a specific resource (e.g., `CREATE_PRODUCT`, `VIEW_ORDER`, `DELETE_USER`).
- **Capabilities:** A feature or module of the platform that can be enabled or disabled for a given Tenant (e.g., "Multi-Vendor Marketplace", "E-Ticketing System").

## 2. Delegation Model

The WebWaka platform uses a top-down delegation model that flows through the user hierarchy.

| Level | Delegation Authority |
|---|---|
| **Super Admin** | Defines the master list of all Permissions and Capabilities available on the platform. Assigns available Capabilities to Partners. |
| **Partner** | Creates and manages a set of default Roles for their Tenants based on the Capabilities they have been assigned. Can assign these Roles to Tenant administrators. |
| **Tenant** | Can assign the default Roles provided by the Partner to their internal users. Can also create custom Roles by combining the granular Permissions available within their assigned Capabilities. |

## 3. Key Principles

- **Principle of Least Privilege:** Users should only be granted the minimum permissions necessary to perform their job function. Custom roles created by Tenants must be composed of permissions from within the capabilities assigned to them.
- **Inheritance:** Permissions and roles flow downwards. A Partner cannot grant a Tenant a capability it does not have, and a Tenant cannot grant a user a permission it does not have.
- **Separation of Concerns:** The Super Admin manages what is *possible* on the platform (Permissions & Capabilities). The Partner manages what is *offered* to their customers (Default Roles). The Tenant manages who can do *what* within their own organization (Role Assignments).

## 4. Example: Tenant Custom Role

1.  **Super Admin** defines the `CREATE_PRODUCT`, `EDIT_PRODUCT`, and `VIEW_ORDERS` permissions as part of the "Commerce Suite" capability.
2.  **Partner** is assigned the "Commerce Suite" capability.
3.  **Tenant** (a marketplace owner) wants to create a role for a junior inventory manager. They create a new custom role named "Inventory Clerk" and assign it only the `CREATE_PRODUCT` and `EDIT_PRODUCT` permissions. They do *not* assign the `VIEW_ORDERS` permission, adhering to the principle of least privilege.

This model provides a powerful and flexible system for managing access control across a complex multi-tenant ecosystem, balancing centralized governance with decentralized operational control.
