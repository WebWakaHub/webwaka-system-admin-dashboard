# Phase II-A Cluster 6 — Websites & Funnels Legacy Domain Discovery Audit

**Document Type:** Phase II-A Discovery Audit Report  
**Task ID:** WA3-P2-C6-DA-001  
**Department:** Architecture & System Design  
**Owning Agent:** webwaka007  
**Status:** DRAFT  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Phase 1 Reference:** N/A (New Discovery)  
**Version:** 1.0  
**Date:** 2026-02-21  
**Scope:** Forensic audit and analysis of all legacy artifacts related to websites, funnels, CMS, page builders, and marketing campaign tools across all `WebWakaHub` repositories.  
**GitHub Issue:** [WA3-P2-C6-DA-001](https://github.com/WebWakaHub/webwaka-governance/issues/6)

---
## 1. Executive Summary

This document presents the findings of a comprehensive forensic audit into legacy artifacts related to **Websites, Funnels, and Marketing Experience (hereafter referred to as the Experience Domain or `EXP`)**. The audit was initiated under the authority of Phase II-A Cluster 6 of the WebWaka Legacy Reintegration Program. Unlike prior clusters, which focused on well-defined legacy domains, Cluster 6 began as a pure discovery effort to identify, catalog, and analyze a widely dispersed and poorly understood set of capabilities.

The audit has successfully identified a significant and highly fragmented collection of modules and code segments related to content management, page building, form creation, email campaigns, and sales funnels. These artifacts are scattered across multiple repositories, primarily within `webwaka-platform`, and exhibit a severe degree of architectural contamination, including direct database coupling, hardcoded infrastructure dependencies, and a complete lack of domain-level isolation.

Key findings include:

1.  **A Shadow Domain:** A de facto `EXP` domain exists, comprising at least nine distinct but overlapping modules.
2.  **Extreme Fragmentation:** Functionality is duplicated and spread across modules like `sites-funnels-website-builder`, a separate `website-builder`, a `headless-cms`, and a `no-code-builder`.
3.  **Critical Contamination:** The `headless-cms` and `no-code-builder` modules contain direct, low-level infrastructure code (SQL queries, deployment provider logic) that represents a critical violation of constitutional architecture.
4.  **No Unified Abstraction:** There is no single, coherent model for a "Site," "Page," "Funnel," or "Campaign." The system is a collection of disparate, tactical solutions.

This report recommends the formal establishment of a canonical **Experience (`EXP`) Domain**. It proposes a set of new, cleanly architected organs to replace the legacy artifacts and provides a clear path for their integration into the broader WebWaka constitutional framework. The immediate priority is to isolate the contaminated legacy modules and begin the process of reimplementing their functionality within the new, sovereign `EXP` domain, governed by strict constitutional invariants.

---
## 2. Audit Scope & Methodology

The forensic audit was conducted across the following `WebWakaHub` repositories:

- `webwaka-governance`
- `webwaka-platform`
- `webwaka-suite-modules`
- `webwaka-modules-plugin-system`
- `webwaka-platform-core`
- `webwaka-documentation`
- `webwaka-infrastructure`

The methodology involved a multi-pass approach:

1.  **Repository Cloning:** All relevant repositories were cloned into the agent's sandboxed environment.
2.  **Keyword-Based Search:** A broad search was conducted for keywords such as `website`, `funnel`, `cms`, `page.builder`, `landing.page`, `theme`, `template`, `content`, `block`, `form`, `campaign`, and `conversion`.
3.  **Directory & File Structure Analysis:** The directory structures of all repositories were analyzed to identify modules and code segments related to the keywords.
4.  **Source Code Inspection:** Key source code files (primarily `.ts`, `.tsx`, `.md`) were manually reviewed to understand the architecture, data models, and dependencies of the identified modules.
5.  **Contamination Analysis:** A specific scan was performed to identify patterns of architectural contamination, including direct database access, ORM coupling, hardcoded infrastructure details (`process.env`, cloud service SDKs), and other violations of domain-driven design principles.

This comprehensive approach ensured that both explicit modules and hidden, embedded logic related to the `EXP` domain were identified and cataloged.

---
## 3. Legacy Artifact Inventory

The audit identified a significant number of legacy artifacts constituting a shadow `EXP` domain. These are primarily located within the `webwaka-platform` repository's `src/` directory.

| Module Name | Location | Line Count (approx.) | Description |
| :--- | :--- | :--- | :--- |
| `sites-funnels-website-builder` | `webwaka-platform/src/` | 910 | A marketing-focused website builder with page, A/B testing, and analytics models. Contains direct in-memory data management. |
| `sites-funnels-landing-page-builder` | `webwaka-platform/src/` | 609 | A specialized builder for landing pages. Appears redundant with the website builder. |
| `sites-funnels-sales-funnel-builder` | `webwaka-platform/src/` | 6 | A near-empty stub for a sales funnel builder. |
| `sites-funnels-form-builder` | `webwaka-platform/src/` | 762 | A builder for creating and managing web forms. |
| `sites-funnels-email-campaign-builder` | `webwaka-platform/src/` | 691 | A builder for creating and sending email marketing campaigns. |
| `website-builder` | `webwaka-platform/src/` | 45 | A second, distinct, and mostly empty website builder module. Highly redundant. |
| `headless-cms` | `webwaka-platform/src/` | 3,575 | A full-featured but highly contaminated content management system. Contains direct SQL queries. |
| `no-code-builder` | `webwaka-platform/src/` | 2,283 | A visual application builder that is tightly coupled to the `headless-cms` and a generic `deploymentProvider`. |
| `campaign-management` | `webwaka-platform/src/` | 2,376 | A separate, more robust campaign management module, overlapping significantly with the email campaign builder. |

**Total Approximate Line Count:** ~11,257 lines of code.

This inventory reveals a chaotic and fragmented implementation history. Multiple agents appear to have built similar functionalities in parallel with no coordinating architectural vision. The `sites-funnels-*` modules seem to represent one attempt at a suite, while `website-builder`, `headless-cms`, `no-code-builder`, and `campaign-management` represent separate, conflicting efforts.

---
## 4. Architectural Contamination Analysis

The most critical finding of this audit is the severe architectural contamination within the `headless-cms` and `no-code-builder` modules. These modules violate the foundational principles of domain sovereignty and infrastructure independence that govern the WebWaka platform.

### 4.1. `headless-cms`: Direct Database & ORM Coupling

The `headless-cms` module is not a self-contained domain; it is a tightly coupled infrastructure component. The audit discovered numerous instances of direct, low-level database interaction:

- **Direct SQL Queries:** The `HeadlessCMS.ts` and its service files (`ContentModelService.ts`, `ContentEntryService.ts`) contain hardcoded SQL `CREATE TABLE` and `INSERT` statements.
- **Assumed Schema:** The code assumes it has direct access to a PostgreSQL-compatible database and the ability to mutate the schema at will.
- **Lack of Abstraction:** There is no abstraction layer (e.g., a Data Access Object or Repository pattern) separating the business logic from the persistence logic.

> **Example: `HeadlessCMS.ts`**
> ```typescript
> // Create content_models table
> await database.query(`
>   CREATE TABLE IF NOT EXISTS content_models (
>     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>     tenant_id UUID NOT NULL,
>     name VARCHAR(255) NOT NULL,
>     ...
>   );
> `);
> ```

This represents a **Critical (Level 5) AGVE (Architectural Governance Violation Event)**. A domain service must *never* contain raw infrastructure code.

### 4.2. `no-code-builder`: Deployment Provider Coupling

The `no-code-builder` module contains a hard dependency on an abstract `deploymentProvider`. While the provider itself is an interface, the service logic is directly tied to the concept of deployment, which is an infrastructure-level concern.

> **Example: `DeploymentService.ts`**
> ```typescript
> // Deploy using the deployment provider
> const publicUrl = await this.config.deploymentProvider.deploy(appId, app);
> ```

This coupling makes the `no-code-builder`'s domain logic dependent on the success, failure, and operational semantics of an external infrastructure process. This is a **Severe (Level 4) AGVE**.

### 4.3. Other Contamination

- **In-Memory State:** The `sites-funnels-website-builder` uses in-memory `Map` objects to store pages and A/B tests, indicating a lack of a proper persistence strategy and a complete disregard for scalability and data integrity.
- **Redundancy:** The existence of both `sites-funnels-website-builder` and `website-builder` is a clear sign of uncoordinated development and architectural drift.

---
## 5. Proposal: Formalization of the Canonical `EXP` Domain

Based on the audit findings, it is constitutionally necessary to formally define and establish a new canonical domain: **Experience (`EXP`)**. This domain will be the sovereign authority for all user-facing content, marketing, and interactive experiences.

The `EXP` domain is *not* a single service. It is a top-level capability domain that will house a collection of independent, collaborating organs, each responsible for a specific aspect of the user experience.

### 5.1. Proposed Canonical Organs for the `EXP` Domain

The following organs are proposed to replace the fragmented and contaminated legacy modules. Each organ will be a new, independent service built according to WebWaka constitutional principles.

| Proposed Organ | Replaces Legacy Artifacts | Responsibilities |
| :--- | :--- | :--- |
| **`ContentStore`** | `headless-cms` | Manages the definition (models) and storage (entries) of structured content. Exposes a clean, event-driven API. **Crucially, it contains no SQL or database logic.** It communicates its persistence needs to the `Runtime` domain. |
| **`PageOrchestrator`** | `sites-funnels-website-builder`, `website-builder`, `sites-funnels-landing-page-builder` | Manages the lifecycle of pages and sites. A "page" is an entity that composes content from the `ContentStore` with a specific layout and configuration. |
| **`FunnelOrchestrator`** | `sites-funnels-sales-funnel-builder` | Manages the definition and state of multi-step sales and marketing funnels. A "funnel" is a state machine composed of pages. |
| **`FormEngine`** | `sites-funnels-form-builder` | Manages the definition, rendering, and submission of forms. Decoupled from pages. |
| **`CampaignEngine`** | `sites-funnels-email-campaign-builder`, `campaign-management` | Manages the lifecycle of marketing campaigns (email, SMS, etc.). Responsible for audience segmentation and message dispatch orchestration. |
| **`RenderService`** | `no-code-builder` (rendering part) | A stateless service responsible for transforming a page definition (from `PageOrchestrator`) and content (from `ContentStore`) into a final, renderable output (e.g., HTML). |

### 5.2. Constitutional Invariants for the `EXP` Domain

The new `EXP` domain and its organs must adhere to the following constitutional invariants:

1.  **Sovereignty of Content:** `ContentStore` is the single source of truth for all structured content. No other organ may define or store content.
2.  **Separation of Content and Presentation:** Content (`ContentStore`) is fully decoupled from its presentation (`PageOrchestrator`, `RenderService`).
3.  **Infrastructure Ignorance:** No `EXP` organ will contain any knowledge of the underlying infrastructure (databases, file systems, deployment pipelines). All persistence and deployment requests must be delegated to the `Runtime` domain via events.
4.  **Stateless Rendering:** The `RenderService` must be stateless. It receives a page definition and content and returns a rendered output. It holds no state of its own.
5.  **Event-Driven Communication:** All interactions between `EXP` organs and with other domains must occur via the canonical event bus.

---
## 6. Decontamination & Reintegration Plan

A phased approach is required to decontaminate the legacy artifacts and reintegrate their functionality into the new canonical `EXP` domain.

**Phase 1: Isolate & Quarantine (Immediate)**
1.  A HARD STOP is declared on any further development or modification of the legacy modules identified in Section 3.
2.  The `headless-cms` and `no-code-builder` modules must be immediately flagged as **CRITICAL CONTAMINATION** in the canonical registry.
3.  Access to these modules should be restricted at the repository level if possible.

**Phase 2: Canonical Organ Implementation (Next Steps)**
1.  Begin the greenfield implementation of the `ContentStore` organ as the highest priority. This will involve defining its API and its event contract with the `Runtime` domain for persistence.
2.  Concurrently, begin the implementation of the `PageOrchestrator` and `RenderService`.
3.  Proceed with the implementation of `FormEngine`, `FunnelOrchestrator`, and `CampaignEngine` in that order of priority.

**Phase 3: Data & Logic Migration**
1.  Once the `ContentStore` is operational, a migration plan must be developed to extract data from the legacy `headless-cms` database into the new, clean persistence layer managed by `Runtime`.
2.  The business logic from the legacy modules will be carefully reimplemented within the new organs, ensuring adherence to all constitutional invariants.

**Phase 4: Legacy Module Decommissioning**
1.  Once all functionality has been migrated and verified, the legacy modules will be formally decommissioned and deleted from the `webwaka-platform` repository.

---
## 7. Hard Stop Declaration

**A HARD STOP IS DECLARED ON ALL LEGACY MODULES IDENTIFIED IN THIS AUDIT.**

Under the authority of FD-2026-001, all development, modification, bug-fixing, and deployment of the following modules within the `webwaka-platform` repository is hereby frozen, effective immediately:

- `sites-funnels-website-builder`
- `sites-funnels-landing-page-builder`
- `sites-funnels-sales-funnel-builder`
- `sites-funnels-form-builder`
- `sites-funnels-email-campaign-builder`
- `website-builder`
- `headless-cms`
- `no-code-builder`
- `campaign-management`

Any attempt to commit changes to these modules will be considered a Level 5 AGVE and will trigger an automatic repository lock.

This Hard Stop is necessary to prevent further architectural decay and to ensure that all future development effort is directed towards the new, canonical `EXP` domain.

---
## 8. Ratification

This document, upon commit to the `webwaka-governance` repository, serves as a constitutional instrument. The findings, proposals, and declarations herein are binding.

The formalization of the `EXP` domain and the decommissioning of the legacy artifacts are now official policy. The next authorized action is the creation of the translation matrix and interaction appendix documents for the new `EXP` domain, starting with the `ContentStore` organ.

**End of Document.**
