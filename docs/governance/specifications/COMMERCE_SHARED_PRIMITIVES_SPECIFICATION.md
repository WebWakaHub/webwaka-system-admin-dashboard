# Commerce Shared Primitives Specification

**Module:** Commerce Shared Primitives  
**Module ID:** Shared-01  
**Tier:** Phase 3 (Commerce Suite)  
**Week:** Week 48  
**Status:** DRAFT - Pending Engineering & Quality Approval  
**Architect:** webwakaagent3 (Core Platform Architect)  
**Date:** February 10, 2026

---

## 1. Module Overview

### 1.1 Purpose

The Commerce Shared Primitives module defines the foundational data structures, interfaces, and utilities shared across all Commerce Suite modules (Payment Processing, Order Management, Inventory Management, Shipping Integration, and Analytics & Reporting). These primitives ensure consistency, type safety, and interoperability across the commerce platform.

### 1.2 Scope

This specification defines 8 core commerce primitives that serve as the building blocks for all commerce functionality:

1. **Money** - Immutable representation of monetary values with currency
2. **Product** - Core product entity with pricing and inventory
3. **Order** - Complete order representation with items and status
4. **Payment** - Payment transaction with status and reconciliation
5. **Inventory** - Stock levels and availability tracking
6. **Shipment** - Shipping information and tracking
7. **Customer** - Customer profile and commerce history
8. **Cart** - Shopping cart with items and pricing

### 1.3 Success Criteria

- All 8 primitives fully specified with complete interfaces
- All 10 architectural invariants addressed in design
- Full compliance with Nigerian-First, Mobile-First, PWA-First, Africa-First principles
- Type-safe implementations suitable for TypeScript/JavaScript
- Clear integration points with all Commerce Suite modules
- Comprehensive documentation with usage examples

---

## 2. Requirements

### 2.1 Functional Requirements

#### FR1: Money Primitive
- Represent monetary values with currency (NGN, USD, GBP, EUR, ZAR, etc.)
- Support arithmetic operations (add, subtract, multiply, divide)
- Prevent currency mixing in operations
- Support rounding and precision handling
- Support conversion between currencies

#### FR2: Product Primitive
- Represent products with SKU, name, description, pricing
- Support product variants (size, color, etc.)
- Track pricing tiers and discounts
- Support product categories and tags
- Track inventory levels
- Support product images and media

#### FR3: Order Primitive
- Represent complete orders with items, pricing, and status
- Support order status transitions (pending, confirmed, shipped, delivered, cancelled)
- Track order history and modifications
- Support order notes and metadata
- Calculate totals (subtotal, tax, shipping, discount, total)
- Support order references and tracking

#### FR4: Payment Primitive
- Represent payment transactions with status
- Support multiple payment methods (card, transfer, mobile money, etc.)
- Track payment status (pending, authorized, captured, failed, refunded)
- Support reconciliation with payment providers
- Track payment metadata and references
- Support partial payments and refunds

#### FR5: Inventory Primitive
- Track stock levels by location
- Support inventory reservations
- Track inventory movements (in, out, adjustment)
- Support low stock alerts
- Track inventory history
- Support multi-location inventory

#### FR6: Shipment Primitive
- Represent shipment information with tracking
- Support shipment status (pending, picked, shipped, in-transit, delivered)
- Track shipment carriers and methods
- Support address information
- Track estimated and actual delivery dates
- Support shipment events and notifications

#### FR7: Customer Primitive
- Represent customer profiles with contact information
- Track customer commerce history
- Support customer preferences
- Track customer addresses (billing, shipping)
- Support customer segments and loyalty
- Track customer communication preferences

#### FR8: Cart Primitive
- Represent shopping carts with items
- Support cart operations (add, remove, update quantity)
- Calculate cart totals (subtotal, tax, shipping, discount, total)
- Support cart persistence
- Support cart sharing and recovery
- Track cart expiration and cleanup

### 2.2 Non-Functional Requirements

#### NFR1: Type Safety
- All primitives must be fully typed (TypeScript)
- Support strict null checking
- Support discriminated unions for status types
- Immutable data structures where appropriate

#### NFR2: Performance
- Primitive operations must complete in <1ms
- Cart calculations must complete in <10ms
- Inventory lookups must complete in <5ms
- Payment status checks must complete in <100ms

#### NFR3: Scalability
- Support millions of products
- Support millions of orders
- Support millions of customers
- Support high-frequency inventory updates

