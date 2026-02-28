_**DOCUMENT RENDERED VIA MANUS. IMAGES AND DIAGRAMS MAY BE MISSING.**_

# Phase II-A — Cluster 6
# Legacy → Canonical Translation Matrix — EXP Domain

**Document Type:** Legacy to Canonical Translation Matrix  
**Task ID:** WA3-P2-C6-TM-001  
**Department:** Architecture & System Design  
**Owning Agent:** webwaka007  
**Status:** RATIFIED  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Constitution Reference:** EXP_CANONICAL_DOMAIN_CONSTITUTION.md  
**Version:** 1.0  
**Date:** 2026-02-21  
**Scope:** Translation of legacy Experience artifacts into the canonical EXP domain model.  
**GitHub Issue:** [WA3-P2-C6-TM-001](https://github.com/WebWakaHub/webwaka-governance/issues/8)

---
## I. Constitutional Authority

This document executes the translation of legacy artifacts into the canonical Experience (EXP) domain, as mandated by the `EXP_CANONICAL_DOMAIN_CONSTITUTION.md`. This operation is performed in **Governance Definition Only** mode. It provides a structural mapping and decontamination plan. No organ creation, activation, or registry mutation is authorized.

---

## II. Legacy Module Inventory

The following table summarizes the nine legacy modules identified in the discovery audit, now classified with their contamination level.

| Legacy Module | Repository | Lines (approx.) | Primary Function | Contamination Level | Redundancy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sites-funnels-website-builder` | `webwaka-platform` | 910 | Marketing website builder | MEDIUM | High | HARD STOP |
| `sites-funnels-landing-page-builder` | `webwaka-platform` | 609 | Specialized landing page builder | MEDIUM | High | HARD STOP |
| `sites-funnels-sales-funnel-builder` | `webwaka-platform` | 6 | Stub for a sales funnel builder | LOW | N/A | HARD STOP |
| `sites-funnels-form-builder` | `webwaka-platform` | 762 | Web form creation and management | MEDIUM | Medium | HARD STOP |
| `sites-funnels-email-campaign-builder` | `webwaka-platform` | 691 | Email marketing campaign builder | MEDIUM | High | HARD STOP |
| `website-builder` | `webwaka-platform` | 45 | Redundant website builder stub | LOW | Critical | HARD STOP |
| `headless-cms` | `webwaka-platform` | 3,575 | Content management system | **CRITICAL** | Low | HARD STOP |
| `no-code-builder` | `webwaka-platform` | 2,283 | Visual application builder | **CRITICAL** | Medium | HARD STOP |
| `campaign-management` | `webwaka-platform` | 2,376 | Robust campaign management | HIGH | High | HARD STOP |

---
## III. Canonical Organ Assignment Matrix

This matrix maps each legacy artifact to its target canonical organ, defining the required action and salvage strategy.

| Legacy Artifact | Proposed Canonical Organ | Action Required | Contamination Risk | Salvage Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `headless-cms` | `ContentStore` | **Replace Entirely** | CRITICAL | Discard all persistence & SQL logic. Salvage `ContentModel` and `ContentField` type definitions only. Reimplement all services using event-driven, persistence-ignorant patterns. |
| `no-code-builder` | `PageOrchestrator`, `RenderService` | **Decompose & Replace** | CRITICAL | Discard all deployment provider logic. Salvage `ComponentDefinition` types and rendering logic for `RenderService`. Reimplement orchestration logic within `PageOrchestrator`. |
| `sites-funnels-website-builder` | `PageOrchestrator` | **Merge & Reimplement** | MEDIUM | Discard all in-memory state management. Salvage `Page` and `Template` type definitions. Reimplement all state management to use `ExperienceVersionRegistry`. |
| `sites-funnels-landing-page-builder` | `PageOrchestrator` | **Merge & Discard** | MEDIUM | Discard as redundant. Its functionality is a subset of `PageOrchestrator`. |
| `website-builder` | `PageOrchestrator` | **Discard** | LOW | Discard entirely. A redundant, empty stub. |
| `sites-funnels-form-builder` | `FormEngine` | **Reimplement** | MEDIUM | Salvage `Form` and `Field` type definitions. Reimplement submission handling to be event-driven and decoupled from the page. |
| `campaign-management` | `CampaignEngine` | **Replace** | HIGH | Salvage high-level concepts (Campaign, Audience, Segment). Reimplement all logic to be fully event-driven and decoupled from message dispatch infrastructure. |
| `sites-funnels-email-campaign-builder` | `CampaignEngine` | **Merge & Discard** | MEDIUM | Discard as redundant. Its functionality is a less-developed version of `campaign-management`. |
| `sites-funnels-sales-funnel-builder` | `FunnelOrchestrator` | **Reimplement** | LOW | Discard stub. Implement funnel state machine logic from scratch according to constitutional model. |

---
## IV. Contamination Decomposition Plan

The two critically contaminated modules require a precise decomposition strategy to separate salvageable logic from toxic, infrastructure-coupled code.

### `headless-cms` (CRITICAL)
- **Discard (100%):** All files containing `database.query`, `pool.query`, or any raw SQL strings. This includes large portions of `HeadlessCMS.ts`, `ContentDeliveryService.ts`, and `ContentEntryService.ts`.
- **Salvage & Refactor:** The type definitions in `types/index.ts` (e.g., `ContentModel`, `ContentField`, `FieldType`) are conceptually sound and can be reused in the new `ContentStore` organ after being stripped of any persistence-related metadata.
- **Rewrite Required:** The core services for managing content models and entries must be rewritten from scratch to be stateless and to communicate persistence needs to the `Runtime` domain via events (`CreateContentModelRequest`, `PersistContentEntryRequest`, etc.).

### `no-code-builder` (CRITICAL)
- **Discard (100%):** All logic related to the `deploymentProvider` interface, including the entirety of `DeploymentService.ts`. Any code referencing `process.env` or other environment-specific variables must also be discarded.
- **Salvage & Relocate (to `RenderService`):** The component rendering logic in `renderer/ComponentRenderer.ts` is largely salvageable. It is stateless transformation logic and can be moved into the new `RenderService` organ.
- **Salvage & Relocate (to `PageOrchestrator`):** The application and page definition types (`ApplicationDefinition`, `Page`) and the core composition logic can be adapted for use within the `PageOrchestrator`. The concept of a `ComponentDefinition` is also a valuable, salvageable asset.

---

## V. Experience OS Extension Analysis

The mandate for Cluster 6 includes laying the foundation for a full **Experience OS**, capable of composing not just websites but also dynamic SaaS dashboards and entire applications. The legacy audit reveals both gaps and opportunities in this regard.

- **Application-Level Composition:** The `no-code-builder` shows a nascent concept of an "Application" (`ApplicationDefinition`) composed of pages. This is a valuable starting point but lacks the robustness required. **Gap:** A formal `Application` aggregate is needed in the canonical model, managed by a dedicated organ (potentially `ApplicationOrchestrator`).
- **Component Registry:** The `no-code-builder` implicitly uses a set of hardcoded components (`Text`, `Image`, `Button`). This is insufficient. **Gap:** A formal `ComponentRegistry` organ is required. This organ would be responsible for managing a library of available UI components (both native and custom) that can be used in the `PageOrchestrator`.
- **Dynamic Widget Injection:** The legacy code has no concept of dynamically injecting widgets or blocks based on user entitlements or other runtime conditions. **Gap:** The canonical model must include a `WidgetInjectionPoint` abstraction and a clear interaction pattern with the `ENT` and `CFG` domains.
- **Permission-Based Component Visibility:** This is entirely absent. **Gap:** The `PageOrchestrator` must be designed to query the `ENT` domain to determine component visibility for a given user at render time.
- **Multi-Surface Experience Generation:** The legacy code is entirely web-focused. **Gap:** The `RenderService` must be designed to be extensible, allowing for different renderers to target different surfaces (e.g., web, mobile, email, PDF) from the same abstract experience definition.

---
## VI. Cross-Domain Collision Matrix

Legacy artifacts exhibit numerous domain boundary violations. The canonical EXP domain will resolve these through strict, event-driven interfaces.

| Collision | Domains Involved | Severity | Canonical Resolution |
| :--- | :--- | :--- | :--- |
| Product Display | `EXP` ↔ `COM` | HIGH | `EXP` composes a `ProductBlock` which requests read-only product data from `COM`. All "Add to Cart" actions emit a command (`AddToCartCommand`) that `COM` consumes. `EXP` does not mutate cart state. |
| Checkout Process | `EXP` ↔ `FIN` | CRITICAL | `EXP` composes a `CheckoutBlock` which requests a checkout session from `FIN`. All payment processing occurs within an iframe or redirected context owned by `FIN`. `EXP` never handles payment details. |
| User Authentication | `EXP` ↔ `IDA` | CRITICAL | `EXP` composes an `AuthBlock` which delegates all authentication logic to `IDA`. `EXP` receives an identity token from `Runtime` but does not manage sessions or credentials. |
| Analytics Tracking | `EXP` ↔ `ANA` | MEDIUM | `EXP` composes a `TrackingBlock` or uses a frontend adapter that emits standardized `AnalyticsEvent`s. `ANA` consumes these events. `EXP` does not compute or store analytical data. |
| Feature Gating | `EXP` ↔ `CFG` | HIGH | `EXP` requests configuration from `CFG` at render time to determine which features or UI elements to display. `EXP` does not embed feature flag logic directly. |
| Deployment | `EXP` ↔ `Runtime` | CRITICAL | `EXP` emits an `ExperiencePublished` event. `Runtime` consumes this event and orchestrates the entire deployment pipeline (build, provision, host). `EXP` has zero deployment logic. |
| Entitlement Gating | `EXP` ↔ `ENT` | HIGH | `EXP` requests entitlement information from `ENT` for a given user to control access to pages, funnels, or specific blocks. `EXP` does not define or evaluate permissions. |

---

## VII. Structural Gap Identification

The translation from the chaotic legacy state to a robust Experience OS reveals several missing canonical abstractions that must be modeled.

- **`BlockLibrary`:** A formal abstraction and registry for reusable components that can be composed into pages. This is a critical gap for enabling a true no-code experience.
- **`LayoutRegistry`:** A registry for reusable page layouts and templates. The legacy code mixes layout and content; they must be separated.
- **`ComponentRegistry`:** As identified in the Experience OS analysis, this is essential for managing the available building blocks for application composition.
- **`ExperienceSchemaModel`:** A formal schema (e.g., JSON Schema) for validating the structure of an experience definition, ensuring integrity before it is published.
- **`UI-State` Abstraction:** A mechanism for managing transient UI state (e.g., open modals, selected tabs) without polluting the core experience definition.
- **Frontend Event Adapter:** A standardized library for emitting canonical events (`AddToCartCommand`, `FormSubmittedEvent`, etc.) from the rendered frontend back to the appropriate domain.
- **Page-to-Domain Command Boundary Adapter:** A secure gateway, managed by `Runtime`, that receives commands from the frontend and routes them to the correct domain, enforcing permissions and preventing unauthorized mutations.

---

## VIII. Migration Complexity Estimation

This is a structural forecast only and does not constitute a formal project plan or issue generation.

| Factor | Estimate | Notes |
| :--- | :--- | :--- |
| **Rewrite Percentage** | ~90% | The high level of contamination and architectural mismatch requires a near-total rewrite. |
| **Reusable Logic Percentage** | ~10% | Primarily `type` definitions and some stateless rendering functions. |
| **Decomposition Required** | High | `headless-cms` and `no-code-builder` must be carefully dissected to extract the small amount of salvageable logic. |
| **Translation Difficulty** | Very High | This is the most complex translation cluster to date due to the extreme fragmentation and contamination of the legacy code. |
| **Approx. Organ Task Scope** | | |
| `ContentStore` | Large | Requires careful design of the persistence-ignorant model and migration path. |
| `PageOrchestrator` | Large | Core of the composition logic; complex state management. |
| `RenderService` | Medium | Mostly stateless transformation, but must be highly performant and extensible. |
| `FunnelOrchestrator` | Medium | State machine logic is well-understood but requires careful implementation. |
| `FormEngine` | Medium | Standard form logic, but needs a robust, event-driven submission pipeline. |
| `CampaignEngine` | Large | Involves complex audience segmentation, scheduling, and integration with dispatch services. |
| `ExperienceVersionRegistry` | Small | A critical but relatively simple organ for version tracking. |

---
## IX. Hard Stop

This document provides a translation model only. All organ creation, activation, registry changes, and other mutations are under a HARD STOP. The purpose of this document is strictly for governance modeling and to define the path forward for the canonical implementation of the EXP domain.

---

## X. Ratification Statement

**Status:** RATIFIED  
**Authority:** Founder (webwaka007)  
**Date:** 2026-02-21T13:45:00Z  
**Scope:** Translation modeling for the Experience (EXP) domain only.

This translation matrix is now the binding plan for the decommissioning of the legacy EXP artifacts and the implementation of their canonical replacements.

**End of Document.**
