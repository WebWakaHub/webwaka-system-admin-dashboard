# Commerce Shared Primitives Documentation

**Module:** Commerce Shared Primitives  
**Module ID:** Shared-01  
**Version:** 1.0  
**Date:** February 10, 2026  
**Author:** webwakaagent3 (Core Platform Architect)

---

## 1. Introduction

This document provides comprehensive documentation for the **Commerce Shared Primitives** module. These primitives are the foundational building blocks for all commerce-related functionality within the WebWaka platform, ensuring consistency, type safety, and interoperability across the entire Commerce Suite.

This document covers:
- The purpose and scope of each of the 8 primitives
- Detailed API documentation for each primitive
- Usage examples for common operations
- Integration guidelines for other modules

---

## 2. Core Primitives

The Commerce Shared Primitives module consists of 8 core primitives:

1.  **Money:** Immutable representation of monetary values with currency.
2.  **Product:** Core product entity with pricing, variants, and inventory.
3.  **Order:** Complete order representation with items, totals, and status.
4.  **Payment:** Payment transaction with status, method, and reconciliation.
5.  **Inventory:** Stock levels and availability tracking across locations.
6.  **Shipment:** Shipping information, tracking, and status.
7.  **Customer:** Customer profile, addresses, and commerce history.
8.  **Cart:** Shopping cart with items, totals, and persistence.

---

## 3. Money Primitive

The `Money` primitive provides a type-safe, immutable representation of monetary values. It prevents common errors such as currency mixing and floating-point inaccuracies.

### 3.1 API Documentation

**`new Money(amount: number, currency: string)`**

Creates a new `Money` instance.

-   `amount`: The monetary amount (e.g., `100.50`).
-   `currency`: The currency code (e.g., `"NGN"`, `"USD"`).

**`add(other: Money): Money`**

Adds another `Money` value. Throws an error if currencies do not match.

**`subtract(other: Money): Money`**

Subtracts another `Money` value. Throws an error if currencies do not match.

**`multiply(factor: number): Money`**

Multiplies the `Money` value by a factor.

**`divide(divisor: number): Money`**

Divides the `Money` value by a divisor.

**`equals(other: Money): boolean`**

Checks if two `Money` values are equal.

**`isZero(): boolean`**

Checks if the `Money` value is zero.

**`format(): string`**

Formats the `Money` value as a string (e.g., `"₦10,000.00"`).

### 3.2 Usage Example

```typescript
import { Money } from "./Money";

// Create Money instances
const price = new Money(10000, "NGN");
const tax = new Money(750, "NGN");

// Perform calculations
const total = price.add(tax);

// Format for display
console.log(total.format()); // Output: ₦10,750.00
```

---

## 4. Product Primitive

The `Product` primitive represents a product with its variants, pricing, and inventory information.

### 4.1 API Documentation

**`new Product(id: string, sku: string, name: string, description: string, price: Money)`**

Creates a new `Product` instance.

**`addVariant(id: string, name: string, attributes: Record<string, string>, price?: Money, sku?: string)`**

Adds a new variant to the product.

**`setInventory(quantity: number)`**

Sets the inventory level for the product.

**`addImage(url: string)`**

Adds an image URL to the product.

### 4.2 Usage Example

```typescript
import { Product } from "./Product";
import { Money } from "./Money";

// Create a product
const product = new Product(
  "prod-123",
  "SKU-TSHIRT-L",
  "WebWaka T-Shirt",
  "High-quality branded t-shirt",
  new Money(5000, "NGN")
);

// Add a variant
product.addVariant("var-456", "Large", { size: "L" });

// Set inventory
product.setInventory(100);
```

---

## 5. Order Primitive

The `Order` primitive represents a customer order with all its details.

### 5.1 API Documentation

**`new Order(id: string, customerId: string, currency: string, billingAddress: IOrderAddress, shippingAddress: IOrderAddress)`**

Creates a new `Order` instance.

**`addItem(productId: string, name: string, quantity: number, unitPrice: Money, variantId?: string)`**

Adds an item to the order.

**`updateStatus(status: OrderStatus)`**

Updates the order status.

**`markPaid()`**

Marks the order as paid.

### 5.2 Usage Example

```typescript
import { Order, IOrderAddress } from "./Order";
import { Money } from "./Money";

const billingAddress: IOrderAddress = { street: "123 Main St", city: "Lagos", state: "Lagos", postalCode: "100001", country: "Nigeria" };
const shippingAddress: IOrderAddress = { street: "123 Main St", city: "Lagos", state: "Lagos", postalCode: "100001", country: "Nigeria" };

// Create an order
const order = new Order("order-456", "cust-789", "NGN", billingAddress, shippingAddress);

// Add an item
order.addItem("prod-123", "WebWaka T-Shirt", 2, new Money(5000, "NGN"));

// Update status
order.updateStatus("confirmed");
```

