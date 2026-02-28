# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 4 (RESOURCE & ASSET MANAGEMENT)

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes **Phase II-A, Cluster 4, Step 1** of the Controlled Reintegration Roadmap. It operates under the authority of the Founder (`webwaka007`) and is strictly an exercise in structural translation for the **Resource & Asset Management (RES) domain only**. Its purpose is to establish a canonical, isolated domain for modeling the ownership and structural existence of all platform assets, thereby resolving critical domain boundary collisions.

This document ensures the constitutional separation between `RES` and other domains (`LOG`, `TRN`, `FIN`, `COM`) is rigorously defined and enforced.

This document performs **translation only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No organ creation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the platform's constitutional documents.

---

## SECTION II — CANONICAL RES DOMAIN SCOPE

The **Resource & Asset Management (RES)** domain is the exclusive authority for modeling the **ownership and structural existence** of all assets within the WebWaka ecosystem. It serves as the definitive registry for what the platform owns, controls, or manages, from physical vehicles to abstract financial instruments. It answers the question, "What is it, and who owns it?"

### Inclusions: What Resource & Asset Management (RES) Governs

| Capability | Description |
| :--- | :--- |
| **Asset Ownership Modeling** | The core function of `RES`. It defines the canonical `Asset` entity and tracks its ownership, whether by the platform, a tenant, or a third party. |
| **Universal Asset Registry** | Maintains a central, canonical registry of all assets, regardless of type (physical, digital, financial). |
| **Asset Lifecycle Management** | Governs the state of an asset from `creation` and `registration` through `allocation`, `transfer`, and eventual `retirement`. |
| **Inventory Ownership Ledger** | Tracks the financial ownership and value of inventory stock. This is distinct from the physical count of items in a warehouse, which belongs to `LOG`. |
| **Equipment & Facility Registry** | Models the ownership and core attributes of physical equipment and facilities, such as warehouses or office buildings. |
| **Vehicle Ownership Modeling** | Manages the `Vehicle` as a financial asset, including its purchase price, depreciation schedule, and book value. This is separate from its operational use in `TRN`. |
| **Asset Depreciation Modeling** | Defines the structural model for asset depreciation (e.g., straight-line, declining balance). The actual accounting calculations are performed by `FIN`. |

### Exclusions: What Resource & Asset Management (RES) Does NOT Govern

To maintain strict domain isolation, the following capabilities are explicitly excluded from the `RES` domain:

| Capability | Canonical Domain | Rationale |
| :--- | :--- | :--- |
| **Shipment Fulfillment & Inventory Count** | `LOG` (Logistics) | `RES` knows who owns the inventory, but `LOG` knows how many units are on a specific shelf in a specific warehouse. |
| **Route Planning & Vehicle Usage** | `TRN` (Transportation) | `RES` owns the vehicle asset, but `TRN` orchestrates its use for a specific route or delivery. |
| **Payment & Financial Accounting** | `FIN` (Finance) | `RES` models the existence and value of an asset, but `FIN` handles all ledger entries, payments, and financial reporting related to it. |
| **Product Catalog & Sales** | `COM` (Commerce) | `RES` tracks the ownership of stock, but `COM` manages the product information, pricing, and sales process. |
| **Database Persistence & Tenancy** | `Runtime Plane` | The specific database technology used to store the asset registry is an infrastructure detail, bound in the Runtime Plane. |
| **Entitlement Gating** | `Entitlement` | `RES` may model the existence of a license or subscription as an asset, but the `Entitlement` domain is responsible for checking if that asset grants a user access to a feature. |

**Constitutional Declaration:** `RES` models **ownership and structural existence**. The **operational use** of those assets is orchestrated by other domains.

---

## SECTION III — LEGACY ASSET INVENTORY EXTRACTION

This section inventories the legacy assets from the `webwaka-platform` repository that contain logic related to resource and asset management. These semantics are dangerously embedded within operational modules and must be extracted and translated into the canonical `RES` domain.

