# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 2 (COMMERCE)

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes **Phase II-A, Cluster 2, Step 1** of the Controlled Reintegration Roadmap. It operates under the authority of the Founder (`webwaka007`) and is strictly an exercise in structural translation for the **Commerce (COM) domain only**. Its purpose is to map all legacy assets related to commerce to the canonical WebWaka architecture, preserving strict domain isolation.

This document performs **translation only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

The translation of the Finance (FIN) domain will be handled in a separate, subsequent document to ensure strict domain isolation is maintained. There will be no premature coupling of `COM` and `FIN` logic.

All activities are bound by the following constitutional documents:

*   `STRICT_INFRASTRUCTURE_NEUTRAL_IMPLEMENTATION_CONTRACT.md`
*   `RUNTIME_PLANE_CONSTITUTION.md`
*   `PLATFORM_FEDERATION_CONSTITUTION.md`
*   `VERSION_EVOLUTION_AND_PATCH_GOVERNANCE_MODEL.md`
*   `FEATURE_ENTITLEMENT_AND_MODULE_ACTIVATION_MODEL.md`
*   `AGVE (Automated Governance Validation Engine)`

---

## SECTION II — CANONICAL COMMERCE DOMAIN SCOPE

The **Commerce (COM)** domain is responsible for the complete lifecycle of a commercial transaction, from product discovery to order fulfillment orchestration. It manages the abstract business logic of trade, while delegating financial transactions, physical logistics, and resource ownership to their respective canonical domains.

### Inclusions: What Commerce (COM) Governs

| Capability | Description |
| :--- | :--- |
| **Product & Catalog Management** | Defines product information, SKU modeling, categories, and attributes. |
| **Vendor & Marketplace Logic** | Manages vendor profiles, product listings, and multi-vendor aggregation. |
| **Cart Management** | Handles the creation and modification of shopping carts, including adding/removing items. |
| **Order Lifecycle Management** | Orchestrates the entire order workflow from `pending` to `delivered`, including status transitions. |
| **Checkout Orchestration** | Manages the high-level checkout process, coordinating with other domains for payment and shipping. |
| **Inventory Reservation Logic** | Provides the abstract logic for reserving stock when an order is placed. The actual inventory count is managed by the `RES` domain. |
| **Pricing & Discount Engines** | Manages pricing rules, promotions, and discount application. The financial value is a primitive, but the rules engine resides in `COM`. |
| **Refund Initiation Logic** | Handles the business logic for initiating a refund (e.g., due to a return). The actual financial transaction is a `FIN` domain responsibility. |
| **POS Abstraction Layer** | Provides a generalized interface for Point-of-Sale interactions, abstracting away specific hardware or client implementations. |

### Exclusions: What Commerce (COM) Does NOT Govern

To maintain strict domain isolation, the following capabilities are explicitly excluded from the `COM` domain:

| Capability | Canonical Domain | Rationale |
| :--- | :--- | :--- |
| **Payment Processing** | `FIN` (Financial Services) | All financial transactions, including credit card processing, digital payments, and wallet interactions, are the exclusive responsibility of the `FIN` domain. `COM` only signals *that* a payment is required. |
| **Ledger Management** | `FIN` (Financial Services) | The immutable record of all financial transactions, credits, and debits is managed by the `FIN` domain's ledger system. |
| **Settlement & Payouts** | `FIN` (Financial Services) | The process of settling funds with vendors in a marketplace is a financial operation belonging to the `FIN` domain. |
| **Logistics & Shipping** | `LOG` (Logistics & Fulfillment) | All physical movement of goods, including carrier integration, route planning, and delivery tracking, is managed by the `LOG` domain. `COM` only provides the shipping address and requested service level. |
| **Asset Ownership & Inventory** | `RES` (Resource & Asset Management) | The definitive record of physical or digital asset ownership and the source-of-truth for inventory counts are managed by the `RES` domain. `COM` queries `RES` for availability and requests reservations. |

---


## SECTION III — LEGACY COMMERCE ASSET INVENTORY

This section inventories the legacy assets from the `webwaka-platform` repository that contain commerce-related logic. These assets must be carefully translated to align with the strict boundaries of the canonical **Commerce (COM)** domain.