---

## 6. Payment Primitive

The `Payment` primitive represents a payment transaction.

### 6.1 API Documentation

**`new Payment(id: string, orderId: string, amount: Money, method: PaymentMethod)`**

Creates a new `Payment` instance.

**`authorize(reference: string)`**

Authorizes the payment.

**`capture()`**

Captures the authorized payment.

**`refund()`**

Refunds the payment.

### 6.2 Usage Example

```typescript
import { Payment, PaymentMethod } from "./Payment";
import { Money } from "./Money";

// Create a payment
const payment = new Payment("pay-789", "order-456", new Money(10000, "NGN"), PaymentMethod.CREDIT_CARD);

// Authorize and capture
payment.authorize("ref-xyz");
payment.capture();
```

---

## 7. Inventory Primitive

The `Inventory` primitive manages stock levels for products.

### 7.1 API Documentation

**`new Inventory(id: string, productId: string)`**

Creates a new `Inventory` instance.

**`addLocation(locationId: string, locationName: string)`**

Adds a new inventory location.

**`addInventory(locationId: string, quantity: number)`**

Adds stock to a location.

**`reserveInventory(locationId: string, quantity: number)`**

Reserves stock from a location.

### 7.2 Usage Example

```typescript
import { Inventory } from "./Inventory";

// Create inventory for a product
const inventory = new Inventory("inv-123", "prod-123");

// Add a location
inventory.addLocation("loc-main", "Main Warehouse");

// Add and reserve stock
inventory.addInventory("loc-main", 100);
inventory.reserveInventory("loc-main", 5);
```

---

## 8. Shipment Primitive

The `Shipment` primitive manages shipping information and tracking.

### 8.1 API Documentation

**`new Shipment(id: string, orderId: string, carrier: ShipmentCarrier)`**

Creates a new `Shipment` instance.

**`addTrackingEvent(event: string, description: string)`**

Adds a tracking event to the shipment.

**`markDelivered()`**

Marks the shipment as delivered.

### 8.2 Usage Example

```typescript
import { Shipment, ShipmentCarrier } from "./Shipment";

// Create a shipment
const shipment = new Shipment("ship-123", "order-456", ShipmentCarrier.DHL);

// Add a tracking event
shipment.addTrackingEvent("In Transit", "Departed from facility");

// Mark as delivered
shipment.markDelivered();
```

---

## 9. Customer Primitive

The `Customer` primitive represents a customer profile.

### 9.1 API Documentation

**`new Customer(id: string, email: string, firstName: string, lastName: string, currency: string = "NGN")`**

Creates a new `Customer` instance.

**`addAddress(street: string, city: string, state: string, postalCode: string, country: string, type: "billing" | "shipping" | "other" = "other", isDefault: boolean = false)`**

Adds an address to the customer profile.

**`recordPurchase(amount: Money)`**

Records a purchase made by the customer.

### 9.2 Usage Example

```typescript
import { Customer } from "./Customer";
import { Money } from "./Money";

// Create a customer
const customer = new Customer("cust-789", "customer@example.com", "John", "Doe");

// Add an address
customer.addAddress("123 Main St", "Lagos", "Lagos", "100001", "Nigeria", "shipping", true);

// Record a purchase
customer.recordPurchase(new Money(10000, "NGN"));
```

---

## 10. Cart Primitive

The `Cart` primitive represents a shopping cart.

### 10.1 API Documentation

**`new Cart(id: string, currency: string, customerId?: string)`**

Creates a new `Cart` instance.

**`addItem(productId: string, name: string, quantity: number, unitPrice: Money, variantId?: string)`**

Adds an item to the cart.

**`applyCoupon(couponCode: string, discountAmount: Money)`**

Applies a coupon to the cart.

### 10.2 Usage Example

```typescript
import { Cart } from "./Cart";
import { Money } from "./Money";

// Create a cart
const cart = new Cart("cart-123", "NGN", "cust-789");

// Add an item
cart.addItem("prod-123", "WebWaka T-Shirt", 1, new Money(5000, "NGN"));

// Apply a coupon
cart.applyCoupon("SAVE10", new Money(500, "NGN"));
```

---

## 11. Integration Guidelines

These primitives are designed to be used across all Commerce Suite modules. When integrating, ensure that you are using the correct primitive for the corresponding data type. For example, always use the `Money` primitive for monetary values to maintain consistency and prevent errors.

Refer to the `COMMERCE_SHARED_PRIMITIVES_SPECIFICATION.md` for detailed information on the data structures and interfaces for each primitive.
