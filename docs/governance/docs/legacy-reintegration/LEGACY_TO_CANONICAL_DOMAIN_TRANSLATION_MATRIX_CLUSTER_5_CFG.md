# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 5: CONFIGURATION & POLICY (CFG)

---
## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes the **Legacy to Canonical Domain Translation Matrix for Cluster 5: Configuration & Policy (CFG)**. It operates under the authority of the Founder (`webwaka007`) and defines the constitutional separation of the `CFG` domain from all other capability, operational, and runtime domains. Its purpose is to establish `CFG` as the sovereign, abstract brain for defining rules and policies, while preventing it from becoming entangled in the execution of business logic or the management of runtime infrastructure.

This document performs **governance definition only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No organ creation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the platform's constitutional documents. Any deviation will trigger an AGVE (Automated Governance Validation Engine) Level 4 freeze.

---
## SECTION II — CANONICAL CFG DOMAIN SCOPE

The `CFG` domain is constitutionally defined as the **abstract policy definition layer**. It answers the question, "What are the rules?" It does not answer the questions, "How are the rules enforced?" (a domain responsibility) or "How is the environment configured?" (a Runtime Plane responsibility).

### Inclusions: What CFG Owns

| Responsibility | Description |
| :--- | :--- |
| **Policy & Rule Definition** | Modeling the structure of business policies, validation rules, and pricing rules in an abstract, implementation-agnostic way. |
| **Feature Flag Definition** | Defining the existence and structure of feature flags, but not their runtime evaluation. |
| **Configuration Abstraction** | Defining the schema for business-level configuration (e.g., commission rates, workflow steps), separate from infrastructure configuration. |
| **Policy & Configuration Versioning** | Managing the lifecycle and versioning of all rule sets, policies, and configuration schemas. |

### Exclusions: What CFG Does Not Own

| Responsibility | Correct Domain | Rationale |
| :--- | :--- | :--- |
| **Runtime Environment Variables** | `Runtime Plane` | Infrastructure-level configuration (e.g., database connection strings, port numbers) is a Runtime concern. |
| **Secrets Management** | `Runtime Plane` | The storage and injection of secrets (e.g., API keys) is a security-sensitive Runtime function. |
| **Domain State Mutation** | `COM`, `FIN`, `LOG`, etc. | `CFG` defines the rules, but the business domains are responsible for executing the logic and changing their own state. |
| **Entitlement Enforcement** | `IDA` / Domain Logic | `CFG` may define a policy (e.g., "Premium users can create 100 products"), but the `IDA` (Identity) and business domains are responsible for checking and enforcing this. |

**Constitutional Declaration:** The `CFG` domain produces **configuration artifacts** (e.g., versioned JSON schemas, rule sets). These artifacts are consumed by business domains and the Runtime Plane. `CFG` is constitutionally forbidden from executing business logic or directly binding to infrastructure.

---
## SECTION III — LEGACY CONFIGURATION & POLICY ASSET INVENTORY

This section provides a comprehensive inventory of all legacy modules, components, and code segments related to configuration and policy that have been identified within the `webwaka-platform` repository.

### Group A: Pure Configuration Files

These assets are dedicated to configuration, but they often mix business logic configuration with runtime configuration.

| Legacy Asset | Location | Description |
| :--- | :--- | :--- |
| `*.config.ts` files | Various | Files like `gateway.config.ts` and `sync-engine.config.ts` mix runtime settings (ports, intervals) with what should be abstract business rules (rate limits, conflict strategies). |
| `EconomicEngineConfig.ts` | `src/economic-engine/config/` | This file contains a mix of feature toggles (`enableAuditLogging`), business rules (`commissionConfig`), and validation logic, all within a single class. |

### Group B: Policy Definitions

These assets contain explicit policy or rule definitions.

| Legacy Asset | Location | Description |
| :--- | :--- | :--- |
| `RuleEngine.ts` | `src/fraud-prevention/components/` | A fully-fledged rule engine for fraud detection. It defines rule structures (`FraudRule`), conditions, and actions. This is a powerful policy asset that is currently trapped within the `fraud-prevention` module. |

### Group C: Embedded Contamination (Business Domains)

This is the most critical category, where policy and configuration are hardcoded or tightly coupled within core business logic.