| Legacy Asset Category | Source Module(s) / Primitives | Description |
| :--- | :--- | :--- |
| **Core Commerce Primitives** | `src/commerce/primitives/` | Defines the foundational, abstract concepts of commerce, including `Product`, `Cart`, `Order`, `Inventory`, and the `Money` value object. These are the building blocks for all other commerce modules. |
| **Order & Inventory Management** | `src/logistics/order-management/`<br>`src/logistics/inventory-management/` | These modules contain the detailed implementation for the order lifecycle (creation, status workflows, cancellation) and inventory management (stock tracking, reservation, multi-location). |
| **Point of Sale (POS) System** | `src/pos/` | A complete Point-of-Sale implementation that includes cart management, payment processing orchestration, receipt generation, and offline synchronization capabilities. |
| **Multi-Vendor Marketplace (MVM)** | `src/mvm/`<br>`src/svm/` | The `mvm` module is a comprehensive multi-vendor marketplace system. It manages vendor registration, product listings, vendor-specific orders, commission calculation, and payout processing. The `svm` module appears to be a single-vendor variant. |
| **Specialized Commerce Applications** | `src/hospitality-booking-engine/`<br>`src/sales/` | These modules represent vertical-specific commerce logic. The **Hospitality Booking Engine** handles reservations and payments for accommodations, while the **Sales** module manages ticket sales for transportation trips. |
| **Boundary-Adjacent Systems** | `src/payment-billing/`<br>`src/economic-engine/` | These systems contain logic that is closely related to commerce but canonically belongs to the `FIN` domain. The **Payment & Billing** module integrates with payment gateways, and the **Economic Engine** handles financial distributions, commissions, and wallets. Their interaction points with `COM` must be carefully analyzed. |

---

## SECTION IV — COMMERCE TRANSLATION MATRIX

This matrix provides a structured translation of the legacy commerce assets into the canonical `COM` domain. This is a proposal and analysis exercise only. No creation or mutation of canonical structures is authorized.

| Legacy Asset | Canonical Domain (COM) | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Boundary Risk | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Core Commerce Primitives** | `COM` | `ProductCatalog`, `ShoppingCart`, `OrderManager` | `ProductDefinition`, `CartOperations`, `OrderWorkflow` | `DefineProduct`, `AddItemToCart`, `PlaceOrder` | `StateStorage`, `Validation`, `Policy` | **Low** | The legacy primitives map cleanly to proposed core organs within the `COM` domain, forming the foundation of its biological structure. |
| **Order & Inventory Management** | `COM` | `OrderManager`, `InventoryReserver` | `OrderLifecycle`, `StockReservation` | `UpdateOrderStatus`, `ReserveStock` | `Workflow`, `StateStorage`, `Interface` | **Medium** | The order logic belongs in `COM`. The inventory logic must be split: reservation logic stays in `COM` as the `InventoryReserver` organ, but the actual stock ledger belongs to the `RES` domain. |
| **Point of Sale (POS) System** | `COM` | `PointOfSale` | `TerminalSession`, `CartOrchestration`, `PaymentInitiation` | `CreateSale`, `ProcessCart`, `RequestPayment` | `Interface`, `Workflow`, `StateStorage` | **High** | The POS system must be re-architected. The cart and sale logic belongs in `COM`. The payment processing logic must be completely delegated to the `FIN` domain via a clean interface. |
| **Multi-Vendor Marketplace (MVM)** | `COM` | `Marketplace`, `VendorManager` | `VendorOnboarding`, `ProductListing`, `MultiVendorOrder` | `RegisterVendor`, `ListProduct`, `SplitOrder` | `Policy`, `Workflow`, `Aggregation` | **High** | The core marketplace logic (vendor and product management) belongs in `COM`. However, the commission and payout logic (`CommissionCalculator`, `PayoutProcessor`) is a `FIN` domain responsibility and must be extracted. |
| **Hospitality Booking Engine** | `COM` | `BookingEngine` | `AvailabilitySearch`, `ReservationWorkflow`, `RateManagement` | `FindAvailableRooms`, `CreateBooking`, `SetRoomRate` | `Search`, `Workflow`, `Policy` | **Medium** | The booking and reservation logic is a specialized form of commerce and belongs in the `COM` domain. Payment processing must be delegated to `FIN`. |
| **Sales Module (Transportation)** | `COM` | `Ticketing` | `TripSales`, `SeatAssignment` | `SellTicket`, `AssignSeat` | `StateStorage`, `Validation` | **Low** | This is another specialized commerce function. The logic for selling tickets for trips maps to a proposed `Ticketing` organ within `COM`. |
| **Payment & Billing** | `FIN` | *N/A (Belongs to FIN)* | *N/A* | *N/A* | *N/A* | **Critical** | This entire module is financial. Its logic must be exposed as services by the `FIN` domain, which the `COM` domain can then invoke. No part of this module should be translated into `COM`. |
| **Economic Engine** | `FIN` | *N/A (Belongs to FIN)* | *N/A* | *N/A* | *N/A* | **Critical** | Similar to Payment & Billing, this is a core financial module. Its capabilities (revenue distribution, wallets) must be provided by the `FIN` domain. |

