# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 3 (LOGISTICS & FULFILLMENT)

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes **Phase II-A, Cluster 3, Step 1** of the Controlled Reintegration Roadmap. It operates under the authority of the Founder (`webwaka007`) and is strictly an exercise in structural translation for the **Logistics & Fulfillment (LOG) domain only**. Its purpose is to map all legacy assets related to logistics to the canonical WebWaka architecture, preserving strict domain isolation.

The translation of the Transportation (TRN) domain will be conducted in a separate, subsequent step. This document ensures the constitutional separation between `LOG` and other domains (`TRN`, `COM`, `RES`, `GEO`) is rigorously defined.

This document performs **translation only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No organ creation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the platform's constitutional documents.

---

## SECTION II — CANONICAL LOG DOMAIN SCOPE

The **Logistics & Fulfillment (LOG)** domain is the exclusive authority for orchestrating the physical fulfillment of a commercial order, from the moment an order is confirmed to the point a shipment is ready for transit. It manages the "what" and "how" of getting a product packaged and ready, but not the "where" of its journey.

### Inclusions: What Logistics (LOG) Governs

| Capability | Description |
| :--- | :--- |
| **Order-to-Shipment Orchestration** | Consumes a confirmed order from the `COM` domain and translates it into one or more `Shipment` entities. This is the core function of `LOG`. |
| **Fulfillment Workflow Modeling** | Defines and executes the internal workflows for fulfillment, such as picking, packing, and labeling. |
| **Shipment Entity Modeling** | Owns the canonical `Shipment` entity, which represents a package or group of packages being sent to a single address. |
| **Package Partitioning** | Manages the logic for splitting a single order into multiple packages or shipments based on warehouse availability, item size, or other constraints. |
| **Warehouse Assignment Logic** | Determines the optimal warehouse or fulfillment center to fulfill an order from, based on abstract rules (e.g., proximity, stock levels). |
| **Shipment Status Lifecycle** | Manages the state of a shipment from `pending` to `ready_for_pickup` to `shipped`. |
| **Delivery Attempt Tracking** | Records the state of delivery attempts (e.g., `delivery_attempted`, `delivery_failed`) as reported by the `TRN` domain, but does not perform the delivery. |
| **Return Logistics Orchestration** | Manages the workflow for a returned item, from generating a return label to receiving the item back into a warehouse. This is often called reverse logistics. |

### Exclusions: What Logistics (LOG) Does NOT Govern

To maintain strict domain isolation, the following capabilities are explicitly excluded from the `LOG` domain:

| Capability | Canonical Domain | Rationale |
| :--- | :--- | :--- |
| **Route Optimization** | `TRN` (Transportation) | `LOG` prepares a package for pickup; `TRN` calculates the most efficient path for the delivery vehicle to take. |
| **Fleet Management** | `TRN` (Transportation) | `LOG` does not know about trucks, drivers, or vehicle capacity. It only knows about `Shipment` entities. |
| **Geospatial Modeling** | `GEO` (Geospatial) | `LOG` operates on abstract addresses. Any distance calculation, geocoding, or map visualization is handled by the `GEO` domain. |
| **Asset Ownership Tracking** | `RES` (Resource) | `LOG` manages the *location* of inventory, but the `RES` domain manages the *ownership* and *value* of that inventory as a business asset. |
| **Order Lifecycle Logic** | `COM` (Commerce) | `LOG` only begins its work after the `COM` domain has fully confirmed an order. It cannot create, modify, or cancel a commercial order. |
| **Payment or Settlement Logic** | `FIN` (Finance) | `LOG` may track shipping costs as data, but it does not handle any financial transactions, payments, or settlements. |
| **Runtime Transport Assumptions** | `Runtime Plane` | `LOG` emits abstract events (e.g., `shipment.ready`). It has no knowledge of the underlying message queues or databases used to transport or store this information. |

---

