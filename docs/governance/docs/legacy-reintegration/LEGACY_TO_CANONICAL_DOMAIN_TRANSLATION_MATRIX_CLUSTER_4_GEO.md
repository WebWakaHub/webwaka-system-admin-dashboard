# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 4 (GEOGRAPHIC & LOCATION SERVICES)

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes **Phase II-A, Cluster 4, Step 2** of the Controlled Reintegration Roadmap. It operates under the authority of the Founder (`webwaka007`) and is strictly an exercise in structural translation for the **Geographic & Location Services (GEO) domain only**. Its purpose is to establish a canonical, isolated domain for modeling all spatial truth, thereby sealing the physical-world modeling layer of the WebWaka platform.

This document ensures the constitutional separation between `GEO` and other domains (`TRN`, `LOG`, `COM`, `FIN`, `Runtime`) is rigorously defined and enforced.

This document performs **translation only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No organ creation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the platform's constitutional documents.

---
## SECTION II — CANONICAL GEO DOMAIN SCOPE

The **Geographic & Location Services (GEO)** domain is the exclusive authority for modeling **spatial truth**. It provides the foundational, abstract primitives for location, distance, and regional hierarchies, which other domains consume to perform their operational logic. It answers the question, "Where is it, and what are its spatial properties?"

### Inclusions: What Geographic & Location Services (GEO) Governs

| Capability | Description |
| :--- | :--- |
| **Coordinate Abstraction** | Defines the canonical `Coordinate` primitive (latitude, longitude) as an immutable spatial fact. |
| **Address Normalization** | Provides an abstraction for cleaning, validating, and standardizing physical addresses into a canonical format. |
| **Administrative Region Hierarchy** | Models the nested relationships of administrative boundaries (e.g., Country → State → City → District). |
| **Geofence & Polygon Modeling** | Defines the canonical `Geofence` and `Polygon` entities for representing arbitrary spatial areas. |
| **Spatial Indexing Abstraction** | Provides an abstract interface for efficient spatial queries (e.g., "find all assets within this polygon"). The implementation is a Runtime concern. |
| **Distance Calculation Abstraction** | Offers a pure, deterministic function for calculating the mathematical distance (e.g., Haversine distance) between two coordinates. |

### Exclusions: What Geographic & Location Services (GEO) Does NOT Govern

To maintain strict domain isolation, the following capabilities are explicitly excluded from the `GEO` domain:

| Capability | Canonical Domain | Rationale |
| :--- | :--- | :--- |
| **Route Sequencing & ETA Calculation** | `TRN` (Transportation) | `GEO` provides the distance between two points; `TRN` uses this data, plus traffic and other factors, to determine the best route and estimate arrival time. |
| **Delivery & Shipment Tracking** | `LOG` / `TRN` | `GEO` defines a location; `TRN` is responsible for tracking a vehicle's movement between locations. `LOG` tracks the shipment's overall status. |
| **Region-Based Pricing or Service Availability** | `COM` / `FIN` | `GEO` defines a region; `COM` decides which services are available in that region, and `FIN` determines if there are any pricing implications (e.g., taxes). |
| **Map Provider SDKs & GPS Ingestion** | `Runtime Plane` | The specific third-party library used to display a map (e.g., Google Maps SDK) or ingest raw GPS data is an infrastructure detail, bound in the Runtime Plane. `GEO` provides a pure, biological abstraction. |

**Constitutional Declaration:** `GEO` models **spatial truth**. Other domains **consume** this truth to perform their operational logic; they do not redefine it.

---
## SECTION III — LEGACY GEO ASSET INVENTORY EXTRACTION

This section inventories the legacy assets from the `webwaka-platform` repository where geospatial logic is dangerously scattered and embedded within operational modules. This contamination creates tight coupling and prevents the creation of a clean, reusable spatial services layer.

