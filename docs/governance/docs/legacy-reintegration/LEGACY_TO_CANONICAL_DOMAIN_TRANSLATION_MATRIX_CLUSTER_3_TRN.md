# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 3 (TRANSPORTATION & MOBILITY)

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes **Phase II-A, Cluster 3, Step 2** of the Controlled Reintegration Roadmap. It operates under the authority of the Founder (`webwaka007`) and is strictly an exercise in structural translation for the **Transportation & Mobility (TRN) domain only**. Its purpose is to map all legacy assets related to physical mobility to the canonical WebWaka architecture, thereby constitutionally defining the mobility layer of the platform.

The translation of the Logistics & Fulfillment (LOG) domain has already been completed in a separate, preceding step. This document ensures the constitutional separation between `TRN` and `LOG` is rigorously enforced.

This document performs **translation only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No organ creation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the platform's constitutional documents.

---

## SECTION II — CANONICAL TRN DOMAIN SCOPE

The **Transportation & Mobility (TRN)** domain is the exclusive authority for the physical movement of goods and people. It governs the "how" and "where" of mobility, managing fleets, planning routes, and executing the physical act of delivery. It is the domain of vehicles, drivers, and the optimization of their movement through physical space.

### Inclusions: What Transportation (TRN) Governs

| Capability | Description |
| :--- | :--- |
| **Route Planning & Optimization** | Calculates the most efficient sequence of stops and paths for a vehicle to take, based on traffic, distance, and other constraints. This is a core function of `TRN`. |
| **Fleet Modeling & Management** | Manages the canonical `Vehicle` and `Driver` entities, including their status, capacity, and assignment. |
| **Dispatch & Vehicle Assignment** | Orchestrates the assignment of a specific vehicle and driver to a specific route or set of tasks. |
| **Capacity Modeling** | Manages the physical capacity constraints of vehicles (e.g., weight, volume) and ensures routes do not exceed these limits. |
| **Delivery Attempt Execution** | Governs the physical act of a driver attempting to deliver a shipment at a specific location, including recording the success or failure of that attempt. |
| **Mobility State Tracking** | Tracks the real-time location and status of active vehicles and drivers in the fleet. |
| **ETA Calculation Abstraction** | Provides an abstract service for calculating Estimated Times of Arrival (ETAs), which can be consumed by other domains. |

### Exclusions: What Transportation (TRN) Does NOT Govern

To maintain strict domain isolation, the following capabilities are explicitly excluded from the `TRN` domain:

| Capability | Canonical Domain | Rationale |
| :--- | :--- | :--- |
| **Shipment Creation & Management** | `LOG` (Logistics) | `TRN` does not know what is inside a package. It only receives a `Shipment` entity from `LOG` with dimensions and addresses, and is tasked with moving it. |
| **Order Lifecycle** | `COM` (Commerce) | `TRN` has no concept of a commercial order, only the physical task of moving a package associated with that order. |
| **Payment & Settlement** | `FIN` (Finance) | `TRN` does not handle any financial transactions. The cost of a delivery is calculated by `TRN` but billed and settled by `FIN`. |
| **Inventory Ownership** | `RES` (Resource) | `TRN` is a custodian of goods in transit, but it does not own them. The financial value of the inventory belongs to the `RES` domain. |
| **Address Normalization & Geocoding** | `GEO` (Geospatial) | `TRN` operates on coordinates and abstract location IDs. The process of converting a street address into a latitude/longitude coordinate is the responsibility of the `GEO` domain. |
| **Warehouse Logic** | `LOG` (Logistics) | `TRN`'s responsibility begins at the warehouse loading dock. It does not manage any internal warehouse operations like picking or packing. |
| **Infrastructure Transport Adapters** | `Runtime Plane` | The specific telematics or mapping service (e.g., Google Maps, HERE) used for routing is an infrastructure detail, bound in the Runtime Plane. `TRN` operates on abstract routing requests. |

---

## SECTION III — LEGACY TRANSPORTATION ASSET INVENTORY