#### NFR4: Reliability
- All primitives must be serializable
- Support versioning for backward compatibility
- Support migration between versions
- Prevent data corruption

#### NFR5: Security
- Sensitive data (payment info, customer data) must be encrypted
- Support audit logging
- Prevent unauthorized access
- Support data masking for sensitive fields

#### NFR6: Compliance
- Nigerian-First: Support NGN currency, local payment methods, NITDA compliance
- Mobile-First: Optimize for mobile clients, minimal data transfer
- PWA-First: Support offline operations where possible
- Africa-First: Support African currencies and payment methods

### 2.3 Architectural Invariants

All primitives must adhere to the 10 WebWaka architectural invariants:

**Invariant 1: Immutability**
- Core data structures must be immutable
- Updates must create new instances
- Support copy-on-write semantics

**Invariant 2: Type Safety**
- Full TypeScript support with strict types
- No any types except in specific justified cases
- Discriminated unions for status types

**Invariant 3: Composability**
- Primitives must compose cleanly
- Support nested structures
- Clear composition boundaries

**Invariant 4: Extensibility**
- Support custom fields and metadata
- Support versioning
- Support plugin extensions

**Invariant 5: Auditability**
- All changes must be auditable
- Support event sourcing patterns
- Track change history

**Invariant 6: Testability**
- All primitives must be easily testable
- Support mock implementations
- Support property-based testing

**Invariant 7: Observability**
- Support logging and tracing
- Support metrics collection
- Support debugging

**Invariant 8: Modularity**
- Primitives must be independent
- Clear separation of concerns
- Minimal coupling

**Invariant 9: Resilience**
- Support error handling
- Support retry logic
- Support fallback mechanisms

**Invariant 10: Compliance**
- Support Nigerian-First compliance
- Support Mobile-First optimization
- Support PWA-First capabilities
- Support Africa-First localization

---

## 3. Architecture & Design

### 3.1 Primitive Architecture

The Commerce Shared Primitives follow a layered architecture:

```
┌─────────────────────────────────────┐
│   Commerce Modules (Payment, Order, │
│   Inventory, Shipping, Analytics)   │
└─────────────────────────────────────┘
           ↓ depends on ↓
┌─────────────────────────────────────┐
│  Commerce Shared Primitives Layer    │
│  (Money, Product, Order, Payment,    │
│   Inventory, Shipment, Customer,     │
│   Cart)                              │
└─────────────────────────────────────┘
           ↓ depends on ↓
┌─────────────────────────────────────┐
│  Core Platform Layer                 │
│  (AI Abstraction, Deployment,        │
│   Infrastructure)                    │
└─────────────────────────────────────┘
```

### 3.2 Primitive Definitions

#### 3.2.1 Money Primitive

```typescript
interface Money {
  readonly amount: number;        // Amount in smallest unit (cents)
  readonly currency: Currency;    // ISO 4217 currency code
  readonly precision: number;     // Decimal places (usually 2)
}

type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'ZAR' | 'KES' | 'GHS' | 'UGX';

interface MoneyOperations {
  add(other: Money): Money;
  subtract(other: Money): Money;
  multiply(factor: number): Money;
  divide(divisor: number): Money;
  convert(targetCurrency: Currency, rate: number): Money;
  format(locale: string): string;
}
```

**Design Rationale:**
- Immutable structure prevents accidental modifications
- Stores amount in smallest unit (cents) to avoid floating-point errors
- Supports multiple currencies for African commerce
- Includes precision for proper rounding

#### 3.2.2 Product Primitive

```typescript
interface Product {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly pricing: ProductPricing;
  readonly inventory: InventoryInfo;
  readonly images: readonly Image[];
  readonly variants?: readonly ProductVariant[];
  readonly metadata?: Record<string, unknown>;
}

interface ProductPricing {
  readonly basePrice: Money;
  readonly costPrice: Money;
  readonly discountPrice?: Money;
  readonly tiers?: readonly PriceTier[];
}

interface ProductVariant {
  readonly id: string;
  readonly name: string;
  readonly options: Record<string, string>;
  readonly sku: string;
  readonly pricing?: ProductPricing;
}
```

**Design Rationale:**
- Supports product variants for size, color, etc.
- Separates pricing from inventory
- Supports tiered pricing for bulk orders
- Includes metadata for extensibility

