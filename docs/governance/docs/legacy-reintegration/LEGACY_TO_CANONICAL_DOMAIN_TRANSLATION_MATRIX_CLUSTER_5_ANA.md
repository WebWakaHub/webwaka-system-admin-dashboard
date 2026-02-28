# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 5: ANALYTICS & INTELLIGENCE (ANA)

---
## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes the **Legacy to Canonical Domain Translation Matrix for Cluster 5: Analytics & Intelligence (ANA)**. It operates under the authority of the Founder (`webwaka007`) and defines the constitutional separation of the `ANA` domain from all other capability and operational domains. Its purpose is to prevent the contamination of business logic with analytical concerns and to establish `ANA` as a pure, read-only consumer of domain events.

This document performs **governance definition only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No organ creation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the platform's constitutional documents. Any deviation will trigger an AGVE (Automated Governance Validation Engine) Level 4 freeze.

---
## SECTION II — CANONICAL ANA DOMAIN SCOPE

The `ANA` domain is constitutionally defined as a **read-model-only layer**. It is responsible for the ingestion, projection, and analysis of events emitted by other domains to produce insights. It is explicitly forbidden from mutating the state of any other domain.

### Inclusions: What ANA Owns

| Responsibility | Description |
| :--- | :--- |
| **Analytical Projection Modeling** | Defining the schemas and structures of read-optimized analytical models (projections). |
| **Aggregation Pipelines** | Creating and managing the pipelines that consume raw events and build aggregated datasets. |
| **Metric & KPI Abstraction** | Providing a canonical registry and computation engine for key business metrics and KPIs. |
| **Reporting & Forecasting Abstraction** | Modeling the structure of reports, dashboards, and predictive forecasts. |
| **Analytical Model Versioning** | Managing the lifecycle and versioning of all analytical models and pipelines. |

### Exclusions: What ANA Does Not Own

| Responsibility | Correct Domain | Rationale |
| :--- | :--- | :--- |
| **Source-of-Truth Entity Mutation** | `COM`, `FIN`, `LOG`, etc. | `ANA` is a read-only consumer; it cannot change the authoritative state of a business entity. |
| **Policy Enforcement & Entitlement** | `CFG` (Configuration) | Deciding who can do what is a configuration concern, not an analytical one. |
| **Financial Accounting** | `FIN` | The official ledger and financial records are the sovereign responsibility of `FIN`. |
| **Runtime Data Storage** | `Runtime Plane` | The choice of database technology (e.g., ClickHouse, PostgreSQL) is a Runtime decision. `ANA` defines the *what*, not the *how*. |

**Constitutional Declaration:** The `ANA` domain **consumes** events from all other domains. It is constitutionally forbidden from emitting any event that would cause a state mutation in another domain. It is a terminal node in the event flow for the purpose of business logic.

---
## SECTION III — LEGACY ANALYTICS ASSET INVENTORY EXTRACTION

This section provides a comprehensive inventory of all legacy modules, components, and code segments related to analytics, reporting, and intelligence that have been identified within the `webwaka-platform` repository.

### Group 1: Dedicated Analytics & Reporting Modules

These modules are explicitly designed for analytics and reporting, but their implementation details reveal significant boundary violations.

| Legacy Asset | Description |
| :--- | :--- |
| `src/analytics-reporting` | A full-fledged analytics service with its own event processor, query service, and ClickHouse database schema. It subscribes to platform events and provides an API for querying aggregated data. This module represents a significant but improperly isolated analytics capability. |
| `src/audit-system` | While primarily for audit trails, this module contains reporting and query capabilities that overlap with the `ANA` domain. It has its own event consumer and data store, creating a parallel, competing analytics stack. |
| `src/political-analytics-module` | A specialized module for political campaign analytics. It contains services for recording metrics and calculating trends, but it is tightly coupled to its own data models and lacks a clear separation from the core business logic it analyzes. |

### Group 2: Embedded Analytics & Reporting Contamination

These assets represent a more dangerous form of contamination, where analytical logic is directly embedded within core business logic modules.

