# POS (Point of Sale) Module Documentation

**Module ID:** Commerce-02
**Module Name:** POS (Point of Sale)
**Version:** 1.0
**Date:** 2026-02-10
**Status:** FINAL
**Author:** webwakaagent3 (Architecture)

---

## 1. Introduction

The POS (Point of Sale) module provides a comprehensive, offline-first solution for merchants to manage in-person sales, process payments, and synchronize inventory with their online store. It is designed to be a fully-featured, mobile-first PWA that can run on any device with a web browser.

This document provides a comprehensive overview of the POS module, including its architecture, API, and usage examples.

## 2. Architecture

The POS module is built on a modular, event-driven architecture that ensures high performance, reliability, and scalability. The key architectural components are:

- **POS Service:** The main service that orchestrates all POS operations.
- **Cart Component:** Manages the shopping cart, including adding/removing items, applying discounts, and calculating totals.
- **Payment Component:** Handles all payment processing, including cash, card, and mobile money.
- **Receipt Component:** Generates and manages receipts (digital and print).
- **Offline Sync Component:** Manages offline data storage and synchronization.

## 3. API Documentation

The POS module exposes a comprehensive REST API for managing all aspects of point of sale operations.

### 3.1 POS Service API

The `POSService` class is the main entry point for all POS operations.

**`createCart(customerId?: string): Cart`**
- Creates a new shopping cart.

**`addToCart(product: Product, quantity: number, unitPrice: number): void`**
- Adds a product to the current cart.

**`removeFromCart(productId: string): void`**
- Removes a product from the current cart.

**`updateCartQuantity(productId: string, quantity: number): void`**
- Updates the quantity of a product in the cart.

**`applyItemDiscount(productId: string, discountAmount: number): void`**
- Applies a discount to a specific item in the cart.

**`applyCartDiscount(discountAmount: number): void`**
- Applies a discount to the entire cart.

**`applyTax(taxAmount: number): void`**
- Applies tax to the cart.

**`completeSale(paymentMethod: string, amountPaid: number, customerId?: string): Sale`**
- Completes a sale and processes the payment.

**`getSale(saleId: string): Sale | undefined`**
- Retrieves a sale by its ID.

**`getAllSales(): Sale[]`**
- Retrieves all sales.

**`getReceipt(receiptId: string): Receipt | undefined`**
- Retrieves a receipt by its ID.

**`generateReceiptText(receiptId: string): string | undefined`**
- Generates a text-based receipt.

**`generateReceiptHTML(receiptId: string): string | undefined`**
- Generates an HTML-based receipt.

**`clearCart(): void`**
- Clears the current cart.

**`getReceiptBySaleId(saleId: string): Receipt | undefined`**
- Retrieves a receipt by its sale ID.

**`refundSale(saleId: string): Sale`**
- Refunds a completed sale.

### 3.2 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/pos/cart | Create a new cart |
| GET | /api/v1/pos/cart | Get the current cart |
| POST | /api/v1/pos/cart/items | Add an item to the cart |
| DELETE | /api/v1/pos/cart/items/:productId | Remove an item from the cart |
| POST | /api/v1/pos/sales | Complete a sale |
| GET | /api/v1/pos/sales/:saleId | Get a sale by ID |
| GET | /api/v1/pos/receipts/:receiptId | Get a receipt by ID |
| GET | /api/v1/pos/status | Get the offline sync status |

## 4. Usage Examples

### 4.1 Creating a Sale

```typescript
// 1. Create a POS service instance
const posService = new POSService();

// 2. Create a new cart
posService.createCart();

// 3. Add products to the cart
const product1 = { id: 'prod-1', name: 'Product 1' };
const product2 = { id: 'prod-2', name: 'Product 2' };
posService.addToCart(product1, 2, 1000);
posService.addToCart(product2, 1, 500);

// 4. Apply a discount
posService.applyCartDiscount(200);

// 5. Complete the sale
const sale = posService.completeSale('cash', 2300);

// 6. Get the receipt
const receipt = posService.getReceipt(sale.receiptId!);
console.log(receipt?.generateText());
```

### 4.2 Handling Offline Sales

```typescript
// 1. Go offline
posService.offlineSync.setIsOnline(false);

// 2. Complete a sale
const sale = posService.completeSale('cash', 1000);

// 3. Check offline queue
const queueSize = posService.getOfflineSyncStatus().queueSize;
console.log(`Offline queue size: ${queueSize}`); // 1

// 4. Go online and sync
posService.offlineSync.setIsOnline(true);
await posService.syncPendingTransactions();

// 5. Verify queue is empty
const newQueueSize = posService.getOfflineSyncStatus().queueSize;
console.log(`New offline queue size: ${newQueueSize}`); // 0
```

## 5. Conclusion

The POS module provides a robust and feature-rich solution for managing point of sale operations. Its offline-first architecture and comprehensive API make it a powerful tool for merchants in any environment.