#### 3.2.3 Order Primitive

```typescript
interface Order {
  readonly id: string;
  readonly customerId: string;
  readonly items: readonly OrderItem[];
  readonly pricing: OrderPricing;
  readonly status: OrderStatus;
  readonly shippingAddress: Address;
  readonly billingAddress: Address;
  readonly payment?: Payment;
  readonly shipment?: Shipment;
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface OrderItem {
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly discount?: Money;
  readonly total: Money;
}

interface OrderPricing {
  readonly subtotal: Money;
  readonly tax: Money;
  readonly shipping: Money;
  readonly discount: Money;
  readonly total: Money;
}
```

**Design Rationale:**
- Immutable order structure prevents accidental modifications
- Status transitions are explicit and validated
- Pricing is calculated and stored for audit trail
- Supports order metadata for extensibility

#### 3.2.4 Payment Primitive

```typescript
interface Payment {
  readonly id: string;
  readonly orderId: string;
  readonly amount: Money;
  readonly method: PaymentMethod;
  readonly status: PaymentStatus;
  readonly provider: PaymentProvider;
  readonly reference: string;
  readonly metadata: PaymentMetadata;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

type PaymentMethod = 'card' | 'transfer' | 'mobile_money' | 'wallet' | 'check' | 'cash';
type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
type PaymentProvider = 'flutterwave' | 'paystack' | 'stripe' | 'square' | 'local_bank';

interface PaymentMetadata {
  readonly cardLast4?: string;
  readonly cardBrand?: string;
  readonly mobileNumber?: string;
  readonly bankName?: string;
  readonly reference?: string;
  readonly reconciled?: boolean;
  readonly reconciliationDate?: Date;
}
```

**Design Rationale:**
- Supports multiple payment methods (card, transfer, mobile money)
- Supports multiple payment providers
- Metadata allows provider-specific information
- Status tracking for payment lifecycle

#### 3.2.5 Inventory Primitive

```typescript
interface Inventory {
  readonly productId: string;
  readonly location: InventoryLocation;
  readonly available: number;
  readonly reserved: number;
  readonly damaged: number;
  readonly total: number;
  readonly reorderPoint: number;
  readonly reorderQuantity: number;
  readonly lastUpdated: Date;
}

interface InventoryLocation {
  readonly id: string;
  readonly name: string;
  readonly address: Address;
  readonly type: 'warehouse' | 'store' | 'fulfillment_center';
}

interface InventoryMovement {
  readonly id: string;
  readonly productId: string;
  readonly location: InventoryLocation;
  readonly type: 'in' | 'out' | 'adjustment' | 'reservation' | 'release';
  readonly quantity: number;
  readonly reference: string;
  readonly timestamp: Date;
}
```

**Design Rationale:**
- Tracks inventory by location for multi-location support
- Separates available, reserved, and damaged stock
- Supports inventory movements for audit trail
- Includes reorder points for automatic replenishment

#### 3.2.6 Shipment Primitive

```typescript
interface Shipment {
  readonly id: string;
  readonly orderId: string;
  readonly status: ShipmentStatus;
  readonly carrier: ShippingCarrier;
  readonly trackingNumber: string;
  readonly method: ShippingMethod;
  readonly shippingAddress: Address;
  readonly estimatedDelivery: Date;
  readonly actualDelivery?: Date;
  readonly events: readonly ShipmentEvent[];
  readonly metadata?: Record<string, unknown>;
}

type ShipmentStatus = 'pending' | 'picked' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
type ShippingCarrier = 'fedex' | 'ups' | 'dhl' | 'local_courier' | 'standard_mail';
type ShippingMethod = 'standard' | 'express' | 'overnight' | 'local';

interface ShipmentEvent {
  readonly timestamp: Date;
  readonly status: ShipmentStatus;
  readonly location?: string;
  readonly description: string;
}
```

**Design Rationale:**
- Tracks shipment status with events
- Supports multiple carriers and methods
- Includes estimated and actual delivery dates
- Event history for tracking

#### 3.2.7 Customer Primitive

