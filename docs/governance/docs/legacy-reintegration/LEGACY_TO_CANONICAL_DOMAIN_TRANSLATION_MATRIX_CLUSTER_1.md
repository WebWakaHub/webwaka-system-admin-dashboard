
# LEGACY TO CANONICAL DOMAIN TRANSLATION MATRIX — CLUSTER 1

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document constitutes **Phase II-A, Cluster 1** of the Controlled Reintegration Roadmap. It operates under the authority of the Founder (webwaka007) and is strictly an exercise in structural translation. Its purpose is to map legacy assets from Cluster 1 (Identity, Security, and Entitlement) to the canonical WebWaka architecture.

This document performs **translation only** and does NOT authorize any of the following actions:

*   No canonical registry mutation is permitted.
*   No issue generation is permitted.
*   No activation of any module or feature is permitted.
*   No runtime binding or infrastructure modification is permitted.
*   No updates to any Master Document are permitted.

All activities are bound by the following constitutional documents:

*   `STRICT_INFRASTRUCTURE_NEUTRAL_IMPLEMENTATION_CONTRACT.md`
*   `RUNTIME_PLANE_CONSTITUTION.md`
*   `PLATFORM_FEDERATION_CONSTITUTION.md`
*   `VERSION_EVOLUTION_AND_PATCH_GOVERNANCE_MODEL.md`
*   `FEATURE_ENTITLEMENT_AND_MODULE_ACTIVATION_MODEL.md`
*   `AGVE (Automated Governance Validation Engine)`

---
## SECTION II — CLUSTER SCOPE DEFINITION

This cluster focuses on the translation of legacy assets related to **Identity**, **Security**, and **Entitlement**. The canonical architecture enforces a strict separation of these concerns to ensure modularity, security, and clarity.

### Canonical Domain Definitions

*   **Identity (IDA):** The `IDA` domain is exclusively responsible for defining *who* a user is. This includes user account creation, authentication (verifying identity), and management of user profile data. It is the single source of truth for user identity within the platform.

*   **Security (SEC):** The `SEC` domain is responsible for safeguarding the platform and its data. This includes authorization (what a user can do), access control, audit logging, and fraud prevention. It consumes identity information from the `IDA` domain but does not define it.

*   **Entitlement (Subscription & Feature Gating):** Entitlement is not a biological domain but a cross-cutting concern governed by the `FEATURE_ENTITLEMENT_AND_MODULE_ACTIVATION_MODEL.md`. It determines *what* features and modules a user has access to based on their subscription level. Entitlement logic is strictly separated from both `IDA` and `SEC`.

### Separation of Concerns

The following table clarifies the strict separation of responsibilities:

| Concern | Canonical Domain/Plane | Description |
| :--- | :--- | :--- |
| **Identity** | `IDA` | Manages user accounts, profiles, and authentication. |
| **Security** | `SEC` | Manages permissions, access control, and threat detection. |
| **Entitlement** | Entitlement Governance | Manages feature access based on subscription plans. |
| **Runtime Tenancy** | Runtime Plane | Manages the isolation of tenant-specific resources and data at the infrastructure level. Tenancy is a runtime concern, not an identity or security concern. |

---
## SECTION III — LEGACY IDENTITY & SECURITY ASSET INVENTORY

This section inventories the legacy assets identified in Phase I that fall within the scope of Cluster 1. These assets, primarily from the `webwaka-platform` repository, contain the core logic for identity, security, and entitlement that must be translated to the canonical architecture.

| Legacy Asset Category | Source Document(s) / Module | Description |
| :--- | :--- | :--- |
| **User Identity Module** | `src/user-identity/` | A comprehensive module handling user registration, authentication, and profile management. Contains logic for JWT-based sessions and email verification. |
| **Authentication Models** | `src/user-identity/README.md`, `src/user-identity/documentation/ARCHITECTURE.md` | Defines the authentication flow, including password hashing (bcrypt) and secure token generation. |
| **Identity Provisioning Logic** | `src/user-identity/README.md`, `src/user-identity/documentation/API.md` | Exposes API endpoints for user creation (`POST /auth/register`) and management. |
| **Role Hierarchies** | `src/user-identity/documentation/ARCHITECTURE.md` | Describes a Role-Based Access Control (RBAC) system with `users`, `roles`, `permissions`, `user_roles`, and `role_permissions` tables. |
| **Permission Models** | `src/user-identity/README.md`, `src/user-identity/documentation/API.md` | Details the creation and assignment of granular permissions (e.g., `posts.create`) to roles. |
| **Access Control Definitions** | `src/user-identity/README.md` | Includes methods like `hasPermission` and `enforcePermission` for checking user access rights. |
| **Security & Trust Services** | `src/audit-system/README.md`, `src/fraud-prevention/FRAUD_PREVENTION_DOCUMENTATION.md` | Includes the **Audit System** for immutable event logging and the **Fraud Prevention System** for real-time transaction scoring and anomaly detection. |
| **Entitlement Models** | `src/payment-billing/README.md` | The legacy system links entitlement to subscription status managed within the `payment-billing` module. |
| **Subscription Gating Logic** | `src/module-system/README.md`, `src/payment-billing/README.md` | Feature access was implicitly controlled by loading modules based on subscription plans, a non-canonical coupling of concerns. |

