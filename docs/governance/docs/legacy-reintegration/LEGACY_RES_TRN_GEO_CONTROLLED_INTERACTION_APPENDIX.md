# LEGACY RES–TRN–GEO CONTROLLED INTERACTION STABILIZATION APPENDIX

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes the **Controlled RES–TRN–GEO Interaction Stabilization Appendix** for Phase II-A, Cluster 4. It operates under the authority of the Founder (`webwaka007`) and defines the constitutional, **tri-domain sovereignty model** governing all interactions between the **Resource & Asset Management (RES)**, **Transportation & Mobility (TRN)**, and **Geographic & Location Services (GEO)** domains. Its purpose is to mathematically stabilize and seal the physical-world modeling layer of the WebWaka platform.

This document performs **governance definition only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No organ creation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the platform's constitutional documents.

---

## SECTION II — TRI-DOMAIN SOVEREIGNTY DECLARATION

To ensure strict and permanent domain isolation, the sovereign responsibilities of the `RES`, `GEO`, and `TRN` domains are hereby declared. This separation of concerns is the constitutional foundation of the entire physical-world modeling layer.

### Resource & Asset Management (RES) Sovereignty

`RES` is the exclusive authority for **structural asset ownership**. It answers the question, "What is it, and who owns it?"

| Responsibility | Description |
| :--- | :--- |
| **Asset Existence & Registry** | The canonical source of truth for the existence of any asset (vehicle, warehouse, etc.). |
| **Ownership Lifecycle** | Manages the creation, transfer, and retirement of asset ownership. |
| **Asset Allocation State** | Tracks whether an asset is `available`, `allocated` for use, or in another state. |

### Geographic & Location Services (GEO) Sovereignty

`GEO` is the exclusive authority for **spatial truth**. It answers the question, "Where is it?"

| Responsibility | Description |
| :--- | :--- |
| **Coordinate & Address Primitives** | The canonical source of truth for coordinates and normalized addresses. |
| **Region & Boundary Definitions** | Manages the authoritative hierarchy of all administrative and operational regions. |
| **Pure Spatial Computation** | Provides deterministic, side-effect-free calculations for distance and other spatial queries. |

### Transportation & Mobility (TRN) Sovereignty

`TRN` is the exclusive authority for **mobility execution**. It answers the question, "How does it get from A to B?"

| Responsibility | Description |
| :--- | :--- |
| **Route Generation & Scheduling** | Creates and manages the operational schedule for vehicles and drivers. |
| **Stop Sequencing & Optimization** | Determines the optimal order of operations for a given route. |
| **Mobility Monitoring & ETA** | Tracks the real-time progress of a vehicle along a route and calculates its ETA. |

**Constitutional Declaration:** `TRN` **consumes** primitives from `RES` (what to use) and `GEO` (where to go). `TRN` is constitutionally forbidden from mutating the state of either `RES` or `GEO`.

---
## SECTION III — CANONICAL EVENT CONTRACT TABLE

All interactions between the `RES`, `TRN`, and `GEO` domains are governed by the following immutable, versioned event contracts. These events are the only permissible form of communication.