```typescript
interface Customer {
  readonly id: string;
  readonly email: string;
  readonly phone: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth?: Date;
  readonly addresses: readonly CustomerAddress[];
  readonly preferences: CustomerPreferences;
  readonly segment?: CustomerSegment;
  readonly loyaltyPoints?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

interface CustomerAddress {
  readonly id: string;
  readonly type: 'billing' | 'shipping' | 'other';
  readonly address: Address;
  readonly isDefault: boolean;
}

interface CustomerPreferences {
  readonly language: string;
  readonly currency: Currency;
  readonly timezone: string;
  readonly emailNotifications: boolean;
  readonly smsNotifications: boolean;
  readonly pushNotifications: boolean;
}

type CustomerSegment = 'new' | 'regular' | 'vip' | 'inactive';
```

**Design Rationale:**
- Supports multiple addresses
- Tracks customer preferences
- Supports customer segmentation
- Includes loyalty points for retention

#### 3.2.8 Cart Primitive

```typescript
interface Cart {
  readonly id: string;
  readonly customerId?: string;
  readonly items: readonly CartItem[];
  readonly pricing: CartPricing;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

interface CartItem {
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly discount?: Money;
  readonly total: Money;
}

interface CartPricing {
  readonly subtotal: Money;
  readonly tax: Money;
  readonly shipping?: Money;
  readonly discount?: Money;
  readonly total: Money;
}

interface CartOperations {
  addItem(product: Product, quantity: number, variant?: ProductVariant): Cart;
  removeItem(productId: string, variantId?: string): Cart;
  updateQuantity(productId: string, quantity: number, variantId?: string): Cart;
  applyCoupon(couponCode: string): Cart;
  removeCoupon(): Cart;
  clear(): Cart;
}
```

**Design Rationale:**
- Supports persistent carts
- Calculates pricing in real-time
- Supports coupons and discounts
- Includes expiration for cleanup

### 3.3 Integration Points

The Commerce Shared Primitives integrate with all Commerce Suite modules:

**Payment Processing Module:**
- Uses Money, Order, Payment, Customer primitives
- Manages payment lifecycle
- Reconciles payments with orders

**Order Management Module:**
- Uses Order, OrderItem, Customer, Cart primitives
- Manages order lifecycle
- Handles order modifications

**Inventory Management Module:**
- Uses Product, Inventory, InventoryMovement primitives
- Tracks stock levels
- Manages reservations

**Shipping Integration Module:**
- Uses Shipment, Order, Customer primitives
- Manages shipment lifecycle
- Tracks delivery

**Analytics & Reporting Module:**
- Uses all primitives
- Generates reports
- Tracks metrics

---

## 4. Compliance & Standards

### 4.1 Nigerian-First Compliance

**Currency Support:**
- Primary support for NGN (Nigerian Naira)
- Support for USD, GBP, EUR for international transactions
- Support for other African currencies (ZAR, KES, GHS, UGX)

**Payment Methods:**
- Support for Nigerian banks (transfers)
- Support for mobile money (MTN, Airtel, Glo)
- Support for Flutterwave and Paystack integration

**Regulatory Compliance:**
- Comply with NITDA guidelines
- Support for tax calculation (VAT)
- Support for regulatory reporting

**Local Language:**
- Support for Yoruba, Hausa, Igbo
- Localized error messages
- Localized date/time formatting

### 4.2 Mobile-First Compliance

**Data Optimization:**
- Minimal data transfer for mobile clients
- Support for partial data loading
- Support for data compression

**Performance:**
- All operations <1ms for mobile responsiveness
- Support for offline operations
- Support for background sync

**User Experience:**
- Touch-friendly interfaces
- Minimal input requirements
- Support for voice input

### 4.3 PWA-First Compliance

**Offline Support:**
- Cart persistence in local storage
- Order history available offline
- Inventory cache for browsing

**Service Worker Integration:**
- Support for background sync
- Support for push notifications
- Support for offline pages

**Installability:**
- Web app manifest support
- Installable on home screen
- Native-like experience

### 4.4 Africa-First Compliance

**Multi-Language Support:**
- Support for 20+ African languages
- Localized formatting
- Localized content

**Multi-Currency Support:**
- Support for African currencies
- Real-time exchange rates
- Local payment methods

**Regional Optimization:**
- Support for multiple regions
- Regional pricing
- Regional shipping

---

## 5. Implementation Roadmap

### Phase 1: Core Primitives (Week 48)
- Define all 8 primitives
- Create TypeScript interfaces
- Create mock implementations
- Create unit tests

### Phase 2: Integration (Week 49)
- Integrate with Payment Processing module
- Integrate with Order Management module
- Integrate with Inventory Management module
- Create integration tests