| Legacy Asset Category | Source Module(s) & Files | Description |
| :--- | :--- | :--- |
| **Embedded Coordinate & Address Models** | `fleet-management/models/vehicle.ts`, `logistics/shipping/types/index.ts`, `hospitality-property-management/types/index.ts`, `constituency-management/models/voter.ts` | The `GeoLocation` and `Address` interfaces are repeatedly re-declared across multiple, unrelated domains. This creates inconsistency and prevents a single, canonical definition of a location. |
| **Embedded Route & Tracking Logic** | `transportation/primitives/route.ts`, `transportation/primitives/tracking.ts` | The `RouteService` and `TrackingService` directly manipulate `latitude` and `longitude` values. The core logic of a route is deeply intertwined with its spatial representation, violating the separation of concerns. |
| **Embedded Distance Calculation** | `transportation/primitives/pricing.ts` | The `PricingService` takes `distance` as a direct input. While it doesn't calculate it, it implies that the calling service is performing raw distance calculations, which should be a `GEO` domain service. |
| **Runtime SDK Contamination** | (Implicit, via `grep` results) | The presence of keywords like `mapbox` and `google.maps` in the codebase, even if not in the checked files, indicates that developers are likely integrating with third-party map SDKs directly within capability-layer code, which is a Runtime Plane violation. |
| **Region & Location Naming** | `motor-park/services/MotorParkService.ts`, `mvm/models/index.ts` | The use of simple `address` strings and the lack of a structured `Region` or `Location` hierarchy leads to inconsistent and unreliable location data. |

---
## SECTION IV — GEO TRANSLATION MATRIX

This matrix provides a structured translation of the legacy geospatial semantics into the canonical `GEO` domain. This is a proposal and analysis exercise only.

| Legacy Asset | Canonical Domain (GEO) | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Boundary Risk | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Embedded Coordinate & Address Models** | `GEO` | `LocationRegistry` | `AddressNormalization`, `CoordinateValidation` | `NormalizeAddress`, `ValidateCoordinate` | `Registry`, `Validation`, `StateStorage` | **Critical** | All legacy `Address` and `GeoLocation` interfaces must be replaced with a single, canonical `Location` entity from the `GEO` domain. This entity will have a unique, immutable ID that other domains will reference. |
| **Embedded Route & Tracking Logic** | `GEO` | `SpatialComputation` | `DistanceCalculation` | `CalculateDistance` | `Computation`, `Interface` | **Critical** | The `TRN` domain will no longer work with raw coordinates. It will work with `Location` IDs provided by `GEO`. When `TRN` needs to calculate the distance for a route, it will call the `SpatialComputation` organ in `GEO`, passing it a list of `Location` IDs. |
| **Embedded Distance Calculation** | `GEO` | `SpatialComputation` | `DistanceCalculation` | `CalculateDistance` | `Computation`, `Interface` | **High** | Any part of the system that needs to calculate a distance between two points must call the `GEO` domain's `SpatialComputation` organ. Direct, inline distance calculations are forbidden. |
| **Runtime SDK Contamination** | `Runtime Plane` | `MapAdapter` | `ProviderIntegration` | `RenderMap`, `GeocodeAddress` | `Adapter`, `ExternalIO` | **Critical** | All direct calls to third-party map SDKs must be removed from the capability layers. Instead, they will call a generic `MapAdapter` in the Runtime Plane, which will then translate the call to the specific provider (e.g., Google Maps, Mapbox). |
| **Region & Location Naming** | `GEO` | `RegionHierarchy` | `HierarchyManagement` | `GetParentRegion`, `GetSubRegions` | `Registry`, `StateStorage`, `Query` | **Medium** | Simple string-based addresses and regions will be replaced by references to canonical `Location` and `Region` entities managed by the `GEO` domain, ensuring consistency and enabling hierarchical queries. |

---
## SECTION V — SPATIAL TRUTH INVARIANT

The most critical principle for the `GEO` domain is the **Spatial Truth Invariant**. This constitutional principle establishes that the `GEO` domain is the sole and exclusive source of truth for all spatial data and relationships. Other domains may consume this truth, but they are forbidden from altering or redefining it.

### The Spatial Truth Invariant

*   **A Coordinate is an Immutable Fact:** A latitude/longitude pair represents a point on the Earth. This is a physical fact and, once registered in the `GEO` domain, is treated as immutable.
*   **Region Boundaries are Sovereign to `GEO`:** The definition of a geographical region (e.g., the polygon defining "Lagos Island") is owned exclusively by `GEO`. The `TRN` domain cannot unilaterally decide to change the boundary of a delivery zone.
*   **Distance Calculation is Deterministic and Pure:** The `SpatialComputation` organ in `GEO` must provide pure, side-effect-free functions for calculating distance. The same two points will always return the same distance.
*   **Spatial Indexing is Agnostic to Business Logic:** The `GEO` domain's spatial index is used for efficient location queries. It must not contain any business logic related to routing, pricing, or service availability.