| Legacy Asset | Location | Description of Contamination |
| :--- | :--- | :--- |
| Commission Logic | `src/economic-engine/` | The `EconomicEngine` directly calculates commissions based on a hardcoded configuration structure. The rules for how commissions are calculated are not abstract and are embedded in the service logic. |
| Pricing & Rate Limits | `src/ai-abstraction-layer/` & `src/hospitality-booking-engine/` | Rate limiting logic and potentially pricing rules are scattered across multiple modules, often with hardcoded threshold values. |
| Validation Logic | Various | Validation rules (e.g., `validateSyncEngineConfig`) are implemented as imperative code within configuration loaders or services, rather than being defined declaratively. |

### Group D: Runtime Contamination

These assets represent a violation where business-level policy is mixed with runtime environment concerns.

| Legacy Asset | Location | Description of Contamination |
| :--- | :--- | :--- |
| `loadGatewayConfig` | `src/modules/api-layer/config/gateway.config.ts` | This function loads configuration directly from `process.env`. This couples the business logic configuration (e.g., default rate limit) to the runtime environment variable mechanism. |
| Feature Toggles | `src/economic-engine/config/EconomicEngineConfig.ts` | The `enableAuditLogging` and `enableTransactionVerification` flags are simple booleans within a config class, lacking a centralized, abstract feature flag management system. |

---
## SECTION IV — CFG TRANSLATION MATRIX

This matrix translates the identified legacy assets into the canonical `CFG` domain, proposing a set of organs and tissues to properly isolate and manage these capabilities. This is a modeling exercise only; no organ creation is authorized.

| Legacy Asset | Canonical Domain | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Boundary Risk | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `*.config.ts` files | `CFG` / `Runtime` | `ConfigurationRegistry` | `ConfigSchema`, `ConfigValidator` | `JsonSchemaConfig` | `ST` (Storage), `DF` (Definition) | **High** | A strict separation is required. Runtime settings (ports, hosts) must be handled by the Runtime Plane. Business logic settings (rate limits, strategies) must be moved into a `ConfigurationRegistry` organ in `CFG`. |
| `RuleEngine.ts` | `CFG` | `RuleEngine` | `RuleSchema`, `RuleValidator`, `RuleSetPublisher` | `JsonRuleSet` | `DF`, `PB` (Publishing) | **Medium** | The core rule definition logic of this engine should be extracted to become a canonical `RuleEngine` organ in `CFG`. The *enforcement* of these rules remains the responsibility of the consuming domain (e.g., `fraud-prevention`). |
| Commission Logic | `CFG` | `PolicyRegistry` | `PolicySchema`, `PolicyValidator` | `CommissionPolicy` | `DF`, `ST` | **Critical** | All hardcoded commission percentages and logic must be removed from the `economic-engine`. They will be redefined as a formal `CommissionPolicy` within the `PolicyRegistry`. The `FIN` domain will then consume this policy to perform its calculations. |
| Feature Toggles | `CFG` | `FeatureFlagRegistry` | `FlagSchema`, `FlagValidator` | `FeatureFlag` | `DF`, `ST` | **High** | All ad-hoc feature toggles must be migrated to a central `FeatureFlagRegistry`. This organ will manage the definition, scope (global, tenant), and versioning of all feature flags. |
| `loadGatewayConfig` | `Runtime Plane` | `EnvironmentAdapter` | `EnvVarReader` | `EnvVar` | `AD` (Adaptation) | **Critical** | The responsibility for reading from `process.env` must be moved to an `EnvironmentAdapter` in the Runtime Plane. The `CFG` domain will define *what* configuration is needed, and the adapter will be responsible for sourcing it from the environment. |

---
## SECTION V — POLICY VS. EXECUTION INVARIANT

This invariant establishes the absolute constitutional separation between defining a policy and executing the logic that enforces it. This is the core principle of the `CFG` domain.

**Policy Definition ≠ Policy Enforcement**