This section inventories the legacy assets from the `webwaka-platform` repository that contain transportation and mobility-related logic. These assets are scattered across multiple modules and must be consolidated and translated into the canonical **Transportation (TRN)** domain.

| Legacy Asset Category | Source Module(s) | Description |
| :--- | :--- | :--- |
| **Core Transportation Primitives** | `src/transportation/primitives/` | This is the most significant legacy asset, containing foundational, abstract models for `Route`, `Vehicle`, `Driver`, `Trip`, `Tracking`, `Pricing`, and `Manifest`. It represents a strong but incomplete attempt at creating a dedicated transportation domain. |
| **Fleet & Driver Management** | `src/fleet-management/` | This module provides more concrete implementations for managing `Vehicle` and `Driver` entities, including their status, documents, and maintenance schedules. It overlaps significantly with the `transportation/primitives`. |
| **Transport Company & Motor Park** | `src/transport-company/`<br>`src/motor-park/` | These modules model higher-level business aggregations, representing transport companies and the physical motor parks they operate from. They act as containers or managers for fleets and routes. |
| **Dispatch & Execution Logic** | `src/fleet-management/services/` | The services within `fleet-management`, such as `assignDriver` and `updateLocation`, represent the core of the dispatch and mobility execution logic, forming the heart of the canonical `TRN` domain. |
| **Geo-Routing Components** | `src/transportation/primitives/route.ts` | The `Route` primitive, with its concept of `Waypoints` (latitude/longitude), contains embedded geospatial logic. It assumes the ability to calculate paths and sequences between these points. |
| **ETA & Pricing Engines** | `src/transportation/primitives/pricing.ts` | The `PricingService` and its `DistanceBasedPricingStrategy` contain the logic for calculating fares. This represents a financial calculation deeply embedded within the mobility logic, creating a `TRN` ↔ `FIN` boundary collision. |

---

## SECTION IV — TRN TRANSLATION MATRIX

This matrix provides a structured translation of the legacy transportation assets into the canonical `TRN` domain. This is a proposal and analysis exercise only.

| Legacy Asset | Canonical Domain (TRN) | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Boundary Risk | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Transportation Primitives** | `TRN` | `RoutePlanner`, `FleetManager`, `TripScheduler` | `RouteGeneration`, `ResourceRegistry`, `ScheduleCreation` | `GenerateRoute`, `RegisterVehicle`, `CreateTrip` | `Workflow`, `Registry`, `StateStorage` | **Medium** | These primitives form the foundation of the `TRN` domain. However, the `Pricing` logic must be moved to `FIN`, and the `Tracking` logic must be split between `TRN` (raw data) and `LOG` (shipment status). |
| **Fleet Management** | `TRN` | `FleetManager` | `ResourceLifecycle`, `MaintenanceScheduling` | `OnboardVehicle`, `ScheduleMaintenance` | `StateStorage`, `Workflow`, `Validation` | **Low** | This module translates cleanly into the `FleetManager` organ, which is responsible for the lifecycle of all `Vehicle` and `Driver` entities. |
| **Transport Co. / Motor Park** | `TRN` | `FleetManager` | `ResourceGrouping` | `GroupVehiclesByOwner` | `Aggregation`, `Registry` | **Low** | These modules represent a higher-level grouping abstraction. This logic can be absorbed into the `FleetManager` organ as a way to partition or organize the fleet. |
| **Dispatch & Execution** | `TRN` | `DispatchCoordinator`, `MobilityMonitor` | `ResourceAllocation`, `RealtimeTracking` | `AssignDriverToTrip`, `UpdateVehicleLocation` | `Workflow`, `Monitoring`, `StateStorage` | **High** | This is the operational heart of `TRN`. The `DispatchCoordinator` will be responsible for the core `SHIPMENT_READY` → `ROUTE_ASSIGNED` workflow. The `MobilityMonitor` will consume real-time GPS data (from a Runtime Adapter) to track the fleet. |
| **Geo-Routing Components** | `TRN` / `GEO` | `RoutePlanner` (TRN) | `RouteOptimization`, `StopSequencing` | `OptimizeRoute`, `SequenceStops` | `Analysis`, `Workflow`, `Interface` | **Critical** | This is a critical boundary. The `RoutePlanner` in `TRN` is responsible for the *logic* of optimization (e.g., solving the Traveling Salesperson Problem). However, it must delegate the *calculation* of distance and travel time between two points to the `GEO` domain. `TRN` should not contain any geospatial algorithms. |
| **ETA & Pricing Engines** | `TRN` / `FIN` | `ETACalculator` (TRN), `BillingService` (FIN) | `TimePrediction`, `FareCalculation` | `PredictArrivalTime`, `CalculateDeliveryFee` | `Projection`, `Policy`, `Interface` | **Critical** | This is another critical boundary. `TRN` is responsible for calculating the ETA based on its route and traffic data. It provides this as a service. The `FIN` domain is responsible for taking the output of `TRN` (e.g., route distance) and applying a financial policy to calculate the price. The legacy `PricingService` must be split accordingly. |