---

## SECTION V — DOMAIN BOUNDARY COLLISION ANALYSIS

This section identifies critical boundary collisions in the legacy architecture where commerce logic is improperly coupled with financial, logistical, or runtime concerns. These collisions must be resolved to achieve the canonical model's strict domain isolation.

| Collision Type | Legacy Asset / Logic | Canonical Resolution Path |
| :--- | :--- | :--- |
| **`COM` / `FIN` Collision: Payment Processing** | The `pos` and `hospitality-booking-engine` modules contain direct integrations with payment gateways (Paystack, Flutterwave). The `mvm` module includes `CommissionService` and `PayoutService`. | All direct payment gateway integrations must be removed from `COM` organs. The `COM` domain will use a standardized interface to request payment from the `FIN` domain. All commission and payout calculations are the exclusive responsibility of `FIN`. |
| **`COM` / `FIN` Collision: Financial Ledgers** | The `economic-engine` provides wallet and ledger-like functionalities that are intertwined with commerce events. | The `COM` domain must not maintain any financial ledgers. It should only emit business events (e.g., `order.completed`). The `FIN` domain will subscribe to these events and update its own immutable financial ledgers accordingly. |
| **`COM` / `LOG` Collision: Shipping & Fulfillment** | The legacy `order-management` module contains fields and logic related to `carrier_code` and `tracking_number`. | The `COM` domain's responsibility ends at orchestrating the order. Once an order is ready for fulfillment, it should be handed off to the `LOG` domain. The `LOG` domain will manage all shipping carriers, tracking, and delivery logistics. `COM` should only store a reference to the shipment ID provided by `LOG`. |
| **`COM` / `RES` Collision: Inventory Management** | The legacy `inventory-management` module combines the logic for inventory reservation with the actual management of stock levels. | The canonical model requires this to be split. The `COM` domain will contain the `InventoryReserver` organ, which handles the *logic* of reserving stock for a cart or order. The `RES` (Resource & Asset Management) domain will manage the actual, authoritative count of inventory as a resource. |
| **`COM` / Runtime Collision: Persistence Assumptions** | Many legacy modules are tightly coupled to a specific database implementation (PostgreSQL with TypeORM or Drizzle), with schema definitions embedded within the module. | Canonical organs must be persistence-agnostic. They should define their state requirements abstractly. The Runtime Plane is responsible for binding these state requirements to a concrete database implementation. |

---

## SECTION VI — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy commerce assets and the canonical architecture. This is an analysis-only exercise; no creation of organs, tissues, or cells is authorized by this document.

| Gap Type | Description | Legacy Asset(s) | Proposed Canonical Solution |
| :--- | :--- | :--- | :--- |
| **Missing Canonical Organs** | The legacy architecture lacks dedicated, isolated organs for concepts like `ProductCatalog`, `ShoppingCart`, and `Marketplace`. These were often implemented as part of larger, monolithic modules. | The translation proposes the creation of these new, fine-grained organs within the `COM` domain to better represent the distinct biological functions of commerce. |
| **Overloaded Organs** | The legacy `mvm` (Multi-Vendor Marketplace) module is a classic example of an overloaded system, handling vendor management, product listings, order processing, and financial payouts. | The canonical approach requires splitting this monolith. Vendor and product logic belongs in `COM` organs like `VendorManager` and `ProductCatalog`. Order logic belongs in `OrderManager`. Payout logic must be moved entirely to the `FIN` domain. |
| **Redundant Constructs** | The platform has multiple, slightly different implementations of a shopping cart and order management, for example, in the generic `commerce/primitives`, the `pos` module, and the `hospitality-booking-engine`. | A single, canonical `ShoppingCart` and `OrderManager` organ must be defined within the `COM` domain. Other systems should reuse these canonical organs rather than implementing their own variants. |
| **Missing Abstraction Layers** | The legacy system lacks a clear abstraction layer for Point of Sale (POS) interactions, leading to tight coupling with specific client implementations. | The translation proposes the creation of a `PointOfSale` organ that serves as a generic interface for all POS activities, decoupling the core commerce logic from the specific front-end or hardware used at the point of sale. |

