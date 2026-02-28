# MVM (Multi-Vendor Management) Module Documentation

**Module ID:** Module 10
**Module Name:** MVM (Multi-Vendor Management)
**Version:** 1.0
**Date:** 2026-02-11
**Status:** ✅ COMPLETE
**Author:** webwakaagent3 (Core Platform Architect)

---

## 1. Module Overview

### 1.1 Purpose

The MVM (Multi-Vendor Management) module provides the core functionality for a multi-vendor marketplace within the WebWaka platform. It enables independent vendors to register, manage their own digital storefronts, list products, process orders, and receive payments, transforming a single-entity e-commerce site into a thriving ecosystem of sellers.

### 1.2 Scope

**In Scope:**
- Vendor account registration and onboarding
- A dedicated dashboard for each vendor
- Vendor-specific product and inventory management
- Vendor order management and fulfillment tracking
- Automated commission calculation for the platform owner
- Payout management system for vendors

**Out of Scope:**
- Advanced marketing and promotional tools for vendors
- Direct, real-time chat between vendors and customers (future consideration)
- Complex, multi-jurisdictional tax calculation and reporting
- Vendor-specific shipping carrier integrations

### 1.3 Core Features

- **Vendor Management:** Complete lifecycle management from registration to approval and suspension.
- **Product Management:** Vendor-specific product catalogs with inventory control.
- **Order Management:** Multi-vendor order routing and fulfillment tracking.
- **Commission Engine:** Automated commission calculation and tracking.
- **Payout System:** Payout aggregation and management for vendors.

---

## 2. Architecture

### 2.1 High-Level Architecture

The MVM module is designed as a set of loosely coupled microservices that communicate via a combination of REST APIs and an event bus. This architecture ensures scalability, resilience, and maintainability.

**Core Components:**

- **Vendor Service:** Manages the lifecycle of vendors, including registration, onboarding, and profile management.
- **Product Service:** Handles vendor-specific product catalogs, inventory, and pricing.
- **Order Service:** Processes incoming orders and routes order items to the appropriate vendors for fulfillment.
- **Commission Service:** Calculates and records platform commissions on each sale.
- **Payout Service:** Manages the aggregation of vendor earnings and the payout process.

### 2.2 Microservices Overview

| Service | Description | Responsibilities |
| :--- | :--- | :--- |
| **Vendor Service** | Manages vendor accounts | Registration, onboarding, profile management, approval workflow |
| **Product Service** | Manages vendor products | Product catalog, inventory, pricing, vendor-specific product management |
| **Order Service** | Manages order fulfillment | Order routing, order item management, fulfillment tracking |
| **Commission Service** | Manages platform commissions | Commission calculation, commission ledger, commission tracking |
| **Payout Service** | Manages vendor payouts | Payout aggregation, payout status tracking, payout history |

---

## 3. API Documentation

The MVM module exposes a comprehensive REST API for managing vendors, products, orders, and payouts. All endpoints are prefixed with `/api/v1/mvm`.

### 3.1 Vendor Endpoints

**POST /vendors**
- **Description:** Registers a new vendor.
- **Request Body:**
```json
{
  "email": "vendor@example.com",
  "store_name": "My Awesome Store",
  "business_name": "My Business Inc.",
  "business_address": "123 Main St, Lagos, Nigeria",
  "payment_method": "bank_transfer",
  "payment_details": {
    "account_number": "1234567890",
    "bank_code": "058"
  }
}
```
- **Response:** `201 Created` with the newly created vendor object.

**GET /vendors/:vendorId**
- **Description:** Retrieves details for a specific vendor.
- **Response:** `200 OK` with the vendor object.

**PUT /vendors/:vendorId**
- **Description:** Updates a vendor's profile.
- **Request Body:** Partial vendor object with fields to update.
- **Response:** `200 OK` with the updated vendor object.

**POST /vendors/:vendorId/approve**
- **Description:** Approves a pending vendor.
- **Response:** `200 OK` with the updated vendor object.

### 3.2 Product Endpoints

**POST /products**
- **Description:** Creates a new product for a vendor.
- **Request Body:**
```json
{
  "vendor_id": "<vendor-uuid>",
  "name": "My Awesome Product",
  "description": "This is a great product.",
  "price": 1000,
  "currency": "NGN",
  "inventory_count": 50
}
```
- **Response:** `201 Created` with the newly created product object.

**GET /products/:productId**
- **Description:** Retrieves details for a specific product.
- **Response:** `200 OK` with the product object.

**GET /vendors/:vendorId/products**
- **Description:** Retrieves all products for a specific vendor.
- **Response:** `200 OK` with an array of product objects.