### Domain Consumption Matrix

This matrix clarifies how other domains consume the spatial primitives provided by `GEO`:

| Consuming Domain | Consumed Primitive(s) | Purpose |
| :--- | :--- | :--- |
| **`TRN` (Transportation)** | `Location`, `Distance` | To calculate the optimal sequence of stops for a route and to track a vehicle's position relative to a known location. |
| **`LOG` (Logistics)** | `Location`, `AddressNormalization` | To validate the delivery address for a shipment and to confirm that a delivery occurred at the correct location. |
| **`COM` (Commerce)** | `Region`, `Geofence` | To determine if a customer's address falls within a valid service area or to offer region-specific products. |
| **`FIN` (Finance)** | `Region` | To apply region-specific tax rules or to analyze revenue by geographical area. |

---
## SECTION VI — LOCATION HIERARCHY MODEL

The `GEO` domain is responsible for modeling the hierarchical nature of administrative and operational locations. This provides a consistent framework for aggregation, filtering, and analysis across the entire platform.

### The Canonical Hierarchy

The standard administrative hierarchy is defined as:

1.  **Country:** The top-level sovereign nation (e.g., Nigeria).
2.  **State:** The primary subdivision of a country (e.g., Lagos State).
3.  **City / LGA:** The major urban center or Local Government Area (e.g., Ikeja).
4.  **District:** A smaller, well-defined area within a city (e.g., Oregun).
5.  **Zone:** A custom, operational area defined by the platform (e.g., "Oregun Industrial Zone").

### Hierarchy Disciplines

*   **Hierarchy Versioning:** The definition of these boundaries can change over time (e.g., due to redistricting). The `RegionHierarchy` organ must support versioning, allowing the platform to reconstruct the hierarchy as it existed at any point in time.
*   **Immutable Region IDs:** Every region at every level of the hierarchy must be assigned a unique, immutable ID. Even if the name of a region changes, its ID must remain the same.
*   **Location Identity Invariant:** Every physical address or point of interest registered in the `LocationRegistry` must be linked to its parent region in the hierarchy. This ensures that every location can be placed within its correct administrative context.

**Constitutional Declaration:** The modeling of **regions** belongs exclusively to `GEO`. The modeling of **service availability** within those regions belongs to `COM`. The modeling of **delivery routes** between locations in those regions belongs to `TRN`.

---
## SECTION VII — DOMAIN BOUNDARY COLLISION ANALYSIS

This analysis identifies critical domain boundary violations where geospatial logic is improperly embedded in operational domains. These collisions must be resolved to establish the sovereignty of the `GEO` domain.

| Collision Type | Legacy Location | Description of Violation | Canonical Resolution Path |
| :--- | :--- | :--- | :--- |
| **`GEO` ↔ `TRN`** | `src/transportation/primitives/route.ts` | The `RouteService` directly manipulates an array of `Waypoint` objects, each containing raw `latitude` and `longitude` values. This embeds spatial calculation within the routing logic. | The `TRN` `Route` entity will be redefined to hold a list of `Location` IDs. When `TRN` needs to calculate the travel time or distance, it will pass these IDs to the `GEO` `SpatialComputation` organ, which returns the result. `TRN` becomes agnostic to the underlying coordinates. |
| **`GEO` ↔ `LOG`** | `src/logistics/shipping/types/index.ts` | The `Address` interface is defined within the `shipping` module. This means that the definition of an address is coupled to the concept of a shipment, which is incorrect. | The `LOG` `Shipment` entity will no longer contain a full `Address` object. Instead, it will hold a `destinationLocationId`, which is a reference to a canonical `Location` entity managed by the `GEO` `LocationRegistry`. |
| **`GEO` ↔ `COM`** | (Implicit) | Business logic such as "we only deliver to Lagos Island" is likely implemented as a hardcoded check on the `city` or `state` field of an address string within the `COM` domain. | The `COM` domain will use the `GEO` `RegionHierarchy` organ. To check for service availability, it will ask `GEO`, "Does this `Location` ID belong to the `Lagos Island` `Region` ID?" This separates the business rule (in `COM`) from the spatial data (in `GEO`). |
| **`GEO` ↔ `Runtime`** | (Implicit) | The codebase likely contains direct calls to `new google.maps.Map(...)` or similar SDK functions within application-level code. This violates the separation between the biological organism and the Runtime Plane. | All direct map SDK calls must be removed. A `MapAdapter` will be created in the Runtime Plane. The application will make a generic call like `runtime.map.render(locationId)`, and the adapter will translate this into the specific code required by the chosen map provider. |