### Phase 3: Advanced Features (Week 50)
- Add versioning support
- Add migration support
- Add serialization support
- Add validation support

### Phase 4: Optimization (Week 51)
- Performance optimization
- Memory optimization
- Database optimization
- Caching optimization

---

## 6. Success Metrics

### 6.1 Quality Metrics

- **Code Coverage:** ≥89% (matching Tier 5 standards)
- **Test Pass Rate:** 100% (all tests passing)
- **Type Safety:** 0 any types (except justified cases)
- **Documentation:** Complete with examples

### 6.2 Performance Metrics

- **Primitive Operations:** <1ms
- **Cart Calculations:** <10ms
- **Inventory Lookups:** <5ms
- **Payment Status Checks:** <100ms

### 6.3 Compliance Metrics

- **Nigerian-First:** 100% compliance
- **Mobile-First:** 100% compliance
- **PWA-First:** 100% compliance
- **Africa-First:** 100% compliance

### 6.4 Architectural Metrics

- **Invariant Compliance:** All 10 invariants addressed
- **Type Safety:** Full TypeScript support
- **Composability:** Clean composition
- **Extensibility:** Support for extensions

---

## 7. Dependencies & Assumptions

### 7.1 Dependencies

- TypeScript 4.5+
- Node.js 16+
- Jest for testing
- Core Platform Layer (AI Abstraction, Deployment Infrastructure)

### 7.2 Assumptions

- All Commerce Suite modules will use these primitives
- Primitives will be the single source of truth for commerce data
- All modules will follow the same architectural patterns
- Nigerian-First, Mobile-First, PWA-First, Africa-First principles are non-negotiable

---

## 8. Risks & Mitigation

### 8.1 High-Priority Risks

**Risk 1: Primitive Design Errors**
- Impact: HIGH - Affects all Commerce modules
- Probability: MEDIUM
- Mitigation: Thorough design review, prototype testing, early feedback

**Risk 2: Performance Issues**
- Impact: MEDIUM - Affects user experience
- Probability: MEDIUM
- Mitigation: Performance testing, optimization, caching

**Risk 3: Compliance Gaps**
- Impact: HIGH - Regulatory issues
- Probability: LOW
- Mitigation: Compliance review, automated checks, audit trail

### 8.2 Medium-Priority Risks

**Risk 4: Integration Issues**
- Impact: MEDIUM - Affects module integration
- Probability: MEDIUM
- Mitigation: Integration testing, clear interfaces, documentation

**Risk 5: Scalability Issues**
- Impact: MEDIUM - Affects growth
- Probability: LOW
- Mitigation: Load testing, optimization, architecture review

---

## 9. Approval & Sign-Off

### 9.1 Required Approvals

- **Engineering Lead (webwakaagent4):** Implementation feasibility review
- **Quality Lead (webwakaagent5):** Testing strategy alignment review

### 9.2 Sign-Off

This specification is pending approval from Engineering and Quality leads before proceeding to implementation.

---

## Appendices

### A. Primitive Relationships

```
Customer
  ├── Cart (shopping)
  ├── Order (purchase history)
  └── Shipment (delivery tracking)

Order
  ├── OrderItem (contains Product)
  ├── Payment (payment info)
  ├── Shipment (shipping info)
  └── Pricing (Money calculations)

Product
  ├── Variant (size, color, etc.)
  ├── Inventory (stock levels)
  └── Pricing (Money)

Inventory
  ├── InventoryLocation (warehouse, store)
  └── InventoryMovement (audit trail)

Payment
  ├── Money (amount)
  └── PaymentMetadata (provider info)

Shipment
  ├── ShipmentEvent (tracking)
  └── ShippingCarrier (provider)
```

### B. TypeScript Implementation Guidelines

- Use readonly properties for immutability
- Use discriminated unions for status types
- Use branded types for IDs
- Use strict null checking
- Use exhaustive switch statements for status handling

### C. Testing Strategy

- Unit tests for all primitives
- Integration tests for primitive interactions
- Property-based tests for invariants
- Performance tests for operations
- Compliance tests for requirements

### D. Documentation Examples

Each primitive should include:
- Clear definition and purpose
- Usage examples
- Integration examples
- Error handling examples
- Performance characteristics

---

**Specification Status:** DRAFT - Pending Engineering & Quality Approval  
**Next Steps:** Submit for webwakaagent4 and webwakaagent5 review

