# LEGACY LOG–TRN CONTROLLED INTERACTION APPENDIX

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes the **Controlled Logistics–Transportation Interaction Appendix** for Phase II-A, Cluster 3. It operates under the authority of the Founder (`webwaka007`) and defines the constitutional, shipment-centric model governing all interactions between the **Logistics & Fulfillment (LOG)** and **Transportation & Mobility (TRN)** domains.

All interactions are bound by the following constitutional principles:

*   **Event-Only Communication:** Domains must only communicate via immutable, versioned event contracts. Direct function calls or API dependencies are forbidden.
*   **No Shared Persistence:** Domains must not share database tables, caches, or any other form of state persistence. Each domain is responsible for its own sovereign data store.
*   **No Cross-Domain Mutation:** A domain is constitutionally forbidden from mutating the state of an entity that belongs to another domain.
*   **Governance Definition Only:** This document is a modeling and definition exercise. It does not authorize the creation or modification of any live code, infrastructure, or canonical registry entries.

---

## SECTION II — DOMAIN SOVEREIGNTY DECLARATION

To ensure strict domain isolation, the sovereign responsibilities of the `LOG` and `TRN` domains are hereby declared. This separation of concerns is the foundation of the fulfillment and mobility system.

### Logistics (LOG) Domain Sovereignty

The `LOG` domain is the **lifecycle spine** of the fulfillment process. It owns the canonical `Shipment` entity and is the sole authority on its state. Its sovereign responsibilities include:

| Responsibility | Description |
| :--- | :--- |
| **Shipment Entity Lifecycle** | Creating, updating, and closing the canonical `Shipment` entity. `LOG` is the master record for what is being shipped. |
| **Fulfillment Orchestration** | Managing the end-to-end workflow from a confirmed order to a shipment ready for pickup. |
| **Warehouse Assignment** | Determining which fulfillment center is responsible for preparing a shipment. |
| **Backorder Handling** | Managing the state of shipments that cannot be immediately fulfilled due to lack of stock. |
| **Shipment Partitioning** | Deciding if a single commercial order needs to be split into multiple physical shipments. |

### Transportation (TRN) Domain Sovereignty

The `TRN` domain is the **execution support** for the fulfillment process. It is responsible for all aspects of physical mobility. Its sovereign responsibilities include:

| Responsibility | Description |
| :--- | :--- |
| **Route Creation & Optimization** | Calculating the optimal path and sequence of stops for a vehicle. |
| **Stop Sequencing** | Determining the order in which deliveries and pickups should occur on a route. |
| **Driver & Vehicle Assignment** | Assigning a specific driver and vehicle to a specific route. |
| **Delivery Attempt Execution** | Managing the physical act of attempting a delivery at a destination. |
| **ETA Modeling** | Calculating and providing Estimated Times of Arrival for active routes. |

**Constitutional Declaration:** `LOG` is the source of truth for the **shipment lifecycle**. `TRN` is the source of truth for the **mobility execution**. `TRN` provides a service to `LOG`; it does not control it.

---

## SECTION III — CANONICAL EVENT CONTRACT TABLE

All interactions between the `LOG` and `TRN` domains are governed by the following immutable, versioned event contracts. These events are the only permissible form of communication.