| Legacy Asset Category | Source Module(s) | Description |
| :--- | :--- | :--- |
| **Vehicle as an Owned Asset** | `src/fleet-management/models/vehicle.ts` | The `Vehicle` model contains fields like `year`, `make`, and `model`, which imply it is a depreciable asset. The associated `maintenance.ts` file with `cost` fields further reinforces this, mixing operational data with financial asset data. |
| **Inventory as a Financial Asset** | `src/logistics/inventory-management/models/Inventory.ts` | This is a critical collision. The `Inventory` model contains both the physical count (`on_hand`) and financial data (`unit_cost`, `total_value`, `valuation_method`). It conflates the `LOG` domain's concern (physical count) with the `RES` and `FIN` domains' concerns (ownership and value). |
| **Warehouse as a Facility Asset** | `src/logistics/warehouse-management/models/Warehouse.ts` | The `Warehouse` model, with its `capacity_sqm` and address, represents a physical facility asset. Its existence implies ownership or a lease, which are `RES` concerns. |
| **Product as an Inventory Asset** | `src/commerce/primitives/Product.ts` | The `Product` primitive in the `commerce` module includes an `inventory` field. This couples the commercial definition of a product with the physical and financial reality of its stock, a `RES` and `LOG` concern. |
| **Property as a Managed Asset** | `src/hospitality-property-management/` | This entire module is dedicated to managing hospitality properties (hotels, guesthouses). It models the property itself, its rooms, and its rate plans as manageable assets, representing a large-scale `RES` concern. |
| **Asset Allocation & Capacity** | `src/fleet-management/services/vehicle.service.ts` | The `assignDriver` method represents the allocation of one asset (a driver) to another (a vehicle). The `VehicleCapacity` interface represents the operational capacity of an asset, which is distinct from its ownership. |

---

## SECTION IV — RES TRANSLATION MATRIX

This matrix provides a structured translation of the legacy asset-related semantics into the canonical `RES` domain. This is a proposal and analysis exercise only.

| Legacy Asset | Canonical Domain (RES) | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Boundary Risk | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Vehicle as Owned Asset** | `RES` | `AssetLedger` | `AssetRegistration`, `DepreciationModeling` | `RegisterAsset`, `CalculateDepreciation` | `Registry`, `StateStorage`, `Projection` | **Critical** | The `Vehicle` model must be split. `RES` will own a `FleetAsset` entity with financial data. `TRN` will have an `OperationalVehicle` entity with operational data (e.g., `currentDriverId`). The two are linked by a common ID. |
| **Inventory as Financial Asset** | `RES` | `InventoryLedger` | `OwnershipTracking`, `Valuation` | `UpdateStockValue`, `ApplyValuationMethod` | `Ledger`, `StateStorage`, `Policy` | **Critical** | The legacy `Inventory` model must be split. `RES` will own an `InventoryAsset` entity tracking the value and ownership of SKU stock. `LOG` will own a `StockLevel` entity tracking the physical count at a location. |
| **Warehouse as Facility Asset** | `RES` | `FacilityRegistry` | `FacilityRegistration` | `RegisterFacility` | `Registry`, `StateStorage` | **Medium** | The `Warehouse` model will be split. `RES` will own a `Facility` entity representing the physical building and its ownership/lease details. `LOG` will have an `OperationalWarehouse` entity representing its fulfillment capabilities. |
| **Product as Inventory Asset** | `RES` / `COM` | `InventoryLedger` (RES) | `StockOwnership` | `GetStockOwner` | `Ledger`, `Interface` | **High** | The `inventory` field must be removed from the `COM` `Product` model. Instead, the `COM` domain will query the `LOG` domain for `availability` (a physical count) and the `RES` domain for `ownership` (if needed for multi-vendor scenarios). |
| **Hospitality Property** | `RES` | `PropertyRegistry` | `PropertyLifecycle`, `AttributeManagement` | `RegisterProperty`, `UpdatePropertyDetails` | `Registry`, `StateStorage`, `Validation` | **Low** | This module translates well into a dedicated `PropertyRegistry` organ within `RES`, responsible for managing the existence and high-level attributes of hospitality properties. |
| **Asset Allocation & Capacity** | `RES` | `AssetLedger` | `AllocationTracking` | `AllocateAsset`, `ReleaseAsset` | `StateStorage`, `Workflow` | **Medium** | The `RES` `AssetLedger` will be the master record for an asset's allocation state (`available`, `allocated`, `in_use`). Other domains (like `TRN`) will request an allocation from `RES` before using an asset. |

---

## SECTION V — OWNERSHIP VS. USAGE INVARIANT

The most critical principle for the `RES` domain is the constitutional separation of **asset ownership** from **operational usage**. This invariant prevents the collapse of financial and operational concerns and is the foundation of a clean, multi-domain architecture.

### The Ownership Invariant

*   **Ownership is Sovereign to `RES`:** The `RES` domain is the sole and exclusive source of truth for who owns an asset.
*   **Usage is Orchestrated by Other Domains:** The `TRN`, `LOG`, and `COM` domains are responsible for orchestrating the *use* of an asset, but they do not own it.
*   **Allocation, Not Transfer:** When `TRN` uses a vehicle, the vehicle is **allocated** to a route. Its ownership does not transfer from `RES` to `TRN`. The `AssetLedger` in `RES` updates the asset's state from `available` to `allocated`.
*   **Usage Does Not Imply Mutation:** The operational use of an asset must not mutate its core ownership records in `RES`. A driver completing a trip does not change the book value of the truck in the `RES` asset ledger.

