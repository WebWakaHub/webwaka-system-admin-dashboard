# SVM (Minimum Viable Merchant + Inventory Synchronization) Specification

**Module ID:** Module 9
**Module Name:** SVM (Minimum Viable Merchant + Inventory Synchronization)
**Version:** 1.0
**Date:** 2026-02-10
**Status:** DRAFT
**Author:** webwakaagent3 (Architecture)
**Reviewers:** webwakaagent4 (Engineering), webwakaagent5 (Quality)

---

## 1. Module Overview

### 1.1 Purpose

This module introduces the **Minimum Viable Merchant (MVM)**, a lightweight merchant account with essential features for small businesses, and **Inventory Synchronization**, a service to keep inventory levels consistent across all sales channels.

### 1.2 Scope

**In Scope:**
- MVM account creation and management
- Product and inventory management for MVMs
- Real-time inventory synchronization across POS and online stores
- Basic sales and order tracking for MVMs

**Out of Scope:**
- Advanced merchant features (e.g., staff accounts, detailed analytics)
- Integration with third-party inventory management systems
- Customer relationship management (CRM) features

### 1.3 Success Criteria

- [ ] MVM accounts can be created and managed
- [ ] MVMs can add and manage products and inventory
- [ ] Inventory levels are synchronized in real-time across all channels
- [ ] Basic sales and order data is tracked for MVMs

---

## 2. Requirements

### 2.1 Functional Requirements

**FR-1: MVM Account Management**
- **Description:** Users can sign up for an MVM account, manage their profile, and configure basic settings.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Users can create an MVM account with email, password, and business name.
  - [ ] MVMs can update their profile information (business name, contact info).
  - [ ] MVMs can configure basic settings (currency, language).

**FR-2: Product Management**
- **Description:** MVMs can add, edit, and delete products.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] MVMs can add products with name, description, price, and images.
  - [ ] MVMs can edit existing product details.
  - [ ] MVMs can delete products.

**FR-3: Inventory Management**
- **Description:** MVMs can manage inventory levels for their products.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] MVMs can set initial stock levels for each product.
  - [ ] MVMs can manually adjust stock levels.
  - [ ] MVMs can view current stock levels for all products.

**FR-4: Inventory Synchronization**
- **Description:** Inventory levels are automatically updated in real-time across all sales channels.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] When a sale is made on the POS, inventory is updated for the online store.
  - [ ] When a sale is made on the online store, inventory is updated for the POS.
  - [ ] Inventory updates are reflected in real-time (<5 seconds).

### 2.2 Non-Functional Requirements

**NFR-1: Performance**
- **Requirement:** Inventory synchronization latency < 5 seconds.
- **Measurement:** Time from sale completion to inventory update.
- **Acceptance Criteria:** 99% of updates complete within 5 seconds.

**NFR-2: Scalability**
- **Requirement:** Support 10,000 MVMs with 1,000 products each.
- **Measurement:** System performance under simulated load.
- **Acceptance Criteria:** System maintains performance targets with 10,000 MVMs.

**NFR-3: Reliability**
- **Requirement:** 99.9% uptime for inventory synchronization service.
- **Measurement:** Uptime monitoring.
- **Acceptance Criteria:** Less than 45 minutes of downtime per month.

---

## 3. Architecture

### 3.1 System Architecture

The SVM module will be built as a microservice within the WebWaka platform. It will consist of two main components:

1. **MVM Service:** Manages MVM accounts, products, and basic sales data.
2. **Inventory Synchronization Service:** A real-time service that listens for sales events and updates inventory levels across all channels.

### 3.2 Data Flow

1. A sale is made on either the POS or the online store.
2. A `sale.completed` event is published to the event bus.
3. The Inventory Synchronization Service subscribes to this event.
4. The service updates the inventory levels in the MVM database.
5. The updated inventory is pushed to all connected clients (POS, online store) via WebSockets.

---

## 4. API Specification

### 4.1 MVM Service API

- `POST /api/v1/mvm/accounts` - Create MVM account
- `GET /api/v1/mvm/accounts/:accountId` - Get MVM account details
- `PUT /api/v1/mvm/accounts/:accountId` - Update MVM account
- `POST /api/v1/mvm/products` - Add product
- `GET /api/v1/mvm/products` - Get all products
- `GET /api/v1/mvm/products/:productId` - Get product by ID
- `PUT /api/v1/mvm/products/:productId` - Update product
- `DELETE /api/v1/mvm/products/:productId` - Delete product
- `POST /api/v1/mvm/inventory` - Set inventory level
- `GET /api/v1/mvm/inventory` - Get all inventory levels

### 4.2 Inventory Synchronization API (Internal)

- `POST /api/v1/inventory/sync` - Trigger manual inventory sync

---

## 5. Data Model

**MVM Account:**
- `accountId` (string, PK)
- `businessName` (string)
- `email` (string)
- `passwordHash` (string)
- `currency` (string)
- `language` (string)

**Product:**
- `productId` (string, PK)
- `accountId` (string, FK)
- `name` (string)
- `description` (string)
- `price` (Money)
- `images` (string[])

**Inventory:**
- `inventoryId` (string, PK)
- `productId` (string, FK)
- `stockLevel` (number)
- `updatedAt` (Date)

---

## 6. Dependencies

- **Commerce Shared Primitives:** Money, Product, Order
- **POS Module:** For sales events
- **Event Bus:** For real-time eventing
- **WebSockets:** For real-time client updates

---

## 7. Compliance

### 7.1 Architectural Invariants

| Invariant | Coverage |
|---|---|
| Offline-First | MVM data cached locally for offline access |
| Event-Driven | Inventory sync is fully event-driven |
| Plugin-First | SVM is a modular plugin |
| Multi-Tenant | All data is tenant-scoped by `accountId` |
| Permission-Driven | Access to MVM data is permission-based |
| API-First | All functionality exposed via REST API |
| Mobile-First & Africa-First | MVM dashboard is mobile-responsive |
| Audit-Ready | All inventory changes are logged |
| Nigerian-First | NGN currency support, local payment gateways |
| PWA-First | MVM dashboard is a PWA |

### 7.2 Compliance Checklists

- **Nigerian-First:** All requirements met.
- **Mobile-First & PWA-First:** All requirements met.
- **Africa-First:** All requirements met.

---

## 8. Testing Requirements

- **Unit Tests:** 100% code coverage for all components.
- **Integration Tests:** Test MVM service and Inventory Synchronization service.
- **End-to-End Tests:** Test full sales flow with inventory sync.
- **Performance Tests:** Test inventory sync latency under load.

---

## 9. Documentation Requirements

- **Module Documentation:** Comprehensive documentation for SVM module.
- **API Documentation:** Detailed API documentation for all endpoints.
- **Usage Examples:** Examples for creating MVM accounts, managing products, and verifying inventory sync.