## SECTION III — LEGACY LOGISTICS ASSET INVENTORY

This section inventories the legacy assets from the `webwaka-platform` repository that contain logistics and fulfillment-related logic. These assets must be carefully translated to align with the strict, isolated model of the canonical **Logistics (LOG)** domain.

| Legacy Asset Category | Source Module(s) | Description |
| :--- | :--- | :--- |
| **Core Shipping & Fulfillment** | `src/logistics/shipping/` | This is the central legacy module for logistics operations. It is responsible for creating `Shipment` entities, calculating shipping costs, integrating with carrier abstractions, generating labels, and managing the shipment lifecycle from pending to delivered. |
| **Warehouse & Location Management** | `src/logistics/warehouse-management/` | This module manages the physical fulfillment centers. It defines the `Warehouse` entity, its internal locations, and its operating parameters. It also contains the logic for generating `PickingList` entities to guide warehouse staff. |
| **Inventory Stock Management** | `src/logistics/inventory-management/` | This module tracks the quantity of stock for each SKU at different warehouse locations. It manages different states of inventory (`on_hand`, `available`, `reserved`, `committed`) and handles time-limited `InventoryReservation` for pending orders. It presents a significant boundary risk with the `RES` domain. |
| **Shipment Tracking & Status** | `src/logistics/tracking/` | This module provides the API endpoints and webhook consumers for tracking the real-world status of a shipment once it has left the warehouse. It consumes data from external carriers and associates it with the canonical `Shipment` entity. |
| **Order Fulfillment Trigger** | `src/logistics/order-management/` | While the `order-management` module is primarily part of the `COM` domain, its state transitions (specifically, an order moving to `PAID` or `CONFIRMED`) serve as the primary trigger for initiating the entire fulfillment workflow within the `LOG` domain. |
| **Carrier & Service Abstractions** | `src/logistics/shipping/models/Carrier.ts`<br>`src/logistics/shipping/types/index.ts` | These files define the abstract `Carrier` model and enumerate the different `ServiceType` and `CarrierCode` values (e.g., DHL, FEDEX). This represents an attempt to abstract away carrier-specific details, a concept central to the canonical architecture. |

---

## SECTION IV — LOG TRANSLATION MATRIX

This matrix provides a structured translation of the legacy logistics assets into the canonical `LOG` domain. This is a proposal and analysis exercise only.

| Legacy Asset | Canonical Domain (LOG) | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Boundary Risk | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Shipping & Fulfillment** | `LOG` | `FulfillmentOrchestrator`, `ShipmentManager` | `OrderIngestion`, `ShipmentCreation`, `StatusLifecycle` | `ProcessOrder`, `CreateShipment`, `UpdateShipmentStatus` | `Workflow`, `StateStorage`, `Validation` | **Medium** | The core logic maps directly to `LOG`. However, the cost calculation logic (`calculateShippingCost`) is a `FIN` concern and must be moved. The carrier integration logic must be moved to a Runtime Plane Adapter. |
| **Warehouse Management** | `LOG` | `WarehouseDirectory`, `PickingCoordinator` | `WarehouseRegistry`, `PickingListGeneration` | `FindWarehouse`, `GeneratePickList` | `Registry`, `Workflow`, `StateStorage` | **Low** | This module translates cleanly into `LOG` organs responsible for knowing about fulfillment centers and managing the internal process of preparing an order for shipment. |
| **Inventory Stock Management** | `LOG` / `RES` | `StockLedger` (LOG), `InventoryAsset` (RES) | `StockMovement`, `AvailabilityProjection` | `UpdateStockLevel`, `CalculateAvailable` | `StateStorage`, `Validation`, `Projection` | **Critical** | This is a critical boundary. `LOG` is responsible for the *physical count* of items in a location (`StockLedger`). `RES` is responsible for the *financial value and ownership* of that stock (`InventoryAsset`). The legacy module conflates these and must be split. |
| **Shipment Tracking** | `LOG` / `TRN` | `ShipmentTracker` (LOG) | `StatusAggregation`, `EventNormalization` | `UpdateTrackingStatus`, `NormalizeCarrierEvent` | `Aggregation`, `Normalization`, `StateStorage` | **High** | `LOG` is responsible for maintaining the canonical `Shipment` status. However, the raw tracking data (pings from a truck) belongs to the `TRN` domain. `LOG` consumes normalized events from `TRN` (e.g., `delivery_attempted`) to update its state. |
| **Order Fulfillment Trigger** | `COM` → `LOG` | `FulfillmentOrchestrator` | `OrderIngestion` | `ProcessOrder` | `Interface`, `Workflow` | **Low** | This interaction is the primary entry point to the `LOG` domain. The `FulfillmentOrchestrator` organ will have an interface tissue that subscribes to the `ORDER_CONFIRMED` event from the `COM` domain. |
| **Carrier Abstractions** | `LOG` / `Runtime` | `ShipmentManager` (LOG) | `CarrierSelection` | `SelectCarrier` | `Policy`, `Interface` | **High** | The abstract definition of a carrier belongs in `LOG`. However, the *implementation* of a specific carrier (e.g., the code that calls the DHL API) is a Runtime Plane Adapter. `LOG` selects a carrier based on rules; the Runtime Plane executes the interaction. |