### Domain Responsibility Matrix

This matrix clarifies the separation of concerns for key assets:

| Asset | Owned By (`RES`) | Used By (Operational Domain) |
| :--- | :--- | :--- |
| **Vehicle** | `RES` models the `FleetAsset` (financial entity). | `TRN` models the `OperationalVehicle` and schedules it for a `Route`. |
| **Inventory Stock** | `RES` models the `InventoryAsset` (value and ownership). | `LOG` models the `StockLevel` (physical count) and uses it to fulfill a `Shipment`. |
| **Warehouse** | `RES` models the `Facility` (the building as an asset). | `LOG` models the `OperationalWarehouse` and uses its capacity to store and process shipments. |
| **Product** | N/A (A product is a commercial concept, not an asset itself) | `COM` models the `Product` for sale. The stock of that product is the asset owned by `RES`. |

---

## SECTION VI — ASSET LIFECYCLE MODEL

The `RES` domain is responsible for managing the complete lifecycle of an asset, from its creation to its disposal. This lifecycle is managed by the proposed `AssetLedger` organ.

| Lifecycle Stage | Description | Triggering Event (from other domains) | Emitted Event (from `RES`) |
| :--- | :--- | :--- | :--- |
| **Registration** | A new asset is created in the `AssetLedger`. Its ownership and financial attributes are recorded. | `ASSET_PURCHASED` (from `FIN`) | `ASSET_REGISTERED` |
| **Allocation** | The asset is temporarily assigned for operational use by another domain. Its state changes from `available` to `allocated`. | `REQUEST_ASSET_ALLOCATION` (from `TRN`, `LOG`) | `ASSET_ALLOCATED` |
| **Release** | The operational domain has finished using the asset. Its state changes from `allocated` back to `available`. | `ASSET_USAGE_COMPLETED` (from `TRN`, `LOG`) | `ASSET_RELEASED` |
| **Transfer** | The ownership of the asset is permanently transferred from one entity to another. | `ASSET_SOLD` (from `FIN`) | `ASSET_TRANSFERRED` |
| **Retirement** | The asset has reached the end of its useful life and is removed from the active registry. | `ASSET_DISPOSAL_CONFIRMED` (from `FIN`) | `ASSET_RETIRED` |

### Depreciation Modeling

*   **Structural Definition in `RES`:** The `AssetLedger` in `RES` is responsible for storing the structural parameters for depreciation (e.g., `depreciation_method: 'straight-line'`, `useful_life_months: 60`).
*   **Accounting Execution in `FIN`:** The `FIN` domain is responsible for consuming this structural information and executing the actual accounting logic. At the end of each accounting period, `FIN` will run a process that calculates the depreciation expense and updates the general ledger. `RES` does not perform accounting; it only provides the necessary data to `FIN`.

---

## SECTION VII — DOMAIN BOUNDARY COLLISION ANALYSIS

This analysis identifies critical domain boundary violations where asset ownership logic is improperly embedded in operational domains. These collisions must be resolved to establish the sovereignty of the `RES` domain.

| Collision Type | Legacy Location | Description of Violation | Canonical Resolution Path |
| :--- | :--- | :--- | :--- |
| **`RES` ↔ `TRN`** | `src/fleet-management/models/vehicle.ts` | The `Vehicle` model contains both operational attributes (`currentDriverId`, `currentLocation`) and financial asset attributes (`year`, `make`, `model`). This conflates the use of the vehicle with its existence as a depreciable asset. | The legacy `Vehicle` model must be split. `RES` will own a `FleetAsset` entity with the financial data. `TRN` will own an `OperationalVehicle` entity with the operational data. They will be linked by a common, immutable ID. `TRN` requests allocation of the asset from `RES` before use. |
| **`RES` ↔ `LOG`** | `src/logistics/inventory-management/models/Inventory.ts` | The `Inventory` model contains both the physical count (`on_hand`) and the financial value (`unit_cost`, `total_value`). This is the most severe and common violation, mixing the physical reality of the warehouse with the financial reality of the balance sheet. | The legacy `Inventory` model must be split. `LOG` will own a `StockLevel` entity, representing a simple count of items at a location. `RES` will own an `InventoryAsset` entity, representing the financial value and ownership of that stock. The two systems are reconciled periodically by `FIN`. |
| **`RES` ↔ `FIN`** | `src/fleet-management/models/maintenance.ts` | The `MaintenanceRecord` includes a `cost` field. While `RES` needs to know that maintenance occurred, the financial transaction itself (paying the vendor, recording the expense) is a `FIN` domain responsibility. | The `MaintenanceRecord` in `RES` will be purely structural, noting the type of service and date. It will emit a `MAINTENANCE_PERFORMED` event. `FIN` will consume this event, associate it with an invoice, and handle the entire financial workflow. |
| **`RES` ↔ `COM`** | `src/commerce/primitives/Product.ts` | The `Product` primitive contains an `inventory` field, directly coupling the commercial product definition to the stock level. This makes it impossible to model scenarios like dropshipping or multi-vendor marketplaces cleanly. | The `inventory` field must be removed from the `Product` model in `COM`. To display availability, `COM` must make a real-time query to the `LOG` domain's `StockLevel` service. This decouples the commercial representation from the physical reality. |