| Legacy Asset | Location | Description of Contamination |
| :--- | :--- | :--- |
| `FinancialReporter.ts` | `src/economic-engine/components/` | This component within the `economic-engine` is responsible for generating complex financial reports, including revenue summaries, top performer calculations, and revenue-by-level breakdowns. This is a clear violation of domain sovereignty, as reporting logic is embedded within the `FIN` domain. |
| `analytics` references | `src/logistics/tracking/index.ts` | The logistics tracking module contains references to analytics events, indicating that it is aware of and potentially coupled to the analytics subsystem. |
| `calculateTrends` | `src/political-analytics-module/services/` | The `AnalyticsService` in this module contains a `calculateTrends` method that performs trend analysis directly. This logic should be in a dedicated `ANA` organ. |
| Hardcoded SQL Queries | (Not explicitly found, but assumed) | Based on the structure of the `QueryService` in the `analytics-reporting` module, it is highly probable that other services contain hardcoded SQL or similar query language strings for analytical purposes, creating a tight coupling to the underlying database schema. |

---
## SECTION IV — ANA TRANSLATION MATRIX

This matrix translates the identified legacy assets into the canonical `ANA` domain, proposing a set of organs and tissues to properly isolate and manage these capabilities. This is a modeling exercise only; no organ creation is authorized.