---

## SECTION V — ROUTE EXECUTION MODEL

The execution of a physical route is the primary workflow of the `TRN` domain. This model defines the mandated sequence of events and the strict separation of concerns with the `LOG` domain.

| Step | Domain | Action | Event Contract |
| :--- | :--- | :--- | :--- |
| 1 | `LOG` | A shipment is packed, labeled, and ready for pickup at the warehouse. | `LOG` emits `SHIPMENT_READY_FOR_ROUTING`. |
| 2 | `TRN` | The `DispatchCoordinator` organ consumes the `SHIPMENT_READY_FOR_ROUTING` event. | N/A (Internal Consumption) |
| 3 | `TRN` | The `RoutePlanner` organ generates an optimized route, sequencing this new stop with others. It creates a canonical `Route` entity. | `TRN` emits `ROUTE_CREATED`. |
| 4 | `TRN` | The `DispatchCoordinator` assigns an available `Vehicle` and `Driver` from the `FleetManager` to the `Route`. | `TRN` emits `ROUTE_ASSIGNED`. |
| 5 | `TRN` | The driver begins the route. The `MobilityMonitor` organ begins tracking the vehicle's location via the Runtime Plane. | `TRN` emits `ROUTE_IN_PROGRESS`. |

### Key Invariants

*   **State Immutability:** The `TRN` domain is constitutionally forbidden from mutating the state of the `Shipment` entity it is transporting. It can only read its properties (e.g., destination address, dimensions). The `LOG` domain is constitutionally forbidden from performing any routing calculations or managing vehicle state.
*   **Capacity Constraint Handling:** The `RoutePlanner` organ is responsible for ensuring that the total weight and volume of all shipments assigned to a route do not exceed the `capacity` of the assigned `Vehicle`. If capacity is exceeded, the route must be split or a larger vehicle assigned.
*   **Real-time Updates:** The model must support real-time route updates. If a new, high-priority shipment becomes ready, the `RoutePlanner` must be able to re-calculate the current route and emit a `ROUTE_UPDATED` event to the driver's interface (via a Runtime Adapter).

---

## SECTION VI — DELIVERY ATTEMPT & EXECUTION MODEL

The physical act of delivery is the atomic unit of work in the `TRN` domain. This model defines its lifecycle and its interaction with the `LOG` domain.

| Step | Domain | Action | Event Contract |
| :--- | :--- | :--- | :--- |
| 1 | `TRN` | A driver arrives at a delivery stop on their route. | `TRN` emits `DELIVERY_ATTEMPT_STARTED`. |
| 2a | `TRN` | The driver successfully delivers the package to the recipient. | `TRN` emits `DELIVERY_COMPLETED`. |
| 2b | `TRN` | The driver is unable to deliver the package (e.g., no one home, address incorrect). | `TRN` emits `DELIVERY_FAILED` with a reason code. |
| 3 | `LOG` | The `ShipmentManager` organ consumes the `DELIVERY_COMPLETED` or `DELIVERY_FAILED` event. | N/A (Internal Consumption) |
| 4 | `LOG` | The `ShipmentManager` updates the status of the canonical `Shipment` entity to `DELIVERED` or `DELIVERY_FAILED`. | `LOG` emits `SHIPMENT_STATUS_UPDATED`. |