---

## SECTION VII — MULTI-VENDOR MARKETPLACE ANALYSIS

The Multi-Vendor Marketplace (MVM) is a central and complex component of the legacy platform. Its translation requires careful analysis to ensure its capabilities are correctly mapped to the canonical domains, preserving the strict separation of concerns.

### Analysis of Core MVM Logic

| MVM Logic Area | Legacy Implementation Analysis | Canonical Translation Path |
| :--- | :--- | :--- |
| **Vendor Isolation Model** | The legacy `mvm` module uses a `vendor_id` on products and order items to associate them with a specific vendor. Queries are filtered by this ID to provide basic isolation. | This model is fundamentally sound and will be preserved. The proposed `VendorManager` organ in `COM` will be the canonical source of truth for vendor data. The `ProductCatalog` will enforce that every product has a valid `vendor_id`. |
| **Order Partitioning Model** | The legacy system appears to handle multi-vendor orders by creating a single order with line items that reference different `vendor_id`s. | This approach creates downstream complexity. The canonical model proposes that a multi-vendor cart should be partitioned into distinct, single-vendor sub-orders within the `OrderManager` organ. Each sub-order follows the standard lifecycle but is linked to a common parent checkout session. |
| **Cross-Vendor Cart Logic** | The legacy `Cart` primitive can contain items from multiple vendors within a single cart instance. | This capability will be maintained in the canonical `ShoppingCart` organ. However, during the checkout orchestration process, this multi-vendor cart must be partitioned into the single-vendor sub-orders described above before being passed to the `OrderManager`. |
| **Inventory Reservation Logic** | The legacy system makes direct calls to an inventory module to reserve stock. | This logic will be formalized. The `COM` domain's `InventoryReserver` organ will be responsible for requesting reservations from the `RES` domain's inventory ledger for each item in an order. This creates a clean, asynchronous interface between the domains. |
| **Pricing Aggregation Logic** | The legacy cart calculates the total by summing the prices of all items, regardless of vendor. | This logic is correct and will be maintained. The `ShoppingCart` organ will continue to be responsible for aggregating prices and applying any cart-level discounts. |

### Explicit Boundary Declarations

To ensure constitutional compliance, the following boundaries are reaffirmed:

*   **Settlement Belongs to `FIN`:** The process of calculating vendor commissions and executing payouts is a financial operation. The `COM` domain's `Marketplace` organ will emit events like `order.completed_for_vendor`, which the `FIN` domain will consume to trigger its settlement and payout workflows.

*   **Delivery Orchestration Belongs to `LOG`:** Once a sub-order is confirmed, the `COM` domain's `OrderManager` will hand it off to the `LOG` domain for fulfillment. The `LOG` domain is responsible for all aspects of shipping and delivery.

*   **Entitlement Gating Belongs to Entitlement Governance:** The ability for a vendor to access certain marketplace features (e.g., premium listings, advanced analytics) is not a `COM` concern. It is governed by the cross-cutting `FEATURE_ENTITLEMENT_AND_MODULE_ACTIVATION_MODEL.md`.

---

## SECTION VIII — HARD STOP

This document authorizes **translation mapping only** for the **Commerce (COM)** domain.

It does NOT authorize:

*   Organ creation
*   Issue creation
*   Domain mutation
*   Activation
*   Runtime binding
*   Federation modification

Any deviation from this mandate will trigger an AGVE (Automated Governance Validation Engine) freeze.

---

## SECTION IX — RATIFICATION STATEMENT

*   **Status:** RATIFIED
*   **Authority:** Founder
*   **Date:** 2026-02-21
*   **Scope:** COM domain only

---
