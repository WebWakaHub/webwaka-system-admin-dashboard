# Order Management Module - Comprehensive Documentation

**Module:** Logistics Suite - Module 2  
**Version:** 1.0  
**Date:** 2026-02-13  
**Author:** webwakaagent3 (Core Platform Architect)  
**Status:** Production Ready

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [Architecture](#architecture)
3. [API Reference](#api-reference)
4. [Data Model](#data-model)
5. [Business Logic](#business-logic)
6. [Integration Guide](#integration-guide)
7. [Deployment Guide](#deployment-guide)
8. [Operations Guide](#operations-guide)

---

## Module Overview

The Order Management module provides comprehensive order processing capabilities for the WebWaka platform. It manages the complete order lifecycle from creation through delivery, with seamless integration points for inventory, payment, and shipping systems.

### Key Features

The module supports order creation and validation with multi-item support, enabling customers to place orders with multiple products in a single transaction. The order status workflow management tracks orders through their complete lifecycle from pending to delivered status. Inventory reservation integration ensures products are available and reserved when orders are confirmed. Payment integration support enables processing of payments through multiple gateways. Shipping integration support allows tracking of shipments through various carriers. Order tracking and history provide complete visibility into order status and changes. Order cancellation and refund processing handle customer-initiated cancellations with proper inventory release. Multi-channel order support enables orders from web, mobile, and API channels. Real-time order updates via events keep all systems synchronized. Multi-tenant isolation ensures complete data separation between tenants. Nigerian-First compliance includes NGN as default currency with multi-currency support.

### Business Value

The module delivers streamlined order processing with automated workflows, reducing manual intervention and processing time. Real-time order visibility provides customers and staff with up-to-date order status information. Automated fulfillment workflows ensure orders move efficiently through the fulfillment process. Reduced order processing errors through validation and automated checks improve accuracy. Improved customer satisfaction results from faster processing and better visibility. Multi-channel order management enables consistent order handling across all sales channels.

---

## Architecture

### Component Structure

The Order Management module follows a layered architecture with clear separation of concerns. The **Models Layer** contains TypeORM entities (Order, OrderItem) with business logic methods for state management and validation. The **Repository Layer** provides data access with multi-tenant isolation, implementing the repository pattern for clean data access. The **Service Layer** implements core business logic for order lifecycle management, inventory integration, and event publishing. The **Controller Layer** exposes REST API endpoints with authentication, authorization, and request validation. The **Events Layer** publishes order lifecycle events to the event bus for integration with other modules.

### Technology Stack

The implementation uses **TypeScript** for type-safe code with excellent IDE support. **TypeORM** provides database ORM with migration support and query building. **PostgreSQL** serves as the primary database with ACID compliance and excellent performance. **Express.js** handles HTTP server and routing. **RabbitMQ** manages the event bus for asynchronous messaging. **Jest** provides the testing framework with excellent TypeScript support.

### Design Patterns

The module implements several design patterns for maintainability and scalability. The **Repository Pattern** separates data access logic from business logic. The **Service Layer Pattern** encapsulates business logic in reusable services. The **Event-Driven Architecture** enables loose coupling between modules. The **DTO Pattern** provides clear API contracts with validation. The **Factory Pattern** creates test data and fixtures. The **Strategy Pattern** handles different payment and shipping providers.

---

## API Reference

### Authentication

All API endpoints require JWT authentication. The JWT token must be included in the Authorization header as a Bearer token. The token contains the tenant_id which is used for multi-tenant isolation.

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Create Order

**Endpoint:** `POST /api/v1/orders`

**Description:** Creates a new order with one or more items.

**Request Body:**
```json
{
  "customer_id": "uuid",
  "items": [
    {
      "sku": "PROD-001",
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 5000
    }
  ],
  "shipping_address": {
    "street": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "postal_code": "100001",
    "country": "Nigeria",
    "phone": "+234-xxx-xxx-xxxx"
  },
  "billing_address": {
    "street": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "postal_code": "100001",
    "country": "Nigeria"
  },
  "notes": "Please deliver before 5pm",
  "currency": "NGN"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "order_number": "ORD-1234567890-001",
    "customer_id": "uuid",
    "order_date": "2026-02-13T10:00:00Z",
    "status": "pending",
    "subtotal": 10000,
    "tax": 0,
    "shipping_cost": 0,
    "total": 10000,
    "currency": "NGN",
    "payment_status": "pending",
    "shipping_address": {...},
    "billing_address": {...},
    "notes": "Please deliver before 5pm",
    "items": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "sku": "PROD-001",
        "product_id": "uuid",
        "quantity": 2,
        "unit_price": 5000,
        "total_price": 10000
      }
    ],
    "created_at": "2026-02-13T10:00:00Z",
    "updated_at": "2026-02-13T10:00:00Z"
  }
}
```

### Get Order

**Endpoint:** `GET /api/v1/orders/:id`

**Description:** Retrieves a specific order by ID with tenant isolation.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "order_number": "ORD-1234567890-001",
    "status": "confirmed",
    ...
  }
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "error": "Order not found"
}
```

### List Orders

**Endpoint:** `GET /api/v1/orders`

**Query Parameters:**
- `customer_id` (optional): Filter by customer
- `status` (optional): Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)
- `payment_status` (optional): Filter by payment status
- `from_date` (optional): Filter orders from date (ISO 8601)
- `to_date` (optional): Filter orders to date (ISO 8601)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "orders": [...],
    "total": 50,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

### Confirm Order

**Endpoint:** `POST /api/v1/orders/:id/confirm`

**Description:** Confirms an order, reserves inventory, and processes payment.

**Request Body:**
```json
{
  "payment_method": "card",
  "payment_reference": "PAY-12345"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "payment_status": "paid",
    ...
  }
}
```

### Cancel Order

**Endpoint:** `POST /api/v1/orders/:id/cancel`

**Description:** Cancels an order, releases inventory, and processes refund.

**Request Body:**
```json
{
  "reason": "Customer requested cancellation",
  "refund_amount": 10000
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "status": "cancelled",
    ...
  }
}
```

### Ship Order

**Endpoint:** `POST /api/v1/orders/:id/ship`

**Description:** Marks an order as shipped with tracking information.

**Request Body:**
```json
{
  "carrier_code": "DHL",
  "tracking_number": "TRK-1234567890",
  "shipment_date": "2026-02-13T14:00:00Z"
}
```

### Deliver Order

**Endpoint:** `POST /api/v1/orders/:id/deliver`

**Description:** Marks an order as delivered.

**Request Body:**
```json
{
  "delivery_date": "2026-02-15T16:30:00Z",
  "delivered_to": "John Doe",
  "signature": "base64-encoded-signature",
  "photo_url": "https://..."
}
```

---

## Data Model

### Order Entity

The Order entity represents a customer order with complete order information and lifecycle management.

**Fields:**
- `id` (UUID): Primary key, auto-generated
- `tenant_id` (UUID): Multi-tenant isolation, indexed
- `order_number` (string): Unique order number per tenant
- `customer_id` (UUID): Reference to customer
- `order_date` (timestamp): Order creation date
- `status` (enum): Order status (pending, confirmed, processing, shipped, delivered, cancelled)
- `subtotal` (decimal): Sum of all item totals
- `tax` (decimal): Tax amount
- `shipping_cost` (decimal): Shipping cost
- `total` (decimal): Total order amount (subtotal + tax + shipping_cost)
- `currency` (string): Currency code (default: NGN)
- `payment_status` (enum): Payment status (pending, paid, refunded, failed)
- `shipping_address` (JSON): Shipping address details
- `billing_address` (JSON): Billing address details
- `notes` (text): Order notes
- `created_at` (timestamp): Record creation timestamp
- `updated_at` (timestamp): Record update timestamp

**Indexes:**
- Unique index on (tenant_id, order_number)
- Index on (tenant_id, customer_id)
- Index on (tenant_id, status)
- Index on (tenant_id, order_date)

### OrderItem Entity

The OrderItem entity represents individual line items within an order.

**Fields:**
- `id` (UUID): Primary key
- `order_id` (UUID): Foreign key to Order
- `sku` (string): Product SKU
- `product_id` (UUID): Reference to product
- `quantity` (integer): Quantity ordered
- `unit_price` (decimal): Price per unit
- `total_price` (decimal): Total price (quantity * unit_price)
- `inventory_reservation_id` (UUID): Link to inventory reservation

**Relationships:**
- Many-to-One relationship with Order (cascade delete)

---

## Business Logic

### Order Lifecycle

The order lifecycle follows a defined state machine with specific transitions allowed between states. Orders begin in **pending** status when created. They move to **confirmed** status when payment is processed and inventory is reserved. The **processing** status indicates the order is being prepared for shipment. Orders move to **shipped** status when handed to the carrier. Finally, orders reach **delivered** status when received by the customer. Orders can be moved to **cancelled** status from pending, confirmed, or processing states.

### State Transitions

Valid state transitions are enforced by business logic. From **pending**, orders can transition to confirmed (via confirmation) or cancelled (via cancellation). From **confirmed**, orders can move to processing (via fulfillment start), shipped (via shipment), or cancelled (via cancellation). From **processing**, orders can move to shipped (via shipment) or cancelled (via cancellation). From **shipped**, orders can only move to delivered (via delivery confirmation). The **delivered** and **cancelled** states are terminal states with no further transitions allowed.

### Inventory Integration

The Order Management module integrates with the Inventory Management module for stock management. On order confirmation, inventory is reserved for all order items, preventing overselling. On order cancellation, reserved inventory is released back to available stock. Before order creation, availability can be checked to prevent orders for out-of-stock items. Inventory reservation IDs are stored in OrderItem entities for tracking.

### Event Publishing

The module publishes events at key points in the order lifecycle. The **order.created** event is published when an order is created, containing order details and items. The **order.confirmed** event is published when an order is confirmed, including inventory reservation IDs. The **order.cancelled** event is published when an order is cancelled, including cancellation reason and refund amount. The **order.shipped** event is published when an order is shipped, including carrier and tracking information. The **order.delivered** event is published when an order is delivered, including delivery date and recipient.

---

## Integration Guide

### Integrating with Inventory Management

To integrate with the Inventory Management module, listen for order events and call inventory APIs. On **order.confirmed** event, the inventory reservations are already created. On **order.cancelled** event, call the inventory API to release reservations. Before creating orders, optionally check inventory availability via the inventory API.

### Integrating with Payment Systems

To integrate with payment systems, listen for **order.created** events to initiate payment processing. On successful payment, call the confirm order API. On payment failure, call the cancel order API with appropriate reason. Store payment references in the order for reconciliation.

### Integrating with Shipping Systems

To integrate with shipping systems, listen for **order.confirmed** events to create shipments. When shipment is created, call the ship order API with tracking information. On delivery confirmation, call the deliver order API with delivery details.

---

## Deployment Guide

### Prerequisites

Ensure PostgreSQL 14+ is installed and configured. RabbitMQ 3.9+ should be set up for event messaging. Node.js 18+ with TypeScript support is required. Environment variables must be configured for database connection, JWT secret, and event bus connection.

### Database Setup

Run TypeORM migrations to create tables and indexes. Ensure proper database user permissions are set. Configure connection pooling for production load. Set up database backups and replication.

### Application Deployment

Build the TypeScript code to JavaScript. Set environment variables for production. Start the application server. Configure reverse proxy (nginx) for load balancing. Set up SSL/TLS certificates for HTTPS. Configure monitoring and logging.

---

## Operations Guide

### Monitoring

Monitor key metrics including order creation rate (orders per minute), order confirmation rate (percentage of orders confirmed), order cancellation rate (percentage of orders cancelled), average order value, API response times, database query performance, and event publishing success rate.

### Logging

Log all order lifecycle events including creation, confirmation, cancellation, shipment, and delivery. Log all API requests and responses. Log all errors with stack traces. Log all inventory operations. Log all payment operations.

### Troubleshooting

Common issues and solutions include failed order confirmations (check inventory availability and payment status), slow API responses (check database indexes and query performance), event publishing failures (check RabbitMQ connection and queue status), and cross-tenant data access (verify JWT token and tenant_id extraction).

---

**Document Status:** COMPLETE  
**Author:** webwakaagent3 (Core Platform Architect)  
**Date:** 2026-02-13  
**Next Step:** Validation Checkpoint (Step 389)