### Key Invariants

*   **State Separation:** The state of the physical delivery attempt (e.g., `driver_arrived`, `recipient_not_found`) belongs exclusively to the `TRN` domain. The overall lifecycle state of the shipment (e.g., `IN_TRANSIT`, `DELIVERED`) belongs exclusively to the `LOG` domain. `LOG` updates its state based on the final outcome events from `TRN`.
*   **Reattempt Modeling:** The `TRN` domain is responsible for modeling reattempts. If a delivery fails, the `DispatchCoordinator` may schedule a new delivery attempt on a future route. The `LOG` domain is only concerned with the final, terminal status of the shipment.
*   **Escalation Path Abstraction:** If a delivery repeatedly fails, the `TRN` domain will emit a `DELIVERY_ESCALATION_REQUIRED` event. This abstract event signals to other domains (like `COM` or a human-in-the-loop customer service system) that a business decision is needed. `TRN` does not decide what to do with an undeliverable package; it only reports the failure of its mobility task.

---

## SECTION VII — DOMAIN BOUNDARY COLLISION ANALYSIS

This analysis identifies critical domain boundary violations in the legacy `webwaka-platform` transportation modules and declares the canonical resolution path.

| Collision Type | Legacy Location | Description of Violation | Canonical Resolution Path |
| :--- | :--- | :--- | :--- |
| **`TRN` ↔ `GEO`** | `src/transportation/primitives/route.ts` | The `Route` primitive contains an array of `Waypoint` objects with `latitude` and `longitude`. The logic to create and sequence these waypoints implies direct geospatial calculation. | The canonical `RoutePlanner` in `TRN` must not perform geospatial calculations. It should request a `route_solution` from the `GEO` domain by providing a list of abstract location IDs. The `GEO` domain is responsible for all mapping, distance matrix calculations, and pathfinding. |
| **`TRN` ↔ `RES`** | `src/fleet-management/models/vehicle.ts` | The `Vehicle` model, while primarily a `TRN` concern, could be interpreted as a financial asset. Its existence implies ownership, depreciation, and other financial attributes. | The legacy `Vehicle` model must be split. The `TRN` domain will have a `Vehicle` entity that models its *operational characteristics* (capacity, fuel type, current driver). The `RES` (Resource) domain will have a `FleetAsset` entity that models its *financial characteristics* (purchase price, depreciation schedule, book value). |
| **`TRN` ↔ `Runtime`** | `src/transportation/primitives/tracking.ts` | The `TrackingService` has a `updateVehicleLocation` method that takes a `LocationPoint`. This implies a direct coupling to a specific GPS or telematics data source. | All real-time data feeds are infrastructure. The `MobilityMonitor` organ in `TRN` must consume standardized `vehicle_location_updated` events. A dedicated **Telematics Adapter** in the Runtime Plane is responsible for connecting to the specific GPS provider and emitting these standardized events. |
| **`TRN` ↔ `FIN`** | `src/transportation/primitives/pricing.ts` | The `PricingService` directly calculates a monetary `fare` based on distance. This mixes the operational metric of distance (`TRN`) with the financial policy of pricing (`FIN`). | The `TRN` domain is responsible for providing the raw metrics of a route (e.g., `distance_km`, `estimated_duration_minutes`). The `FIN` domain consumes these metrics and applies a `FareCalculationPolicy` to determine the final price. The legacy `PricingService` must be decomposed along this boundary. |

---

## SECTION VIII — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy transportation assets and the canonical `TRN` domain architecture. This is an analysis-only exercise; no creation of organs or other canonical structures is authorized by this document.