**PUT /products/:productId**
- **Description:** Updates a product's details.
- **Request Body:** Partial product object with fields to update.
- **Response:** `200 OK` with the updated product object.

**DELETE /products/:productId**
- **Description:** Deletes a product.
- **Response:** `204 No Content`.

### 3.3 Order Endpoints

**GET /vendors/:vendorId/orders**
- **Description:** Retrieves all order items for a specific vendor.
- **Response:** `200 OK` with an array of order item objects.

**PUT /order-items/:orderItemId/status**
- **Description:** Updates the fulfillment status of an order item.
- **Request Body:**
```json
{
  "status": "shipped"
}
```
- **Response:** `200 OK` with the updated order item object.

### 3.4 Commission Endpoints

**GET /vendors/:vendorId/commissions**
- **Description:** Retrieves all commissions for a specific vendor.
- **Response:** `200 OK` with an object containing an array of commission objects and the total commission amount.

### 3.5 Payout Endpoints

**GET /vendors/:vendorId/payouts**
- **Description:** Retrieves the payout history for a specific vendor.
- **Response:** `200 OK` with an array of payout objects.

**GET /payouts/pending**
- **Description:** Retrieves all pending payouts (admin only).
- **Response:** `200 OK` with an array of pending payout objects.

**POST /payouts/:payoutId/mark-paid**
- **Description:** Marks a pending payout as paid (admin only).
- **Response:** `200 OK` with the updated payout object.

---

## 4. Event-Driven Architecture

The MVM module is deeply integrated with the WebWaka event bus, allowing for asynchronous communication and loose coupling between services.

### 4.1 Events Consumed

**`platform.order.created`**
- **Description:** Triggered when a new order is placed on the platform.
- **Handler:** The MVM module listens for this event to:
  1. Create individual order items for each product in the order.
  2. Route each order item to the appropriate vendor.
  3. Calculate the platform commission for each order item.
  4. Emit the `mvm.order.processed` event.

### 4.2 Events Produced

**`mvm.order.processed`**
- **Description:** Emitted after an order has been processed and commissions have been calculated.
- **Payload:**
```json
{
  "orderId": "<order-uuid>",
  "vendorId": "<vendor-uuid>",
  "commissionAmount": 100,
  "vendorEarnings": 900
}
```

**`mvm.order.status.updated`**
- **Description:** Emitted when a vendor updates the fulfillment status of an order item.
- **Payload:**
```json
{
  "orderId": "<order-uuid>",
  "orderItemId": "<order-item-uuid>",
  "vendorId": "<vendor-uuid>",
  "status": "shipped",
  "timestamp": "2026-02-11T12:00:00Z"
}
```

**`mvm.payout.created`**
- **Description:** Emitted when a new payout record is created for a vendor.
- **Payload:**
```json
{
  "payoutId": "<payout-uuid>",
  "vendorId": "<vendor-uuid>",
  "amount": 5000,
  "timestamp": "2026-02-11T12:00:00Z"
}
```

---

## 5. Data Models

The MVM module is built upon a set of core data models that represent the key entities in the multi-vendor marketplace.

### 5.1 Vendor

Represents a seller in the marketplace.

| Field | Type | Description |
| :--- | :--- | :--- |
| `vendor_id` | `UUID` | Unique identifier for the vendor |
| `email` | `string` | Vendor's email address (must be unique) |
| `store_name` | `string` | Name of the vendor's storefront (must be unique) |
| `business_name` | `string` | Legal name of the vendor's business |
| `business_address` | `string` | Physical address of the business |
| `payment_method` | `string` | Method for receiving payouts (e.g., `bank_transfer`) |
| `payment_details` | `JSONB` | Details for the selected payment method |
| `status` | `string` | Current status of the vendor (`pending`, `approved`, `suspended`, `inactive`) |
| `created_at` | `Timestamp` | Timestamp of when the vendor was created |
| `updated_at` | `Timestamp` | Timestamp of the last update |

### 5.2 Product

Represents a product listed by a vendor.

| Field | Type | Description |
| :--- | :--- | :--- |
| `product_id` | `UUID` | Unique identifier for the product |
| `vendor_id` | `UUID` | Foreign key referencing the vendor who owns the product |
| `name` | `string` | Name of the product |
| `description` | `string` | Detailed description of the product |
| `price` | `Decimal` | Price of the product |
| `currency` | `string` | Currency of the price (e.g., `NGN`) |
| `inventory_count` | `integer` | Number of items in stock |
| `images` | `string[]` | Array of URLs for product images |
| `status` | `string` | Current status of the product (`active`, `inactive`, `archived`) |
| `created_at` | `Timestamp` | Timestamp of when the product was created |
| `updated_at` | `Timestamp` | Timestamp of the last update |