---
## SECTION IV — TRANSLATION MATRIX

This matrix provides a structured translation of the legacy assets identified in Section III into the canonical WebWaka architecture. This is a proposal and analysis exercise only. No creation or mutation of canonical structures is authorized.

| Legacy Asset | Canonical Domain | Proposed Organ | Required Tissues | Required Cells | Required Organelle Categories | Translation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User Identity Module** | `IDA` | `UserAccount` | `ProfileManagement`, `AuthenticationWorkflow` | `CreateUser`, `UpdateProfile`, `VerifyEmail` | `StateStorage`, `CommandProcessing`, `Policy` | The core logic for managing user identity maps directly to a proposed `UserAccount` organ within the `IDA` domain. |
| **Authentication Models** | `IDA` | `UserAccount` | `AuthenticationWorkflow` | `GenerateToken`, `HashPassword`, `VerifyPassword` | `Security`, `Policy`, `Cryptography` | Legacy authentication mechanisms (JWT, bcrypt) will be encapsulated as tissues and cells within the `UserAccount` organ. |
| **Identity Provisioning Logic** | `IDA` | `UserAccount` | `ApiEndpoints` | `RegisterUserEndpoint`, `LoginUserEndpoint`, `GetUserProfileEndpoint` | `Interface`, `Validation` | The legacy API for user management will be translated into a dedicated `ApiEndpoints` tissue. |
| **Role Hierarchies & Permission Models (RBAC)** | `SEC` | `PermissionManager` | `RoleManagement`, `PermissionAssignment`, `AccessControlPolicy` | `CreateRole`, `AssignRoleToUser`, `GrantPermissionToRole` | `StateStorage`, `AccessControl`, `Policy` | The entire legacy RBAC system is re-mapped to a new, dedicated `PermissionManager` organ within the `SEC` domain, cleanly separating it from identity. |
| **Access Control Definitions** | `SEC` | `PermissionManager` | `AccessControlPolicy` | `CheckPermission`, `EnforcePermission` | `Validation`, `Policy` | The logic for checking permissions is a critical tissue within the proposed `PermissionManager` organ. |
| **Audit System** | `SEC` | `AuditTrail` | `EventLogging`, `LogQuery`, `IntegrityVerification` | `LogEvent`, `QueryLogs`, `VerifyLogHash` | `StateStorage`, `ImmutableLedger`, `Interface` | The legacy audit system maps to a proposed `AuditTrail` organ in the `SEC` domain, responsible for maintaining an immutable record of all platform events. |
| **Fraud Prevention System** | `SEC` | `FraudDetector` | `TransactionScoring`, `AnomalyDetection`, `RuleEngine` | `ScoreTransaction`, `DetectAnomaly`, `EvaluateRules` | `MachineLearning`, `RealTimeAnalytics`, `Policy` | The sophisticated legacy fraud prevention capabilities are translated into a dedicated `FraudDetector` organ within the `SEC` domain. |
| **Entitlement & Subscription Gating Logic** | Entitlement Governance | *N/A (New Proposal Required)* | `SubscriptionManagement`, `FeatureGating` | `CheckSubscriptionStatus`, `IsFeatureEnabled` | `Policy`, `Configuration` | This legacy logic is incorrectly coupled with identity and modules. It will be translated into a new, cross-cutting entitlement gating mechanism, as defined in `FEATURE_ENTITLEMENT_AND_MODULE_ACTIVATION_MODEL.md`. This is a proposal for a new mechanism, not a biological organ. |

---
## SECTION V — DOMAIN BOUNDARY CONFLICT ANALYSIS

This section identifies key conflicts and boundary collapses present in the legacy architecture, which must be resolved during the translation process to align with the canonical model.