| Legacy Asset | Canonical Domain | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Boundary Risk | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/analytics-reporting` | `ANA` | `AnalyticsProjection` | `EventIngestor`, `ProjectionBuilder`, `QueryInterface` | `PageViewEvent`, `ClickEvent` | `IN` (Ingestion), `PR` (Processing) | **High** | The entire module must be refactored. The `EventProcessor` becomes the `EventIngestor` tissue. The `QueryService` becomes the `QueryInterface`. The ClickHouse dependency is moved to the Runtime Plane. |
| `src/audit-system` (reporting parts) | `ANA` | `AuditProjection` | `AuditEventIngestor`, `AuditQueryInterface` | `AuditLogEvent` | `IN`, `PR` | **Medium** | The reporting and query features of the audit system must be extracted and moved into a dedicated `AuditProjection` organ within `ANA`. The core audit trail remains a separate concern. |
| `FinancialReporter.ts` | `ANA` | `FinancialProjection` | `TransactionEventIngestor`, `RevenueCalculator` | `TransactionEvent` | `IN`, `PR`, `AG` (Aggregation) | **Critical** | This logic must be completely removed from the `economic-engine`. It will be rebuilt within a `FinancialProjection` organ in `ANA` that consumes `Transaction` events from `FIN`. |
| `calculateTrends` method | `ANA` | `TrendForecaster` | `TrendModel`, `StatisticalAnalyzer` | `MetricSnapshot` | `PR`, `AN` (Analysis) | **Medium** | This specific piece of logic should be extracted into a dedicated `TrendForecaster` organ, which can be reused across different types of analytics. |
| Hardcoded SQL Analytics | `ANA` | `MetricRegistry` | `MetricDefinition`, `QueryGenerator` | `SqlMetric` | `PR`, `AG` | **High** | All hardcoded queries must be replaced with calls to a `MetricRegistry` organ. The registry will define metrics semantically, and the `QueryGenerator` tissue will be responsible for creating the actual database queries. |

---
## SECTION V — ANALYTICAL IMMUTABILITY INVARIANT

This invariant establishes the constitutional principle that analytics are derived, read-only representations of the truth, not the truth itself. This prevents the dangerous anti-pattern where a report or a dashboard becomes a de facto source of authority, leading to state corruption.

*   **Analytics Must Be Derived:** All data within the `ANA` domain is a projection or aggregation of events emitted by other domains. It is a calculated result, not an original fact.
*   **Analytics Must Not Be a Source of Truth:** No other domain may query `ANA` to make a real-time business logic decision. For example, the `FIN` domain cannot ask `ANA` for the current revenue total to approve a transaction.
*   **Aggregation Pipelines Must Not Trigger Business Mutation:** The process of calculating a metric or building a report must not, under any circumstances, emit an event that causes a state change in a business domain.
*   **Forecasts Are Not Facts:** A forecast generated by `ANA` is a prediction, not a commitment. It cannot be used to directly mutate the state of an operational system (e.g., automatically ordering more inventory based on a sales forecast).

**Constitutional Declaration:** All data entities and events originating from the `ANA` domain must be explicitly labeled as `derived-state`. Business domains will consume events from other business domains. `ANA` will consume events from business domains. `ANA` is constitutionally forbidden from emitting commands or events that mutate the state of a business domain.

---
## SECTION VI — EVENT CONSUMPTION MODEL

This section defines the constitutional model for how the `ANA` domain consumes events from the rest of the platform, ensuring its isolation and preventing it from disrupting core business operations.

*   **Read-Only Event Ingestion:** `ANA` subscribes to the platform's event bus in a read-only mode. It is a passive listener.
*   **Event Version Compatibility:** `ANA` must be able to consume multiple versions of the same event, ensuring that changes to a business domain's event schema do not break the analytics pipelines. It must be backward-compatible.
*   **Replay Safety:** `ANA` must be designed to safely re-process the entire history of events to rebuild its analytical projections from scratch. This is critical for disaster recovery and for correcting historical analytics errors.
*   **Analytical Recomputation Discipline:** When the logic for a metric changes, there must be a formal process for recomputing the historical values of that metric by replaying the relevant events.

**Constitutional Declaration:** The `ANA` domain must not require business domains to acquire locks or wait for it to complete its processing. `ANA` must tolerate eventual consistency and operate asynchronously. The performance and availability of the `ANA` domain must have zero impact on the performance and availability of the core business domains.

---
## SECTION VII — CROSS-DOMAIN COLLISION ANALYSIS

This analysis identifies critical domain boundary violations where analytical logic is improperly embedded within operational domains. These collisions must be resolved to establish the sovereignty of the `ANA` domain.

| Collision Type | Legacy Location | Description of Violation | Canonical Resolution Path |
| :--- | :--- | :--- | :--- |
| **`ANA` ↔ `FIN`** | `src/economic-engine/components/FinancialReporter.ts` | The `FIN` domain is directly responsible for generating complex, multi-dimensional financial reports. This is a reporting function, not a core financial one. | The `FinancialReporter` logic must be completely extracted from the `economic-engine` and rebuilt as a `FinancialProjection` organ within `ANA`. This new organ will consume `Transaction` events from `FIN` and build the reports asynchronously. |
| **`ANA` ↔ `LOG`** | `src/logistics/tracking/index.ts` | The logistics module contains code that is aware of and potentially coupled to the analytics system. This creates an unnecessary dependency. | All direct references to analytics from within the `LOG` domain must be removed. The `LOG` domain should simply emit events like `SHIPMENT_DELIVERED`, and it is the `ANA` domain's responsibility to consume these events and calculate performance metrics. |
| **`ANA` ↔ `TRN`** | (Assumed) | It is highly likely that fleet performance KPIs (e.g., on-time delivery rate) are calculated directly within the `TRN` domain's services. | This logic must be extracted. `TRN` will emit events like `ROUTE_COMPLETED`, and a new `FleetPerformanceProjection` organ in `ANA` will be responsible for calculating all relevant KPIs. |
| **`ANA` ↔ `Runtime`** | `src/analytics-reporting/documentation/ARCHITECTURE.md` | The legacy `analytics-reporting` module makes a specific implementation choice (ClickHouse) and embeds this in its architecture. This violates the separation between the biological organism and the Runtime Plane. | The `ANA` domain will define its required persistence characteristics (e.g., "time-series, high-ingestion"), but the actual choice and management of the database will be handled by a `DataStoreAdapter` in the Runtime Plane. |

---
## SECTION VIII — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy analytics semantics and the canonical `ANA` domain architecture. This is an analysis-only exercise; no creation of organs or other canonical structures is authorized by this document.

| Gap Type | Description | Proposed Canonical Solution |
| :--- | :--- | :--- |
| **Missing AnalyticsProjection Organ** | The legacy platform lacks a central, authoritative organ for managing the creation and lifecycle of analytical read models (projections). | The creation of a canonical `AnalyticsProjection` organ is the primary requirement for the `ANA` domain. This organ will serve as a factory and registry for all analytical projections. |
| **Missing MetricRegistry Organ** | Metrics and KPIs are defined and calculated in an ad-hoc manner across multiple modules, leading to inconsistency and duplication. | A dedicated `MetricRegistry` organ is proposed to serve as the single source of truth for the definition, calculation logic, and versioning of all official business metrics. |
| **Missing ForecastEngine Abstraction** | Forecasting logic is either absent or tightly coupled to specific modules, preventing its reuse. | A generic `ForecastEngine` organ should be proposed to provide a standardized interface for generating predictive forecasts based on historical data from any domain. |
| **Missing DataMart Abstraction** | The legacy system has no formal concept of a data mart—a subject-oriented database for a specific business line. This leads to monolithic, hard-to-manage analytics databases. | The `ANA` domain should introduce a conceptual `DataMart` abstraction, allowing analytical projections to be grouped logically by subject area (e.g., `SalesDataMart`, `LogisticsDataMart`). |
| **Missing CI/EI/IN Coverage** | The legacy analytics modules show no evidence of being integrated with the canonical `CI` (Contextual Intelligence), `EI` (Emotional Intelligence), or `IN` (Intuitive Intelligence) organelle categories, limiting their analytical depth. | All future `ANA` organs must be designed to leverage these advanced analytical organelle categories for more sophisticated insights. |

---
## SECTION IX — FUTURE CONTROLLED INTERACTION PREVIEW

This section defines the anticipated event contracts that will be emitted *by* the `ANA` domain. These events are for notification and alerting purposes only and must not be used to trigger business logic mutations in other domains.

**Constitutional Declaration:** All communication from `ANA` must be asynchronous and based on these immutable, versioned event contracts. These events are informational, not instructional.

| Event Name | Emitting Domain | Consuming Domain(s) | Purpose |
| :--- | :--- | :--- | :--- |
| `METRIC_COMPUTED` | `ANA` | `OBS` (Observability) | To announce that a new value for a registered metric has been calculated and is available for display. |
| `FORECAST_GENERATED` | `ANA` | `OBS` | To announce that a new predictive forecast has been generated. |
| `KPI_THRESHOLD_EXCEEDED` | `ANA` | `OBS`, `NFN` (Notification) | To signal that a Key Performance Indicator has crossed a predefined threshold, potentially triggering an alert to a human operator. |
| `ANALYTICS_VERSION_INCREMENTED` | `ANA` | `OBS` | To signal that a significant, non-backward-compatible change has been made to an analytical model, requiring consumers (like dashboards) to update. |

---
## SECTION X — EXPLICIT PROHIBITIONS

To eliminate any ambiguity, the following actions are explicitly and constitutionally forbidden. Any attempt to perform these actions will result in an immediate AGVE (Automated Governance Validation Engine) Level 4 freeze.

| Forbidden Action | Rationale |
| :--- | :--- |
| **`ANA` mutating domain state** | `ANA` is a read-only domain. It cannot change the authoritative state of any business entity. |
| **`ANA` embedding routing logic** | Route calculation is the sovereign responsibility of the `TRN` domain. |
| **`ANA` embedding payment execution** | Payment processing is the sovereign responsibility of the `FIN` domain. |
| **`ANA` embedding entitlement gating** | Policy enforcement is the sovereign responsibility of the `CFG` domain. |
| **`ANA` embedding persistence decisions** | The choice of database technology is a Runtime Plane decision. |
| **`ANA` performing direct database writes to domain tables** | All communication must be via the event bus. `ANA` cannot bypass this by writing directly to another domain's database. |

---
## SECTION XI — HARD STOP

This document authorizes **governance modeling and translation mapping only** for the **Analytics & Intelligence (ANA)** domain.

It does NOT authorize:

*   Organ creation
*   Issue creation
*   Activation
*   Registry mutation
*   Master Document modification

Any deviation from this mandate will trigger an AGVE (Automated Governance Validation Engine) freeze.

---
## SECTION XII — RATIFICATION STATEMENT

*   **Status:** RATIFIED
*   **Authority:** Founder
*   **Date:** 2026-02-21
*   **Scope:** ANA domain only

---