---
## SECTION VIII — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy geospatial semantics and the canonical `GEO` domain architecture. This is an analysis-only exercise; no creation of organs or other canonical structures is authorized by this document.

| Gap Type | Description | Legacy Asset(s) | Proposed Canonical Solution |
| :--- | :--- | :--- | :--- |
| **Missing LocationRegistry Organ** | The legacy platform lacks a central, authoritative organ for registering and managing canonical `Location` entities. Location data is scattered and duplicated across many domains. | The creation of a canonical `LocationRegistry` organ is the primary requirement for the `GEO` domain. This organ will serve as the single source of truth for all address and coordinate data. |
| **Missing RegionHierarchy Organ** | The legacy code has no concept of a structured, hierarchical relationship between geographical regions. This makes it impossible to perform queries like "show me all orders in Lagos State." | A dedicated `RegionHierarchy` organ is proposed to manage the nested relationships between countries, states, cities, and other administrative or operational zones. |
| **Missing SpatialComputation Organ** | Mathematical and geometric calculations (e.g., distance, point-in-polygon) are likely performed inline within various services, leading to code duplication and inconsistency. | A dedicated `SpatialComputation` organ is proposed to centralize all pure, deterministic geospatial calculations. This organ will be a stateless service that provides these calculations as a utility to other domains. |
| **Missing Geofence Abstraction** | The legacy platform has no formal abstraction for a geofence (a virtual perimeter for a real-world geographic area). This is a critical gap for location-based services and alerts. | The `GEO` domain must include a canonical `Geofence` entity and a `GeofenceManager` tissue within the `LocationRegistry` to create, manage, and query these zones. |
| **Missing Coordinate Normalization** | There is no evidence of a consistent process for normalizing and validating coordinates, which can lead to errors from invalid or imprecise location data. | The `LocationRegistry` must include an `AddressNormalization` tissue that cleans, validates, and standardizes all incoming address and coordinate data before it is persisted. |

---
## SECTION IX — FUTURE CONTROLLED INTERACTION PREVIEW

This section defines the anticipated event contracts that will govern the interaction between the `GEO` domain and other operational domains. A full interaction appendix will be created for each pairing in a later phase, but these contracts form the constitutional basis for that future work.

**Constitutional Declaration:** All communication between `GEO` and other domains must be asynchronous and based on these immutable, versioned event contracts. No shared state or direct calls are permitted.

| Event Name | Emitting Domain | Consuming Domain(s) | Purpose |
| :--- | :--- | :--- | :--- |
| `LOCATION_REGISTERED` | `GEO` | `TRN`, `LOG`, `COM`, `FIN` | To announce the creation of a new, canonical `Location` entity, providing its immutable ID for other domains to reference. |
| `REGION_BOUNDARY_UPDATED` | `GEO` | `COM`, `FIN` | To signal that the polygonal boundary of an administrative or operational region has been changed, triggering potential updates to service availability or tax rules. |
| `GEOFENCE_ACTIVATED` | `GEO` | `TRN`, `LOG` | To announce that a new geofence has been created and is active, allowing `TRN` or `LOG` to subscribe to entry/exit events for that zone. |
| `LOCATION_VERSION_INCREMENTED` | `GEO` | All | To signal that a significant, non-backward-compatible change has been made to the location hierarchy or data model, requiring consumers to update their logic. |

---
## SECTION X — HARD STOP

This document authorizes **governance modeling and translation mapping only** for the **Geographic & Location Services (GEO)** domain.

It does NOT authorize:

*   Organ creation
*   Issue creation
*   Activation
*   Registry mutation
*   Master Document update

Any deviation from this mandate will trigger an AGVE (Automated Governance Validation Engine) freeze.

---
## SECTION XI — RATIFICATION STATEMENT

*   **Status:** RATIFIED
*   **Authority:** Founder
*   **Date:** 2026-02-21
*   **Scope:** GEO domain only

---