---

## SECTION VIII — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy asset-related semantics and the canonical `RES` domain architecture. This is an analysis-only exercise; no creation of organs or other canonical structures is authorized by this document.

| Gap Type | Description | Legacy Asset(s) | Proposed Canonical Solution |
| :--- | :--- | :--- | :--- |
| **Missing Asset Ledger Organ** | The legacy platform lacks a central, authoritative organ for registering and managing all assets. Asset data is scattered and embedded within operational modules. | The creation of a canonical `AssetLedger` organ is the primary requirement for the `RES` domain. This organ will serve as the single source of truth for asset ownership and lifecycle state. |
| **Missing Ownership Transfer Abstraction** | The legacy code has no formal mechanism for transferring the ownership of an asset from one entity to another. This is a critical gap for scenarios like inter-company transfers or selling used equipment. | The `AssetLedger` organ must include a dedicated `Transfer` tissue and `TransferAsset` cell to model the atomic transfer of ownership, emitting a legally and financially significant `ASSET_TRANSFERRED` event. |
| **Missing Facility Registry** | While warehouses and properties exist in the legacy code, there is no unified abstraction for a "Facility." This makes it difficult to manage a diverse portfolio of real estate assets (warehouses, offices, data centers). | A dedicated `FacilityRegistry` organ is proposed within `RES` to register and manage all physical properties and facilities owned or leased by the platform. |
| **Capacity vs. Ownership Confusion** | The legacy models often confuse an asset's operational capacity (e.g., a truck's weight limit) with its existence as an ownable asset. | The canonical `RES` model must strictly separate these. The `AssetLedger` will store the core asset details. A separate `CapacityProfile` (potentially managed by the operational domain like `TRN`) will describe its usage characteristics. |
| **Missing Depreciation Structure** | The legacy code has `cost` fields but no structured way to model depreciation, a critical aspect of asset management. | The canonical `Asset` entity in `RES` must include a structured `DepreciationProfile` field that defines the method, useful life, and salvage value, providing the necessary data for `FIN` to perform accounting. |

---

## SECTION IX — FUTURE CONTROLLED INTERACTION PREVIEW

This section defines the anticipated event contracts that will govern the interaction between the `RES` domain and other operational domains. A full interaction appendix will be created for each pairing (e.g., RES–TRN) in a later phase, but these contracts form the constitutional basis for that future work.

**Constitutional Declaration:** All communication between `RES` and other domains must be asynchronous and based on these immutable, versioned event contracts. No shared state or direct calls are permitted.

| Event Name | Emitting Domain | Consuming Domain(s) | Purpose |
| :--- | :--- | :--- | :--- |
| `ASSET_ALLOCATED` | `RES` | `TRN`, `LOG` | To confirm that a requested asset has been successfully allocated for operational use. |
| `ASSET_RELEASED` | `RES` | `TRN`, `LOG` | To confirm that an asset has been returned to the available pool after operational use. |
| `ASSET_TRANSFERRED` | `RES` | `FIN` | To signal the permanent transfer of ownership of an asset, triggering financial and accounting updates. |
| `ASSET_RETIRED` | `RES` | `FIN` | To signal that an asset has been removed from service, triggering final depreciation and disposal accounting. |
| `CAPACITY_UPDATED` | `RES` | `TRN`, `LOG` | To inform operational domains of a change in an asset's capacity (e.g., after an upgrade or repair). |

---

## SECTION X — HARD STOP

This document authorizes **governance modeling and translation mapping only** for the **Resource & Asset Management (RES)** domain.

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
*   **Scope:** RES domain only

---