| Event Name | Emitting Domain | Consuming Domain(s) | Immutable Payload (Key Fields) | Idempotency Key | Version | Correlation ID | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ASSET_ALLOCATED` | `RES` | `TRN` | `assetId`, `assetType`, `capacityProfile` | `allocationId` | `eventVersion` | `traceId` | Confirms a vehicle is now available for `TRN` to schedule. |
| `ASSET_RELEASED` | `RES` | `TRN` | `assetId` | `releaseId` | `eventVersion` | `traceId` | Confirms a vehicle has been returned to the `RES` pool. |
| `VEHICLE_SCHEDULED` | `TRN` | `RES` | `assetId`, `routeId`, `scheduledStartTime` | `scheduleId` | `eventVersion` | `traceId` | Informs `RES` that an allocated asset is now tied to a specific operational plan. |
| `ROUTE_COMPUTED` | `TRN` | `LOG` | `routeId`, `shipmentIds`, `estimatedTotalDuration` | `routeId` | `eventVersion` | `traceId` | `TRN` announces a new route plan, referencing `GEO` locations implicitly. |
| `DELIVERY_ATTEMPT_RECORDED` | `TRN` | `LOG`, `GEO` | `shipmentId`, `locationId`, `timestamp`, `status` | `attemptId` | `eventVersion` | `traceId` | `TRN` reports the outcome of a delivery at a specific `GEO`-defined location. |
| `REGION_BOUNDARY_UPDATED` | `GEO` | `TRN`, `COM`, `FIN` | `regionId`, `newBoundaryPolygon`, `version` | `updateId` | `eventVersion` | `traceId` | `GEO` announces a change to a region, forcing consumers to re-evaluate their logic. |
| `ASSET_TRANSFERRED` | `RES` | `FIN` | `assetId`, `fromOwnerId`, `toOwnerId`, `transferPrice` | `transferId` | `eventVersion` | `traceId` | Signals a change in ownership, triggering financial reconciliation. |
| `ASSET_RETIRED` | `RES` | `FIN`, `TRN` | `assetId`, `retirementDate`, `bookValue` | `retirementId` | `eventVersion` | `traceId` | Signals an asset is out of service, triggering financial write-offs and removal from `TRN` scheduling pools. |

---
## SECTION IV — OWNERSHIP–SPATIAL–EXECUTION FLOW MODELS

This section models the complete, end-to-end interaction flows between the three domains, illustrating the mandated separation of concerns.

### Flow A: Vehicle Allocation to Route

This flow models how a physical vehicle, owned by `RES`, is scheduled for a route by `TRN` using spatial data from `GEO`.

| Step | Emitting Domain | Event / Action | Consuming Domain | Invariant Protection |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `TRN` | Request asset of type `truck` | `RES` | `TRN` requests a vehicle with certain capabilities, not a specific vehicle. |
| 2 | `RES` | `ASSET_ALLOCATED` | `TRN` | `RES` allocates a specific vehicle (`assetId: V123`) to `TRN`. Ownership remains with `RES`. |
| 3 | `TRN` | Request distance between Location A and B | `GEO` | `TRN` uses `Location` IDs, not raw coordinates. |
| 4 | `GEO` | Return distance | `TRN` | `GEO` returns an immutable, deterministic distance value. |
| 5 | `TRN` | `VEHICLE_SCHEDULED` | `RES` | `TRN` informs `RES` that `V123` is now scheduled for a specific route. |

### Flow B: Route Computation with Spatial Truth

This flow models how `TRN` computes a route by consuming immutable primitives from `GEO`.

| Step | Emitting Domain | Event / Action | Consuming Domain | Invariant Protection |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `TRN` | Get locations for multiple shipment destinations | `GEO` | `TRN` requests spatial data for a batch of `Location` IDs. |
| 2 | `GEO` | Return canonical `Location` data | `TRN` | `GEO` returns immutable, versioned spatial primitives. |
| 3 | `TRN` | (Internal) Compute optimal stop sequence | `TRN` | The routing algorithm is internal to `TRN` and is its sovereign responsibility. |
| 4 | `TRN` | `ROUTE_COMPUTED` | `LOG` | `TRN` announces the new route, which is now a fixed plan. |

### Flow C: Vehicle Retirement During Active Scheduling

This flow models the compensation pattern required when an asset is retired while it is part of an active operational plan.

| Step | Emitting Domain | Event / Action | Consuming Domain | Invariant Protection |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `RES` | `ASSET_RETIRED` | `TRN`, `FIN` | `RES` declares the vehicle is no longer in service. This is a constitutional fact. |
| 2 | `TRN` | (Internal) Identify active schedules for the retired asset | `TRN` | `TRN` must react to the `ASSET_RETIRED` event. |
| 3 | `TRN` | `ROUTE_CANCELLED` | `LOG` | `TRN` emits a compensating event to cancel the route. It does not delete or modify the original `ROUTE_COMPUTED` event. |
| 4 | `LOG` | (Internal) Re-queue shipments for routing | `LOG` | `LOG` receives the cancellation and triggers a new routing request, restarting the process. |

---
## SECTION V — OWNERSHIP VS. CAPACITY INVARIANT

This invariant establishes a critical constitutional separation between the structural truth of owning an asset and the operational abstraction of its capacity.

*   **Ownership is a Structural Truth:** `RES` is the sole authority on who owns an asset. This is a financial and legal fact.
*   **Capacity is an Operational Abstraction:** `TRN` (or `LOG`) is concerned with an asset's capabilities (e.g., a truck's payload, a warehouse's storage volume). This is an operational detail.

**Constitutional Declaration:**

1.  The **capacity** of an asset can change (e.g., due to an upgrade or damage) without its **ownership** changing. `TRN` may request a capacity update from `RES`, but it cannot perform the update itself.
2.  A change in **ownership** (e.g., selling a vehicle) may trigger a recalculation of the platform's total operational capacity, but the two concepts are not the same.
3.  `TRN` is constitutionally forbidden from performing any action that transfers asset ownership.
4.  `RES` is constitutionally forbidden from performing any action related to route scheduling or optimization.

---
## SECTION VI — SPATIAL IMMUTABILITY INVARIANT

This invariant ensures that all spatial data, once registered, is treated as a historical fact that cannot be altered retroactively. This is essential for auditability and deterministic route reconstruction.

*   **Coordinates are Immutable:** Once a `Location` is registered in `GEO` with specific coordinates, those coordinates cannot be changed. If the physical location moves, a new `Location` entity must be created.
*   **Region Boundaries are Versioned:** When an administrative boundary changes, `GEO` does not overwrite the old boundary. Instead, it creates a new version of that `Region`, preserving the old version for historical reference.
*   **Route Computation Must Reference Versioned Data:** When `TRN` computes a route, it must reference the specific version of the `Region` and `Location` data that was active at the time of computation. This ensures that a route from last year can be accurately reconstructed, even if the road network has changed.

**Constitutional Declaration:** All changes to spatial data within `GEO` that affect boundaries or hierarchies must emit a `LOCATION_VERSION_INCREMENTED` or `REGION_BOUNDARY_UPDATED` event. Consumers of this data, such as `TRN`, are responsible for subscribing to these events and recalculating their own models (e.g., routes) as needed.

---
## SECTION VII — COMPENSATION & FAILURE MODEL

This section defines the constitutional principles for handling failures and state changes within the tri-domain model, emphasizing the **Compensation-over-Mutation Invariant**.

*   **No Retroactive Rewriting:** Historical records, such as a `ROUTE_COMPUTED` event, are immutable facts. If a route is cancelled, a new `ROUTE_CANCELLED` event is emitted. The original event is never deleted or modified.
*   **Route Recalculation on Spatial Updates:** If `GEO` emits a `REGION_BOUNDARY_UPDATED` event that affects a planned route, `TRN` is responsible for consuming this event and deciding whether to re-compute the route. It may choose to emit a `ROUTE_CANCELLED` event followed by a new `ROUTE_COMPUTED` event.
*   **Manual Override Discipline:** Any manual intervention (e.g., a dispatcher manually re-routing a driver) must be captured as an explicit, auditable event (e.g., `MANUAL_OVERRIDE_APPLIED`). It must not directly mutate the underlying system state.

**Constitutional Declaration:** The financial implications of these events (e.g., the cost of a failed delivery, the penalty for a cancelled route) are the exclusive sovereign responsibility of the **`FIN` (Finance)** domain. No penalty or cost-calculation logic may be embedded within `RES`, `TRN`, or `GEO`.

---
## SECTION VIII — VERSIONING & FEDERATION DISCIPLINE

This section defines the principles that ensure the stability of the tri-domain model across different versions and, in the future, across different federated instances of the platform.

*   **Asset Version Compatibility Invariant:** An asset (e.g., a vehicle) created under version `X` of the `RES` domain model must remain valid and usable under version `X+1`. All model changes must be backward-compatible.
*   **Spatial Hierarchy Version Compatibility:** Similarly, a `Location` registered under version `Y` of the `GEO` `RegionHierarchy` must remain valid under version `Y+1`. The system must be able to reconstruct the hierarchy as it existed when the location was created.
*   **Cross-Instance Route Consistency:** In a federated environment, a route computed on one instance of the platform must be valid and executable on another, assuming both instances have access to the same versioned `GEO` and `RES` data.

**Constitutional Declaration:** No downgrade mutations are permitted. It is forbidden to revert an asset or a location to a previous version of its data model. All changes must move forward through the creation of new versions.

---
## SECTION IX — EXPLICIT PROHIBITIONS

To leave no room for ambiguity, the following actions are explicitly and constitutionally forbidden. Any attempt to perform these actions will result in an immediate AGVE (Automated Governance Validation Engine) Level 4 freeze.

| Forbidden Action | Violating Domain(s) | Correct Domain | Rationale |
| :--- | :--- | :--- | :--- |
| **Mutate Ownership Ledger** | `TRN`, `GEO` | `RES` | Only `RES` can change the ownership status of an asset. |
| **Redefine Coordinates** | `TRN`, `RES` | `GEO` | Only `GEO` can define and register a canonical location. |
| **Embed Routing Logic** | `GEO`, `RES` | `TRN` | Only `TRN` can calculate the sequence of stops in a route. |
| **Embed Scheduling Logic** | `RES`, `GEO` | `TRN` | Only `TRN` can assign a vehicle to a specific time slot or route. |
| **Directly Call Runtime SDKs** | `GEO`, `RES`, `TRN` | `Runtime Plane` | All interactions with third-party map or GPS providers must go through a dedicated adapter in the Runtime Plane. |
| **Share Database Tables** | `RES`, `TRN`, `GEO` | N/A | Each domain must have its own isolated persistence. Communication is via events only. |
| **Embed Depreciation Logic** | `TRN`, `GEO` | `FIN` | The financial calculation of an asset's depreciation is a `FIN` responsibility, consuming data from `RES`. |

---
## SECTION X — STRUCTURAL INVARIANTS SUMMARY

This section provides a consolidated summary of the seven core constitutional invariants that govern the RES–TRN–GEO tri-domain model.

| Invariant | Description |
| :--- | :--- |
| **1. Ownership Sovereignty Invariant** | The `RES` domain is the sole and exclusive authority on asset ownership. |
| **2. Spatial Sovereignty Invariant** | The `GEO` domain is the sole and exclusive authority on spatial truth (location, distance, and boundaries). |
| **3. Execution Sovereignty Invariant** | The `TRN` domain is the sole and exclusive authority on mobility execution (routing and scheduling). |
| **4. Event Immutability Invariant** | All communication between the three domains must occur via immutable, versioned event contracts. |
| **5. Compensation-over-Mutation Invariant** | Historical state must never be rewritten. State changes are handled by emitting new, compensating events. |
| **6. Version Compatibility Invariant** | All data models must be backward-compatible, ensuring that assets and locations remain valid across versions. |
| **7. Runtime Isolation Invariant** | The biological domains (`RES`, `TRN`, `GEO`) are forbidden from directly interacting with Runtime Plane implementation details like third-party SDKs. |

---
## SECTION XI — HARD STOP

This document authorizes **governance modeling and interaction definition only** for the **RES–TRN–GEO** tri-domain model.

It does NOT authorize:

*   Organ creation
*   Issue creation
*   Activation
*   Runtime binding
*   Registry mutation
*   Master Document modification

Any deviation from this mandate will trigger an AGVE (Automated Governance Validation Engine) freeze.

---
## SECTION XII — RATIFICATION STATEMENT

*   **Status:** RATIFIED
*   **Authority:** Founder
*   **Date:** 2026-02-21
*   **Scope:** RES–TRN–GEO interaction only

---