---

## SECTION V — ORDER → SHIPMENT STATE TRANSITION MODEL

The transition from a commercial order to a physical shipment is a critical domain boundary. The following model is constitutionally mandated to preserve the sovereignty of the `COM` and `LOG` domains.

| Step | Domain | Action | Event Contract |
| :--- | :--- | :--- | :--- |
| 1 | `COM` | An order is successfully paid for and confirmed. | `COM` emits `ORDER_CONFIRMED`. |
| 2 | `LOG` | The `FulfillmentOrchestrator` organ consumes the `ORDER_CONFIRMED` event. | N/A (Internal Consumption) |
| 3 | `LOG` | The orchestrator analyzes the order and creates one or more canonical `Shipment` entities. | `LOG` emits `SHIPMENT_CREATED`. |
| 4 | `LOG` | The `Shipment` entity progresses through its internal lifecycle (`PENDING` → `PICKING` → `PACKED` → `LABEL_GENERATED` → `READY_FOR_PICKUP`). | `LOG` emits events for each state change (e.g., `SHIPMENT_STATUS_UPDATED`). |
| 5 | `COM` | The `COM` domain can subscribe to these `SHIPMENT_STATUS_UPDATED` events to provide tracking information to the customer, but it cannot alter the shipment. | N/A (Informational Consumption) |

### Key Invariants

*   **State Immutability:** The `LOG` domain is constitutionally forbidden from mutating the state of the original `Order` entity. The `COM` domain is constitutionally forbidden from mutating the state of the `Shipment` entity.
*   **Partial Fulfillment:** If an order is split into multiple shipments, the `LOG` domain will create multiple `Shipment` entities, each linked to the same original `orderId`. The `COM` domain is responsible for aggregating the status of these individual shipments to present a holistic order status to the customer.
*   **Backorder Abstraction:** If an item is on backorder, the `FulfillmentOrchestrator` in `LOG` will place the corresponding `Shipment` entity into a `BACKORDERED` state. The business logic for how long to wait or whether to notify the customer resides in the `COM` domain.

---

## SECTION VI — RETURN & REVERSE LOGISTICS MODEL

Reverse logistics (the process of handling returns) is a critical capability that spans multiple domains. The following model clarifies the strict separation of responsibilities.