| Gap Type | Description | Legacy Asset(s) | Proposed Canonical Solution |
| :--- | :--- | :--- | :--- |
| **Missing Canonical Organs** | The legacy code, particularly in `transportation/primitives`, is a collection of services rather than a system of coordinated organs. It lacks a high-level orchestrator for dispatch. | The canonical `TRN` domain requires the creation of a `DispatchCoordinator` as the central organ to manage the entire workflow from shipment ingestion to route assignment. A dedicated `MobilityMonitor` is also needed for real-time tracking. |
| **Overloaded Constructs** | The `TransportCompanyService` acts as a god object, managing routes, trips, vehicles, drivers, and bookings. This violates the single responsibility principle and creates a highly coupled monolith. | This service must be completely decomposed. Its responsibilities will be distributed among the canonical `RoutePlanner`, `FleetManager`, `TripScheduler`, and `DispatchCoordinator` organs. |
| **Capacity Modeling Gaps** | The legacy `Vehicle` model has a simple `capacity` number. This is insufficient to model real-world constraints like weight, volume, and specialized equipment (e.g., refrigeration). | The canonical `Vehicle` entity in the `FleetManager` must have a much richer `CapacityProfile` that includes structured data for weight, volume, dimensions, and other attributes. The `RoutePlanner` must use this profile during route optimization. |
| **Fleet Abstraction Gaps** | The `fleet-management` module is a good start, but it lacks abstractions for different types of fleets (e.g., owned, third-party contractor, crowdsourced) and their different operational and financial models. | The canonical `FleetManager` organ should support a `FleetType` abstraction, allowing the platform to manage a heterogeneous mix of owned and third-party logistics providers under a single, consistent interface. |
| **ETA Modeling Gaps** | The legacy code has no explicit ETA calculation engine. The `arrivalTime` on a `Trip` is a simple, pre-calculated value, which does not account for real-time traffic or other dynamic factors. | A dedicated `ETACalculator` organ is proposed for the `TRN` domain. It would consume real-time traffic data (from a `GEO` service) and the vehicle's current location to provide dynamic, continuously updated ETAs. |

---

## SECTION IX — FUTURE LOG–TRN CONTROLLED INTERACTION PREVIEW

This section defines the anticipated event contracts that will govern the interaction between the `LOG` and `TRN` domains. A full interaction appendix will be created later, but these contracts form the constitutional basis for that future work.

**Constitutional Declaration:** All communication between `LOG` and `TRN` must be asynchronous and based on these immutable, versioned event contracts. No shared state or direct calls are permitted.

| Event Type | Emitting Domain | Consuming Domain | Purpose |
| :--- | :--- | :--- | :--- |
| `SHIPMENT_READY_FOR_ROUTING` | `LOG` | `TRN` | To signal that a physical shipment is packed, labeled, and ready for pickup, triggering the start of the transportation process. |
| `ROUTE_ASSIGNED` | `TRN` | `LOG` | To inform `LOG` that a specific vehicle and route have been assigned to a shipment, providing an estimated pickup time. |
| `DELIVERY_ATTEMPT_RECORDED` | `TRN` | `LOG` | To provide a real-time update on the status of a delivery attempt, without necessarily being a terminal state. |
| `DELIVERY_COMPLETED` | `TRN` | `LOG` | To signal the successful completion of the mobility task, allowing `LOG` to update the shipment status to `DELIVERED`. |
| `DELIVERY_FAILED` | `TRN` | `LOG` | To signal the final failure of the mobility task, allowing `LOG` to update the shipment status and potentially trigger a return-to-sender workflow. |
| `ROUTE_CANCELLED` | `TRN` | `LOG` | To inform `LOG` that a previously assigned route has been cancelled, requiring the shipment to be re-queued for routing. |

---

## SECTION X — HARD STOP

This document authorizes **translation mapping only** for the **Transportation & Mobility (TRN)** domain.

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
*   **Scope:** TRN domain only

---