*   **`CFG` Defines the Rule Structure:** The `CFG` domain is responsible for creating an abstract, declarative definition of a policy. For example, it defines a `CommissionPolicy` with fields for `rate` and `beneficiaryLevel`. It produces a versioned, machine-readable artifact (e.g., a JSON file).
*   **Domain Organs Execute Decisions:** A business domain organ (e.g., the `FIN` domain's `CommissionCalculator`) consumes this policy artifact. It then uses the `rate` defined in the policy to perform its calculation. The `FIN` domain owns the execution; `CFG` owns the definition.
*   **Runtime Enforces Environment:** The Runtime Plane consumes configuration artifacts to set up the environment. For example, it reads the `port` number from a configuration file and binds the web server to that port.

**Constitutional Declaration:** The `CFG` domain is constitutionally forbidden from directly mutating the state of any other business domain. It cannot change an order's status, create a ledger entry, or modify a shipment. It publishes policy and configuration; it does not execute it.

---
## SECTION VI — FEATURE FLAG DISCIPLINE

This section defines the constitutional discipline for managing feature flags, ensuring they are used as a configuration tool, not as a way to create alternative versions of business logic that violate domain invariants.

*   **Flag Definition Modeling:** All feature flags must be formally defined in the `FeatureFlagRegistry`, including their name, scope (global, tenant, user), and possible values (e.g., boolean, string, number).
*   **Versioned Flag Structure:** The schema of a feature flag's configuration is versioned. This allows for changes to the flag's structure over time without breaking consumers.
*   **Flag Evaluation Separation:** The `CFG` domain defines the flag. A separate service, likely in the Runtime Plane or a dedicated `FlagEvaluationService`, is responsible for evaluating the flag for a given context (e.g., this user, this tenant) and returning the result.
*   **No Hardcoded Inline Checks:** Code must not contain hardcoded checks like `if (config.featureFlags.newCheckout)`. Instead, it should use a more abstract pattern, such as `if (checkoutService.isVersion('v2'))`. The decision of which service version to use is determined by the flag evaluation, but the business logic itself is not littered with conditional flag checks.

**Constitutional Declaration:** A feature flag must not be used to enable a code path that violates the established invariants of a domain. For example, a feature flag cannot enable a version of the `COM` domain that writes directly to the `FIN` domain's database tables.

---
## SECTION VII — CROSS-DOMAIN COLLISION ANALYSIS

This analysis identifies critical domain boundary violations where configuration and policy logic are improperly embedded within other domains. These collisions must be resolved to establish the sovereignty of the `CFG` domain.

| Collision Type | Legacy Location | Description of Violation | Canonical Resolution Path |
| :--- | :--- | :--- | :--- |
| **`CFG` ↔ `FIN`** | `src/economic-engine/` | Commission rates and revenue sharing percentages are hardcoded within the `EconomicEngineConfig`. This mixes policy definition with financial execution. | The commission structure must be extracted and redefined as a `CommissionPolicy` within the `CFG` `PolicyRegistry`. The `FIN` domain will then consume this policy artifact at runtime to perform its calculations. |
| **`CFG` ↔ `COM`** | (Assumed) | Pricing rules, discount logic, and product validation rules are likely implemented as hardcoded conditional logic within the `COM` domain's services. | These rules must be extracted and modeled as declarative policies within the `CFG` `PolicyRegistry`. The `COM` domain will fetch these rules and execute them in a standardized way. |
| **`CFG` ↔ `IDA`** | (Assumed) | Role-based access control (RBAC) rules that go beyond simple role checks (e.g., "Admins can only delete products if the product has zero sales") are likely embedded in `IDA` or business services. | These complex authorization policies should be defined in the `CFG` `PolicyRegistry`. The `IDA` domain would still be responsible for the core authentication and role checks, but it would consult the `CFG` policy for more granular, context-aware decisions. |
| **`CFG` ↔ `Runtime`** | `src/modules/api-layer/config/gateway.config.ts` | The configuration loader directly reads from `process.env`, creating a tight coupling between the definition of a configuration variable (e.g., `defaultRateLimit`) and its source. | The `CFG` domain will define the *schema* for the required configuration. A dedicated `EnvironmentAdapter` in the Runtime Plane will be responsible for *sourcing* that configuration from environment variables, a file, or another source. |

---
## SECTION VIII — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy configuration semantics and the canonical `CFG` domain architecture. This is an analysis-only exercise; no creation of organs or other canonical structures is authorized by this document.

| Gap Type | Description | Proposed Canonical Solution |
| :--- | :--- | :--- |
| **Missing PolicyRegistry Organ** | The legacy platform lacks a central, authoritative organ for managing the definition, versioning, and publication of all business policies. | The creation of a canonical `PolicyRegistry` organ is the primary requirement for the `CFG` domain. This organ will serve as the single source of truth for all declarative policies. |
| **Missing ConfigurationVersioning Model** | Configuration changes are not formally versioned, making it difficult to track changes, perform rollbacks, and ensure compatibility. | A formal `ConfigurationVersioning` model must be introduced. Every change to a configuration artifact must result in a new, immutable, versioned instance. |
| **Missing Rule Schema Discipline** | Rules are often defined in an ad-hoc manner, with no formal schema to enforce their structure. | A strict `RuleSchema` discipline must be established. All rules, regardless of their purpose, must conform to a standardized, versioned schema. |
| **Missing Validation Rule Abstraction** | Validation logic is implemented imperatively throughout the codebase, leading to duplication and inconsistency. | A dedicated `ValidationRule` abstraction is proposed. These rules would be defined declaratively in the `PolicyRegistry` and consumed by domains to validate their entities. |
| **Missing Policy Version Compatibility Model** | There is no mechanism to ensure that a new version of a policy is compatible with the business logic that consumes it. | A formal `PolicyVersionCompatibility` model is required. This would involve semantic versioning of policies and a mechanism for domains to declare which versions of a policy they support. |
| **Missing CI/EI/IN Coverage** | The legacy configuration and policy systems are purely functional and lack any integration with the canonical `CI` (Contextual Intelligence), `EI` (Emotional Intelligence), or `IN` (Intuitive Intelligence) organelle categories. | Future `CFG` organs must be designed to leverage these advanced analytical organelle categories to enable more dynamic, context-aware policies (e.g., a pricing policy that adapts to market sentiment). |

---
## SECTION IX — FUTURE CONTROLLED INTERACTION PREVIEW

This section defines the anticipated event contracts that will be emitted *by* the `CFG` domain. These events are for notification and cache invalidation purposes only and must not be used to trigger business logic mutations.

**Constitutional Declaration:** All communication from `CFG` must be asynchronous and based on these immutable, versioned event contracts. These events are informational, not instructional.

| Event Name | Emitting Domain | Consuming Domain(s) | Purpose |
| :--- | :--- | :--- | :--- |
| `POLICY_VERSION_INCREMENTED` | `CFG` | All Domains, `OBS` | To announce that a new version of a policy has been published, signaling to consumers that they should invalidate their caches and fetch the new version. |
| `FEATURE_FLAG_UPDATED` | `CFG` | `FlagEvaluationService`, `OBS` | To announce that a feature flag's definition or value has changed. |
| `CONFIGURATION_SCHEMA_UPDATED` | `CFG` | All Domains, `OBS` | To signal that the schema for a configuration artifact has changed, requiring consumers to adapt. |
| `RULE_SET_PUBLISHED` | `CFG` | All Domains, `OBS` | To announce that a new version of a rule set (e.g., for validation or fraud detection) is available. |

---
## SECTION X — EXPLICIT PROHIBITIONS

To eliminate any ambiguity, the following actions are explicitly and constitutionally forbidden. Any attempt to perform these actions will result in an immediate AGVE (Automated Governance Validation Engine) Level 4 freeze.

| Forbidden Action | Rationale |
| :--- | :--- |
| **`CFG` mutating domain state** | `CFG` is a definition-only domain. It cannot change the authoritative state of any business entity. |
| **`CFG` binding runtime configs** | `CFG` defines the *what* (e.g., "we need a database port"), not the *how* (e.g., `process.env.DB_PORT`). That is a Runtime Plane responsibility. |
| **`CFG` embedding persistence decisions** | The choice of database technology is a Runtime Plane decision. `CFG` must remain abstract. |
| **`CFG` performing direct domain DB writes** | All communication must be via the event bus or by consuming published artifacts. `CFG` cannot bypass this by writing directly to another domain's database. |
| **`CFG` overriding entitlement rules** | `CFG` can define policies that are *used* by the entitlement system, but it cannot directly grant or revoke permissions. That is an `IDA` responsibility. |
| **`CFG` embedding tenant logic** | `CFG` can define policies that are scoped to tenants, but it must not contain logic that is specific to a particular tenant. |

---
## SECTION XI — HARD STOP

This document authorizes **governance modeling and translation mapping only** for the **Configuration & Policy (CFG)** domain.

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
*   **Scope:** CFG domain only

---