| Conflict Type | Legacy Asset / Logic | Canonical Resolution Path |
| :--- | :--- | :--- |
| **Boundary Collapse: Identity & Security** | The `user-identity` module combines authentication (IDA) with authorization (RBAC, which belongs to SEC). | The legacy RBAC system must be fully extracted from the `user-identity` module and re-implemented within the proposed `PermissionManager` organ in the `SEC` domain. The `IDA` domain will only be concerned with authentication. |
| **Boundary Collapse: Identity & Entitlement** | Legacy entitlement was implicitly tied to user identity and subscription status, often checked within business logic. | Entitlement logic must be completely decoupled from identity. The canonical path is to use the `FEATURE_ENTITLEMENT_AND_MODULE_ACTIVATION_MODEL.md`, where feature access is determined at the module activation layer, not within the `IDA` domain. |
| **Incorrect Binding: Identity & Runtime** | The legacy `user-identity` module includes the concept of `tenantId` directly within its data models and API, incorrectly binding a runtime concern (tenancy) to the biological layer of identity. | Tenancy is a **Runtime Plane** concern. The `IDA` domain should be tenant-agnostic. The Runtime Plane is responsible for injecting the tenant context and ensuring data isolation. The `tenant_id` field must be removed from the canonical `UserAccount` organ's core definition and managed by the runtime. |
| **Naming Divergence** | The legacy codebase uses terms like "user-identity", "payment-billing", and "module-system" which are descriptive but not aligned with the canonical domain registry. | All legacy concepts will be mapped to the 18 canonical domains. For example, `user-identity` maps to `IDA` and `SEC`, and `payment-billing` logic related to subscriptions maps to the Entitlement Governance model. |

---
## SECTION VI — ENTITLEMENT INTEGRATION ANALYSIS

The legacy architecture incorrectly coupled entitlement and subscription status with the identity and module systems. The canonical architecture mandates a strict separation, with entitlement managed as a distinct, cross-cutting concern.

### Mapping to Canonical Entitlement Model

The legacy subscription and feature gating models, primarily found in the `payment-billing` and `module-system` modules, must be translated to align with the `FEATURE_ENTITLEMENT_AND_MODULE_ACTIVATION_MODEL.md`. This model dictates that entitlement is not a biological property of a user but a policy that governs the activation of platform capabilities.

### Key Declarations for Translation

*   **Identity ≠ Entitlement:** A user's identity (`IDA` domain) and their entitlements are fundamentally separate. The `UserAccount` organ will have no knowledge of a user's subscription plan or feature access rights.

*   **Entitlement Gating at Module Activation:** The decision to grant access to a specific feature or module occurs at the module activation layer, which is orchestrated by the platform's core and governed by entitlement policies. This is a late-binding mechanism that occurs after a user is authenticated.

*   **Subscription Does Not Alter Biological Invariants:** A user's subscription status does not change the fundamental structure or behavior of the platform's biological layers. It only determines which modules and capabilities are made available to that user's session.

---
## SECTION VII — STRUCTURAL GAP ANALYSIS

This analysis identifies structural gaps between the legacy assets and the canonical architecture. This is an analysis-only exercise; no creation of organs, tissues, or cells is authorized by this document.

| Gap Type | Description | Legacy Asset(s) | Proposed Canonical Solution |
| :--- | :--- | :--- | :--- |
| **Missing Canonical Organs** | The legacy architecture lacks dedicated, isolated organs for managing permissions, auditing, and fraud detection. These were often coupled with other modules. | The translation proposes the creation of new organs: `PermissionManager` (SEC), `AuditTrail` (SEC), and `FraudDetector` (SEC). |
| **Overlapping Semantics** | The legacy `user-identity` module conflates the concepts of identity, authentication, and authorization (RBAC). | The canonical architecture strictly separates these. `IDA` handles identity/authentication, while `SEC` handles authorization. |
| **Redundant Constructs** | The legacy system has multiple, inconsistent ways of checking permissions and entitlements, leading to redundancy and potential security holes. | The proposed `PermissionManager` organ will provide a single, canonical source of truth for all authorization checks. |
| **Identity Abstraction Inconsistencies** | The legacy `user-identity` module is tightly coupled to a specific implementation (email/password, JWT). | The canonical `UserAccount` organ should be designed with a more abstract `AuthenticationWorkflow` tissue that can accommodate future authentication methods (e.g., social login, 2FA) without altering the organ's core structure. |
| **Missing Tissues & Cells** | While the legacy assets contain the necessary logic, they are not organized into the canonical structure of tissues and cells. | The translation matrix in Section IV proposes a detailed breakdown of the legacy logic into the required tissues (e.g., `RoleManagement`, `TransactionScoring`) and cells (e.g., `CreateRole`, `ScoreTransaction`). |

---
## SECTION VIII — HARD STOP

This document authorizes **translation mapping only**.

It does NOT authorize:

*   Issue creation
*   Organ creation
*   Registry modification
*   Activation
*   Runtime binding
*   Federation modification

Any deviation from this mandate will trigger an AGVE (Automated Governance Validation Engine) freeze.

---
## SECTION IX — RATIFICATION STATEMENT

*   **Status:** RATIFIED
*   **Authority:** Founder
*   **Date:** 2026-02-21
*   **Scope:** Cluster 1 only

---