| Step | Domain | Action | Rationale |
| :--- | :--- | :--- | :--- |
| 1 | `COM` | A customer requests a return. A business rule determines the return is valid. | The decision to accept a return is a commercial one, based on policy. `LOG` and `FIN` are not involved in this decision. |
| 2 | `COM` | The `OrderManager` organ emits a `RETURN_REQUESTED` event. | This event signals the intent to start the reverse logistics and refund process. |
| 3 | `LOG` | The `FulfillmentOrchestrator` consumes `RETURN_REQUESTED` and creates a new `ReturnShipment` entity. It orchestrates the generation of a return label via the Runtime Plane. | `LOG` is responsible for the physical movement of the item back to the warehouse. It models this as a specialized type of shipment. |
| 4 | `FIN` | The `Ledger` organ consumes `RETURN_REQUESTED` and places a `hold` on the associated funds, but does not yet process the refund. | The refund should not be processed until the physical item is received and inspected. `FIN` prepares for the financial event. |
| 5 | `LOG` | The `ReturnShipment` is received at the warehouse and its status is updated to `RECEIVED` and `INSPECTED`. `LOG` emits `RETURN_SHIPMENT_PROCESSED`. | `LOG`'s responsibility for the physical item is now complete. |
| 6 | `FIN` | The `Ledger` consumes `RETURN_SHIPMENT_PROCESSED`. It now executes the compensating transaction to process the monetary refund and emits `REFUND_PROCESSED`. | The financial transaction is only completed after confirmation that the physical process is complete. |

**Constitutional Declaration:** The accounting for a refund belongs exclusively to the `FIN` domain. The modeling and orchestration of the physical return shipment belongs exclusively to the `LOG` domain. The decision to initiate the return belongs exclusively to the `COM` domain.

---

## SECTION VII — DOMAIN BOUNDARY COLLISION ANALYSIS

This analysis identifies critical domain boundary violations in the legacy `webwaka-platform` logistics modules and declares the canonical resolution path.

| Collision Type | Legacy Location | Description of Violation | Canonical Resolution Path |
| :--- | :--- | :--- | :--- |
| **`LOG` ↔ `TRN`** | `src/logistics/shipping/services/ShippingService.ts` | The `calculateShippingCost` method implies knowledge of routes and carrier pricing models, which are `TRN` and `FIN` concerns. The service also directly manages carrier abstractions. | The `ShippingService` must be split. The `FulfillmentOrchestrator` in `LOG` will request a `rate_quote` from a `TRN` organ. The `TRN` organ, in turn, may get pricing data from `FIN`. The direct carrier logic moves to a Runtime Adapter. |
| **`LOG` ↔ `GEO`** | `src/logistics/shipping/services/ShippingService.ts` | The service takes `from_address` and `to_address` and implicitly performs distance/zone calculations to determine cost. This is a `GEO` domain function. | The `LOG` domain must operate on abstract `Location` identifiers. When a `rate_quote` is needed, it passes these location IDs to the `TRN` domain, which then uses the `GEO` domain to resolve them to coordinates and calculate distances. |
| **`LOG` ↔ `RES`** | `src/logistics/inventory-management/` | The `Inventory` model tracks both the physical count (`on_hand`) and implies financial ownership. It does not clearly separate the physical asset from the balance sheet asset. | The legacy `Inventory` model must be split into two canonical entities. `LOG` will have a `StockLevel` entity (physical count at a location). `RES` will have an `InventoryAsset` entity (financial value and ownership). A reconciliation process ensures they match. |
| **`LOG` ↔ `Runtime`** | `src/logistics/shipping/services/ShippingService.ts` | The code shows direct interaction with a TypeORM repository (`this.shipmentRepo.create`). This couples the biological logic of fulfillment to a specific database technology. | All direct database interaction must be removed from the biological organs. The `ShipmentManager` organ will use an abstract `StateStorage` organelle. The implementation of this organelle (e.g., as a TypeORM repository) is a binding that occurs in the Runtime Plane. |

---

## SECTION VIII — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy logistics assets and the canonical `LOG` domain architecture. This is an analysis-only exercise; no creation of organs or other canonical structures is authorized by this document.