| Event Name | Emitting Domain | Consuming Domain | Immutable Payload (Key Fields) | Idempotency Key | Version Field | Correlation ID | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SHIPMENT_READY_FOR_ROUTING` | `LOG` | `TRN` | `shipmentId`, `pickupLocationId`, `destinationAddress`, `dimensions`, `weight` | `shipmentId` | `eventVersion` | `traceId` | The constitutional trigger for all mobility operations. `TRN` must not act before receiving this. |
| `ROUTE_ASSIGNED` | `TRN` | `LOG` | `shipmentId`, `routeId`, `vehicleId`, `driverId`, `estimatedPickupTime` | `routeId` | `eventVersion` | `traceId` | `TRN` informs `LOG` that a plan is in place. This is informational; `LOG` does not approve the route. |
| `ROUTE_STARTED` | `TRN` | `LOG` | `routeId`, `actualDepartureTime` | `routeId` | `eventVersion` | `traceId` | Signals that the vehicle is physically in motion. |
| `DELIVERY_ATTEMPT_RECORDED` | `TRN` | `LOG` | `shipmentId`, `attemptId`, `timestamp`, `status` (`SUCCESS`, `FAILURE`), `reasonCode`, `location` | `attemptId` | `eventVersion` | `traceId` | Records the outcome of a single delivery attempt. This is the atomic unit of mobility execution. |
| `DELIVERY_COMPLETED` | `TRN` | `LOG` | `shipmentId`, `finalAttemptId`, `timestamp`, `signature` | `shipmentId` | `eventVersion` | `traceId` | Terminal success event. Signals that `TRN` has completed its responsibility for this shipment. |
| `DELIVERY_FAILED` | `TRN` | `LOG` | `shipmentId`, `finalAttemptId`, `timestamp`, `finalReasonCode` | `shipmentId` | `eventVersion` | `traceId` | Terminal failure event. Signals that `TRN` has exhausted its attempts for this shipment. |
| `ROUTE_CANCELLED` | `TRN` | `LOG` | `routeId`, `reason` | `routeId` | `eventVersion` | `traceId` | `TRN` informs `LOG` that a planned route will not be executed, requiring `LOG` to re-initiate routing. |
| `SHIPMENT_DELIVERY_CONFIRMED` | `LOG` | `COM`, `FIN` | `shipmentId`, `orderId`, `deliveryTimestamp` | `shipmentId` | `eventVersion` | `traceId` | `LOG` confirms to the rest of the system that the shipment is delivered, based on `TRN`'s signal. |
| `SHIPMENT_ESCALATION_REQUIRED` | `LOG` | `COM`, `Support` | `shipmentId`, `reason`, `history` | `shipmentId` | `eventVersion` | `traceId` | `LOG` signals that a business decision is required after repeated delivery failures. |
| `SHIPMENT_CLOSED` | `LOG` | `FIN`, `Analytics` | `shipmentId`, `finalStatus`, `resolution` | `shipmentId` | `eventVersion` | `traceId` | `LOG` formally closes the shipment lifecycle, triggering final financial settlement and analytics aggregation. |

---

## SECTION IV — FULL SHIPMENT LIFECYCLE FLOWS

This section models the complete, end-to-end lifecycle of a shipment, illustrating the mandated interaction patterns between the `LOG` and `TRN` domains across various scenarios.

### Flow A: Standard Delivery

This flow represents the ideal path for a single shipment from creation to successful delivery.

| Step | Emitting Domain | Event | Consuming Domain | Invariant Protection |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `COM` | `ORDER_CONFIRMED` | `LOG` | `LOG` creates a new `Shipment` entity, linking it to the `orderId`. |
| 2 | `LOG` | `SHIPMENT_READY_FOR_ROUTING` | `TRN` | `TRN` is triggered to begin mobility planning. The `shipmentId` ensures idempotency. |
| 3 | `TRN` | `ROUTE_ASSIGNED` | `LOG` | `LOG` updates the shipment's status to `AWAITING_PICKUP`. This is an informational update. |
| 4 | `TRN` | `DELIVERY_COMPLETED` | `LOG` | `LOG` validates the `shipmentId` and `attemptId` before updating its state. |
| 5 | `LOG` | `SHIPMENT_DELIVERY_CONFIRMED` | `COM`, `FIN` | `COM` can now inform the customer. `FIN` can recognize revenue. |
| 6 | `LOG` | `SHIPMENT_CLOSED` | `FIN`, `Analytics` | The lifecycle is formally terminated. All state is now final. |

### Flow B: Delivery Failure & Reattempt

This flow models the scenario where the first delivery attempt fails, but a reattempt is successful.

| Step | Emitting Domain | Event | Consuming Domain | Invariant Protection |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `TRN` | `DELIVERY_ATTEMPT_RECORDED` (Status: `FAILURE`) | `LOG` | `LOG` records the failed attempt but keeps the shipment in an `IN_TRANSIT` state. |
| 2 | `TRN` | (Internal) | `TRN` | The `DispatchCoordinator` in `TRN` decides to schedule a reattempt on a new route. |
| 3 | `TRN` | `DELIVERY_ATTEMPT_RECORDED` (Status: `SUCCESS`) | `LOG` | `LOG` receives the success event for the same `shipmentId` and proceeds as in Flow A. |

### Flow C: Split Shipment Multi-Route

This flow models an order that is split into two shipments, fulfilled from different warehouses.

| Step | Emitting Domain | Event | Consuming Domain | Invariant Protection |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `LOG` | `SHIPMENT_READY_FOR_ROUTING` (for Shipment A) | `TRN` | `TRN` creates Route 1 for Shipment A. |
| 2 | `LOG` | `SHIPMENT_READY_FOR_ROUTING` (for Shipment B) | `TRN` | `TRN` creates Route 2 for Shipment B. |
| 3 | `TRN` | `DELIVERY_COMPLETED` (for Shipment A) | `LOG` | `LOG` updates Shipment A's status to `DELIVERED`. |
| 4 | `TRN` | `DELIVERY_COMPLETED` (for Shipment B) | `LOG` | `LOG` updates Shipment B's status to `DELIVERED`. |
| 5 | `COM` | (Internal) | `COM` | The `COM` domain is responsible for aggregating the statuses of both shipments to determine the overall order status. |

### Flow D: Route Cancellation

This flow models a scenario where an external event (e.g., vehicle breakdown) forces `TRN` to cancel an in-progress route.

| Step | Emitting Domain | Event | Consuming Domain | Invariant Protection |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `TRN` | `ROUTE_CANCELLED` | `LOG` | `LOG` receives the cancellation for a specific `routeId`. |
| 2 | `LOG` | (Internal) | `LOG` | `LOG` identifies all shipments on the cancelled route and reverts their status to `AWAITING_ROUTING`. |
| 3 | `LOG` | `SHIPMENT_READY_FOR_ROUTING` (re-emitted) | `TRN` | `LOG` re-submits the shipments for routing, triggering a new planning cycle. The original `shipmentId` is preserved. |

---

## SECTION V — IDEMPOTENCY & ATOMICITY DISCIPLINE

To ensure data consistency and prevent duplicate processing in a distributed, event-driven system, the following idempotency and atomicity disciplines are constitutionally mandated.

*   **Unique Identifiers:** Every key entity must have a unique, immutable identifier generated upon creation. This includes `shipmentId`, `routeId`, and `attemptId`. These IDs serve as the primary idempotency keys for all events.

*   **Replay Safety Invariant:** All event consumers must be designed to be idempotent. If the same event is received multiple times (e.g., due to a message bus retry), the consumer must ensure that the processing logic is only executed once. This is typically achieved by checking if the event's idempotency key has already been processed.

*   **Compensation-Over-Mutation Principle:** State changes must not be reversed by mutating existing records. Instead, a new, compensating event or transaction must be created. For example, to cancel a route, a `ROUTE_CANCELLED` event is emitted; the original `ROUTE_CREATED` event is not deleted or modified.

*   **No Retroactive State Rewriting:** The state of an entity, once it has reached a terminal state (e.g., `SHIPMENT_CLOSED`), is constitutionally forbidden from being altered. Any changes must be recorded in a new, separate audit or adjustment record.

---

## SECTION VI — FAILURE & COMPENSATION MODEL

Failure is an expected condition in a complex, real-world system. This model defines the constitutional approach to handling failures in the LOG–TRN interaction.

*   **Delivery Retry Policy:** The `TRN` domain is responsible for implementing its own internal retry policy for failed deliveries. For example, it may attempt delivery up to three times before declaring a final failure. This policy is internal to `TRN`; the `LOG` domain is only concerned with the terminal `DELIVERY_FAILED` event.

*   **Escalation Logic:** After `TRN` emits a terminal `DELIVERY_FAILED` event, the `LOG` domain consumes it and updates the shipment status. `LOG` is then responsible for initiating the escalation process by emitting `SHIPMENT_ESCALATION_REQUIRED`. This event signals to business-level domains (like `COM` or a customer support system) that a decision is needed (e.g., contact customer, return to sender, dispose of goods).

*   **Dead-Letter Abstraction:** Conceptually, any event that cannot be processed by its consumer after a set number of retries must be moved to a Dead-Letter Queue (DLQ). The implementation of this is a Runtime Plane concern, but the biological architecture mandates that unprocessable events must be preserved for manual inspection and correction.

*   **Manual Override Discipline:** Any manual correction to the state of a shipment or route must be performed through a dedicated, audited interface that emits a compensating event. Direct database modification is constitutionally forbidden.

**Constitutional Declaration:** The `FIN` domain is the sole authority for any financial penalties or refunds associated with failed deliveries. The `LOG` and `TRN` domains must not embed any financial accounting logic. `TRN` may provide the data for a penalty (e.g., `delivery_failed_due_to_inaccessible_address`), but `FIN` applies the financial consequence.

---

## SECTION VII — VERSIONING & FEDERATION DISCIPLINE

To ensure long-term stability and interoperability across a distributed system, the following versioning and federation disciplines are mandated.

*   **Event Schema Versioning:** Every event contract defined in Section III must include a `eventVersion` field. Any change to the schema of an event payload (e.g., adding, removing, or renaming a field) requires incrementing this version number.

*   **Backward Compatibility Invariant:** Event consumers must be designed to be backward compatible with older versions of an event schema. A consumer designed for `eventVersion: 2` must still be able to correctly process an event with `eventVersion: 1`. This may involve providing default values for new fields or gracefully ignoring them.

*   **Federation Propagation Constraints:** In a federated system with multiple independent instances of the platform, `Shipment` and `Route` entities may need to be propagated across instances. This propagation must preserve the original `shipmentId` and `routeId` to maintain a single, global source of truth for each entity.

**Constitutional Declaration:** A `Shipment` entity created under version `X` of the event contracts must remain valid and processable under version `X+1` without requiring mutation. The logic for handling the version difference resides in the consuming organ, not by altering the original data.

---

## SECTION VIII — EXPLICIT PROHIBITIONS

To prevent domain collapse and maintain the constitutional integrity of the architecture, the following actions are explicitly and strictly forbidden. Any violation will trigger a Level 4 AGVE (Automated Governance Validation Engine) freeze.

| Prohibited Action | Violating Domain(s) | Rationale |
| :--- | :--- | :--- |
| **TRN Mutating Shipment Lifecycle State** | `TRN` | The lifecycle of a `Shipment` is the sovereign responsibility of `LOG`. `TRN` can only report the outcome of its mobility task. |
| **LOG Calculating Routes** | `LOG` | Route optimization is a complex computational task that is the sovereign responsibility of `TRN`. `LOG` must not contain any routing algorithms. |
| **Shared Database Access** | `LOG`, `TRN` | Sharing a database table creates a tight, brittle coupling that makes independent evolution impossible. This is a foundational constitutional violation. |
| **Direct Adapter Usage** | `LOG`, `TRN` | Biological organs must not directly call infrastructure adapters (e.g., a specific mapping API). All such interactions must be mediated by the Runtime Plane. |
| **Route Cost Calculations Inside LOG** | `LOG` | The financial cost of a route is a `FIN` domain concern. `LOG` must not embed any pricing or cost calculation logic. |
| **Delivery Status Updates Inside COM** | `COM` | The `COM` domain is a consumer of delivery status for informational purposes only. It is forbidden from altering the state of a `Shipment` or `Route`. |
| **Financial Accounting Inside TRN** | `TRN` | `TRN` is responsible for mobility, not money. It must not perform any ledger entries, revenue recognition, or other financial accounting. |

---

## SECTION IX — STRUCTURAL INVARIANTS SUMMARY TABLE

This table summarizes the seven core constitutional invariants that govern the LOG–TRN interaction. These invariants are non-negotiable and must be enforced by the AGVE.

| Invariant | Description |
| :--- | :--- |
| **1. Shipment Sovereignty Invariant** | The `LOG` domain is the sole and exclusive owner of the `Shipment` entity and its state lifecycle. No other domain may mutate it. |
| **2. Route Sovereignty Invariant** | The `TRN` domain is the sole and exclusive owner of the `Route` entity and the logic of mobility execution. No other domain may create or modify routes. |
| **3. Event Immutability Invariant** | Once an event has been emitted, its payload is constitutionally immutable. It cannot be altered or retracted. |
| **4. Idempotency Invariant** | All event consumers must ensure that processing the same event multiple times produces the exact same result as processing it once. |
| **5. Compensation Invariant** | State changes must be corrected or reversed by emitting a new, compensating event, not by mutating or deleting historical records. |
| **6. Federation Compatibility Invariant** | Entities and events must be designed to function correctly across multiple, independent instances of the platform, preserving global uniqueness. |
| **7. Runtime Isolation Invariant** | Biological organs (`LOG`, `TRN`) must remain pure and free of any infrastructure-specific code. All external interactions must be handled by adapters in the Runtime Plane. |

---

## SECTION X — HARD STOP

This document authorizes **governance modeling only** for the **LOG–TRN interaction**.

It does NOT authorize:

*   Organ creation
*   Issue creation
*   Activation
*   Runtime binding
*   Registry mutation
*   Federation mutation

Any deviation from this mandate will trigger an AGVE (Automated Governance Validation Engine) freeze.

---

## SECTION XI — RATIFICATION STATEMENT

*   **Status:** RATIFIED
*   **Authority:** Founder
*   **Date:** 2026-02-21
*   **Scope:** LOG–TRN interaction only

---