### 5.3 Order

Represents a customer's order.

| Field | Type | Description |
| :--- | :--- | :--- |
| `order_id` | `UUID` | Unique identifier for the order |
| `customer_id` | `UUID` | Foreign key referencing the customer who placed the order |
| `total_amount` | `Decimal` | Total amount of the order |
| `currency` | `string` | Currency of the order (e.g., `NGN`) |
| `status` | `string` | Current status of the order (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`) |
| `created_at` | `Timestamp` | Timestamp of when the order was created |
| `updated_at` | `Timestamp` | Timestamp of the last update |

### 5.4 OrderItem

Represents an individual item within an order.

| Field | Type | Description |
| :--- | :--- | :--- |
| `order_item_id` | `UUID` | Unique identifier for the order item |
| `order_id` | `UUID` | Foreign key referencing the order |
| `vendor_id` | `UUID` | Foreign key referencing the vendor who owns the product |
| `product_id` | `UUID` | Foreign key referencing the product |
| `quantity` | `integer` | Number of units of the product ordered |
| `unit_price` | `Decimal` | Price of a single unit of the product |
| `subtotal` | `Decimal` | Total price for this order item (`quantity` * `unit_price`) |
| `status` | `string` | Fulfillment status of the order item (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |
| `created_at` | `Timestamp` | Timestamp of when the order item was created |
| `updated_at` | `Timestamp` | Timestamp of the last update |

### 5.5 Commission

Represents the platform's commission on a sale (immutable ledger).

| Field | Type | Description |
| :--- | :--- | :--- |
| `commission_id` | `UUID` | Unique identifier for the commission record |
| `order_item_id` | `UUID` | Foreign key referencing the order item |
| `vendor_id` | `UUID` | Foreign key referencing the vendor |
| `amount` | `Decimal` | Amount of the commission |
| `rate` | `Decimal` | Commission rate at the time of the sale |
| `created_at` | `Timestamp` | Timestamp of when the commission was recorded |

### 5.6 Payout

Represents a payout to a vendor.

| Field | Type | Description |
| :--- | :--- | :--- |
| `payout_id` | `UUID` | Unique identifier for the payout |
| `vendor_id` | `UUID` | Foreign key referencing the vendor |
| `amount` | `Decimal` | Amount of the payout |
| `status` | `string` | Current status of the payout (`pending`, `processing`, `paid`, `failed`) |
| `created_at` | `Timestamp` | Timestamp of when the payout was created |
| `paid_at` | `Timestamp` | Timestamp of when the payout was paid |

---

## 6. Usage Examples

### 6.1 Vendor Onboarding Workflow

1. **Vendor Registration:** A new vendor registers via the `POST /vendors` endpoint.
2. **Admin Approval:** An administrator reviews the pending vendor and approves them via the `POST /vendors/:vendorId/approve` endpoint.
3. **Product Creation:** The approved vendor creates their first product via the `POST /products` endpoint.

### 6.2 Order Fulfillment Workflow

1. **Order Placed:** A customer places an order, triggering the `platform.order.created` event.
2. **Order Processing:** The MVM module processes the event, creating order items and calculating commissions.
3. **Vendor Notification:** The vendor is notified of the new order item.
4. **Fulfillment:** The vendor ships the product and updates the order item status via the `PUT /order-items/:orderItemId/status` endpoint.

### 6.3 Payout Workflow

1. **Sales Accumulate:** The vendor makes sales, and commissions are recorded.
2. **Payout Cycle:** At the end of the payout period, the system aggregates the vendor's earnings.
3. **Payout Creation:** A payout record is created for the vendor.
4. **Admin Payment:** An administrator retrieves pending payouts via the `GET /payouts/pending` endpoint and processes the payments.
5. **Mark as Paid:** The administrator marks the payout as paid via the `POST /payouts/:payoutId/mark-paid` endpoint.

---

## 7. Integration Guide

### 7.1 Integrating with the MVM Module

To integrate with the MVM module, you will need to interact with its REST API and listen for its events on the event bus.

**API Integration:**
- Use a standard HTTP client to make requests to the MVM API endpoints.
- Ensure you handle authentication and authorization correctly.

**Event Integration:**
- Subscribe to the MVM events on the event bus to receive real-time updates.
- Use the event payloads to trigger downstream processes in your own services.

### 7.2 Dependencies

- **Event Bus:** The MVM module requires a running instance of the WebWaka event bus.
- **Database:** The MVM module requires a PostgreSQL database with the specified schema.

---