| Gap Type | Description | Legacy Asset(s) | Proposed Canonical Solution |
| :--- | :--- | :--- | :--- |
| **Missing Canonical Organs** | The legacy architecture lacks dedicated organs for high-level orchestration and specific fulfillment workflows. Logic is concentrated in large, monolithic services. | The canonical `LOG` domain requires the creation of a `FulfillmentOrchestrator` to manage the end-to-end process, a `PickingCoordinator` for warehouse operations, and a `ReturnManager` for reverse logistics. |
| **Overloaded Constructs** | The legacy `ShippingService` is severely overloaded, handling shipment creation, cost calculation, carrier interaction, and status updates. | This service must be decomposed. Shipment creation and status management belong in a `ShipmentManager` organ. Cost calculation is externalized to `TRN`/`FIN`. Carrier interaction is externalized to the Runtime Plane. |
| **Missing Return Logistics Primitives** | The legacy modules have no formal, first-class support for reverse logistics. Returns are likely handled as ad-hoc, negative shipments, which is not a robust model. | A dedicated `ReturnManager` organ and a `ReturnShipment` entity must be created in the `LOG` domain to model the unique workflow and states of a return. |
| **Shipment State Abstraction Gaps** | The `ShipmentStatus` enum in the legacy code is a good start, but it does not fully capture the nuanced states of a complex fulfillment process (e.g., `picking`, `packing`, `customs_hold`). | The canonical `Shipment` entity's state machine must be expanded to include more granular states, allowing for better visibility and control over the fulfillment process. |
| **Warehouse Abstraction Gaps** | The legacy `Warehouse` model is a simple data structure. It lacks the ability to model complex warehouse topologies (e.g., zones, aisles, bins) or different fulfillment strategies (e.g., cross-docking). | The canonical `WarehouseDirectory` organ should support a more hierarchical and descriptive model of a warehouse, allowing for more intelligent fulfillment and picking strategies. |

---

## SECTION IX — FUTURE TRN INTERACTION PREVIEW

While the full translation of the Transportation (`TRN`) domain will occur in a separate step, it is useful to preview the anticipated event contracts that will form the boundary between `LOG` and `TRN`. This is a preview only; these contracts are not yet defined.

**Constitutional Declaration:** The `LOG` domain is responsible for fulfillment orchestration (preparing a package). The `TRN` domain is responsible for route optimization and physical mobility (moving the package).

### Anticipated `LOG` → `TRN` Events

*   **`SHIPMENT_READY_FOR_ROUTING`**: Emitted by `LOG` when a shipment is fully packed, labeled, and ready for pickup. This event will trigger the `TRN` domain to calculate the optimal route and assign a vehicle.

### Anticipated `TRN` → `LOG` Events

*   **`DELIVERY_ATTEMPT_RECORDED`**: Emitted by `TRN` each time a driver attempts to deliver the package. `LOG` consumes this to update the shipment status.
*   **`DELIVERY_COMPLETED`**: Emitted by `TRN` when the package is successfully delivered to the recipient. `LOG` consumes this to mark the shipment as `DELIVERED`.
*   **`DELIVERY_FAILED`**: Emitted by `TRN` after the final delivery attempt fails. `LOG` consumes this to initiate a return-to-sender process.

---

## SECTION X — HARD STOP

This document authorizes **translation mapping only** for the **Logistics & Fulfillment (LOG)** domain.

It does NOT authorize:

*   Organ creation
*   Issue creation
*   Activation
*   Registry mutation
*   Runtime binding
*   Federation mutation

Any deviation from this mandate will trigger an AGVE (Automated Governance Validation Engine) freeze.

---

## SECTION XI — RATIFICATION STATEMENT

*   **Status:** RATIFIED
*   **Authority:** Founder
*   **Date:** 2026-02-21
*   **Scope:** LOG domain only

---
