# LEGACY COM–FIN CONTROLLED INTERACTION APPENDIX

---

## SECTION I — CONSTITUTIONAL AUTHORITY

This document is a constitutionally binding appendix to the Phase II-A, Cluster 2 translation matrices for the Commerce (`COM`) and Finance (`FIN`) domains. It provides the definitive, mathematical model for the controlled interaction between these two sovereign domains. Its purpose is to ensure economic stability, transactional integrity, and architectural purity.

Under the authority of the Founder (`webwaka007`), this document mandates the following principles:

*   **Domain Sovereignty:** `COM` and `FIN` are and must remain separate, sovereign domains.
*   **Event-Only Communication:** All interaction between `COM` and `FIN` must occur exclusively through the exchange of immutable, versioned event contracts. There shall be no direct organ-to-organ calls or shared state.
*   **State Immutability:** `COM` is constitutionally forbidden from mutating the `FIN` ledger. `FIN` is constitutionally forbidden from mutating `COM` order states.
*   **Governance Definition Only:** This document is a definitional exercise. It does not authorize the creation of any issues, the activation of any modules, or the mutation of any canonical registries.

---

## SECTION II — DOMAIN SOVEREIGNTY DECLARATION

To eliminate any ambiguity, the sovereign responsibilities of the Commerce (`COM`) and Finance (`FIN`) domains are hereby declared. Any collapse of these responsibilities constitutes a violation of the WebWaka constitution.

### Commerce (COM) Domain Sovereignty

The `COM` domain is the sole authority for the **business logic of trade**. Its responsibilities include:

| Responsibility | Description |
| :--- | :--- |
| **Product Modeling** | Defining what can be sold, including its attributes and pricing rules. |
| **Cart Management** | Managing the customer's selection of products before a purchase decision. |
| **Order Lifecycle** | Orchestrating the state of an order from pending to confirmed to fulfilled. |
| **Refund Decision** | Initiating the business process of a refund, based on customer service rules or other commercial factors. |

### Finance (FIN) Domain Sovereignty

The `FIN` domain is the sole authority for the **immutable record of monetary value**. Its responsibilities include:

| Responsibility | Description |
| :--- | :--- |
| **Monetary Transaction Recording** | Maintaining the double-entry ledger, ensuring every financial event is recorded as a balanced, atomic transaction. |
| **Ledger Invariants** | Enforcing the mathematical integrity of the ledger, where `Σ Debits = Σ Credits` for all transactions. |
| **Settlement Orchestration** | Managing the flow of funds, including commission splitting and vendor payouts. |
| **Refund Accounting** | Executing the monetary side of a refund by creating a new, compensating transaction in the ledger. |
| **Tax Calculation** | Applying tax rules to financial transactions and recording tax liabilities. |

---

## SECTION III — EVENT CONTRACT MODEL

All interactions between the `COM` and `FIN` domains are governed by the following immutable event contracts. No other form of communication is permitted. Runtime transport mechanisms (e.g., message queues) are not part of this biological contract.

| Event Type | Emitting Domain | Consuming Domain(s) | Immutable Payload Contract (Key Fields) | Idempotency Key | Version |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ORDER_PLACED` | `COM` | `COM` (Internal) | `{ orderId, customerId, totalAmount, currency }` | `orderId` | `1.0` |
| `PAYMENT_INITIATED` | `COM` | `FIN` | `{ paymentId, orderId, amount, currency, customerEmail }` | `paymentId` | `1.0` |
| `PAYMENT_AUTHORIZED` | `FIN` | `COM` | `{ paymentId, orderId, amount, currency, gatewayReference }` | `paymentId` | `1.0` |
| `PAYMENT_FAILED` | `FIN` | `COM` | `{ paymentId, orderId, reason }` | `paymentId` | `1.0` |
| `ORDER_CONFIRMED` | `COM` | `LOG`, `Notification` | `{ orderId, customerId, items, shippingAddress }` | `orderId` | `1.0` |
| `SETTLEMENT_COMPLETED` | `FIN` | `FIN` (Internal) | `{ settlementId, transactions: [], vendorPayouts: [] }` | `settlementId` | `1.0` |
| `REFUND_REQUESTED` | `COM` | `FIN` | `{ refundId, orderId, amount, currency, reason }` | `refundId` | `1.0` |
| `REFUND_PROCESSED` | `FIN` | `COM`, `Notification` | `{ refundId, orderId, amount, currency, gatewayReference }` | `refundId` | `1.0` |
| `SUBSCRIPTION_BILLED` | `FIN` | `Entitlement`, `Notification` | `{ subscriptionId, userId, planId, amount, billingPeriodEnd }` | `invoiceId` | `1.0` |
| `SUBSCRIPTION_FAILED` | `FIN` | `Entitlement`, `Notification` | `{ subscriptionId, userId, planId, reason }` | `invoiceId` | `1.0` |

**Correlation ID Discipline:** All events in a single transaction lifecycle (from `ORDER_PLACED` to `SETTLEMENT_COMPLETED`) MUST carry the same `correlationId` to ensure full traceability across domain boundaries.

---

## SECTION IV — FULL TRANSACTION LIFECYCLE FLOW

This section models the full transaction lifecycle as a sequence of event-driven interactions. Each flow is constitutionally mandated.

### Flow A — Standard Order Transaction

This flow describes the successful purchase of a single-vendor product.

1.  **`COM` Domain:** A user finalizes their cart. The `OrderManager` organ emits an `ORDER_PLACED` event and an associated `PAYMENT_INITIATED` event.
2.  **`FIN` Domain:** The `Ledger` organ consumes `PAYMENT_INITIATED`. It creates a `pending` transaction and requests payment authorization from the Runtime Plane.
3.  **Runtime Plane:** The Payment Gateway Adapter processes the payment with the external provider.
4.  **`FIN` Domain:** The `Ledger` consumes the `PAYMENT_AUTHORIZED` event from the adapter. It atomically updates the transaction status to `completed` and executes the double-entry booking (e.g., Debit `Accounts Receivable`, Credit `Sales Revenue`).
5.  **`FIN` Domain:** Once the transaction is committed, `FIN` emits `PAYMENT_SETTLED`.
6.  **`COM` Domain:** The `OrderManager` consumes `PAYMENT_SETTLED`. It updates the order status and emits `ORDER_CONFIRMED`, triggering the fulfillment process in the `LOG` domain.

### Flow B — Payment Failure

This flow describes the handling of a failed payment.

1.  **Runtime Plane:** The Payment Gateway Adapter fails to process the payment.
2.  **`FIN` Domain:** The `Ledger` consumes the `PAYMENT_FAILED` event from the adapter.
3.  **`FIN` Domain:** The `Ledger` updates the transaction status to `failed`. **No financial entries are written to the core ledger accounts.** The failed attempt is logged for audit, but it does not impact financial statements.
4.  **`COM` Domain:** The `OrderManager` consumes `PAYMENT_FAILED`. The order remains in a `pending_payment` state. The user may be prompted to try a different payment method.

### Flow C — Multi-Vendor Marketplace Settlement

This flow models the financial settlement of a multi-vendor order.

1.  **`COM` Domain:** An order containing items from Vendor A and Vendor B is confirmed.
2.  **`FIN` Domain:** The `Ledger` records the initial payment as a single transaction, crediting a central `Unsettled Funds` liability account.
3.  **`FIN` Domain:** The `SettlementOrchestrator` organ consumes the `PAYMENT_SETTLED` event. It analyzes the transaction and determines the split.
4.  **`FIN` Domain:** The `SettlementOrchestrator` executes a new, internal, multi-entry ledger transaction:
    *   **Debit** `Unsettled Funds` (for the full order amount)
    *   **Credit** `Vendor A Payouts Payable` (for their share)
    *   **Credit** `Vendor B Payouts Payable` (for their share)
    *   **Credit** `Platform Commission Revenue` (for the platform's fee)
5.  **`FIN` Domain:** The `SettlementOrchestrator` emits `SETTLEMENT_COMPLETED`.

### Flow D — Refund Lifecycle

This flow models a full refund, emphasizing the principle of compensation over mutation.

1.  **`COM` Domain:** A business process determines a refund is required. The `OrderManager` emits `REFUND_REQUESTED`.
2.  **`FIN` Domain:** The `Ledger` consumes `REFUND_REQUESTED`. It validates that the original transaction exists and is in a refundable state.
3.  **`FIN` Domain:** The `Ledger` creates a **new compensating transaction**. It does not delete or alter the original sale. This new transaction reverses the original flow (e.g., Debit `Sales Revenue`, Credit `Accounts Receivable`).
4.  **`FIN` Domain:** The `Ledger` requests the refund from the Runtime Plane and, upon confirmation, emits `REFUND_PROCESSED`.
5.  **`COM` Domain:** The `OrderManager` consumes `REFUND_PROCESSED` and updates the order state to `refunded`.

### Flow E — Subscription Billing

This flow models the separation of billing from entitlement.

1.  **`FIN` Domain:** The `SubscriptionBilling` organ's internal scheduler determines a subscription is due for payment.
2.  **`FIN` Domain:** It initiates a payment request via the Runtime Plane.
3.  **`FIN` Domain:** Upon receiving `PAYMENT_AUTHORIZED`, the `Ledger` records the recurring payment.
4.  **`FIN` Domain:** The `SubscriptionBilling` organ emits `SUBSCRIPTION_BILLED`.
5.  **`Entitlement` Domain:** A separate, cross-cutting Entitlement system consumes `SUBSCRIPTION_BILLED` and verifies that the user's access and permissions are correctly provisioned. **The `FIN` domain has no knowledge of what the subscription provides.**

---

## SECTION V — IDEMPOTENCY & ATOMICITY MODEL

To ensure the economic stability of the platform, the following principles of idempotency and atomicity are constitutionally mandated.

| Principle | Definition |
| :--- | :--- |
| **Unique Transaction Keys** | Every event that can trigger a financial state change MUST carry a unique, client-generated idempotency key (e.g., `paymentId`, `refundId`). The `FIN` domain MUST record these keys and refuse to process an event with a key it has already successfully processed. |
| **Replay Safety** | The combination of idempotency key checking and the event-driven model ensures that events can be safely replayed in the case of a network failure or consumer downtime without causing duplicate financial transactions. |
| **Ledger Write Atomicity** | All debit and credit entries for a single financial transaction MUST be committed to the ledger database in a single, atomic database transaction. If any part of the write fails, the entire transaction must be rolled back, leaving the ledger in its previous state. |
| **Event Ordering Discipline** | While the system is asynchronous, events related to a single financial lifecycle (e.g., a payment) should be processed in a logical order. The `FIN` domain must be resilient to out-of-order events (e.g., by checking the state of the transaction before processing an event). |
| **Compensation Over Mutation** | Financial records must never be mutated or deleted. To correct an error or process a return, a new **compensating transaction** must be created. This preserves a perfect, immutable audit trail of all financial activity. |

---

## SECTION VI — VERSIONING & FEDERATION DISCIPLINE

The `COM`-`FIN` interaction model must be stable across a federated network of independent WebWaka instances. This requires strict discipline in versioning.

| Principle | Definition |
| :--- | :--- |
| **Event Schema Versioning** | Every event contract defined in Section III has a mandatory `version` field (e.g., `1.0`). Any change to the payload that is not backward-compatible requires incrementing the major version number. |
| **Backward Compatibility Rules** | A new version of an event consumer (e.g., the `FIN` domain) MUST be able to process events from at least one previous major version. Adding new, optional fields to a payload is considered a backward-compatible minor version change. |
| **Cross-Instance Patch Propagation** | Critical bug fixes in the `COM` or `FIN` domain logic that affect the integrity of the transaction lifecycle MUST be propagated to all federated instances simultaneously, as governed by the `PLATFORM_FEDERATION_CONSTITUTION.md`. |
| **Ledger Upgrade Safety** | Any change to the fundamental structure of the `FIN` domain's ledger is a major platform upgrade. It requires a coordinated, multi-stage migration process across the entire federation to ensure no financial data is lost or corrupted. |

**Constitutional Declaration:** No single instance in a federation may partially or unilaterally upgrade its `COM` or `FIN` event schema. All changes must be coordinated through the Federation Plane.

---

## SECTION VII — FAILURE & COMPENSATION MODEL

The system must be resilient to the inevitable failures of a distributed architecture. The following models define the abstract principles for handling such failures.

| Principle | Definition |
| :--- | :--- |
| **Retry Policies** | Event consumers should be designed with abstract retry policies (e.g., exponential backoff). The specific parameters of these policies (e.g., number of retries, delay) are a Runtime Plane configuration, not a biological constant. |
| **Dead-Letter Semantics** | If an event consistently fails processing even after all retries, it must be moved to a Dead-Letter Queue (DLQ). This prevents a single malformed event from halting the entire financial processing pipeline. The existence of a DLQ is a constitutional requirement; its implementation is a runtime detail. |
| **Reconciliation Jobs** | A dedicated, continuously running `Reconciliation` organ within the `FIN` domain is responsible for comparing the internal ledger state against external sources of truth (e.g., payment gateway reports). This job is the ultimate backstop to detect any inconsistencies caused by missed events or bugs. |
| **Manual Correction Path** | There must be a secure, audited, and permission-controlled pathway for authorized personnel to create manual ledger entries to correct inconsistencies found by the reconciliation process. Every manual entry must include a justification and the ID of the operator. |
| **Audit Trail Invariants** | Every action, whether successful, failed, retried, or manually corrected, must be recorded in the immutable audit trail. There must be no 
gaps in the financial history of the platform.

---

## SECTION VIII — PROHIBITIONS

To maintain the stability and integrity of the WebWaka economic core, the following actions are explicitly and constitutionally prohibited. Any violation will result in an immediate AGVE (Automated Governance Validation Engine) freeze.

*   **`COM` Writing to the Ledger:** The Commerce domain is forbidden from making any direct writes or mutations to the `FIN` domain's ledger.
*   **`FIN` Mutating Order State:** The Finance domain is forbidden from directly changing the state of a commercial order in the `COM` domain.
*   **Shared Persistence:** The `COM` and `FIN` domains must not share the same database tables or persistence storage. Their states must be physically and logically isolated.
*   **Direct Organ Invocation:** An organ in the `COM` domain must never directly invoke a method on an organ in the `FIN` domain, or vice-versa. All communication must be through the event contracts defined in Section III.
*   **Gateway SDKs in Biological Layers:** The use of any payment gateway-specific SDKs or APIs within the `COM` or `FIN` domains is strictly prohibited. This logic belongs exclusively to Runtime Plane adapters.
*   **Runtime Binding Leakage:** The biological code of `COM` and `FIN` must not contain any assumptions about the runtime environment, such as specific message queue technologies or database vendors.

---

## SECTION IX — STRUCTURAL INVARIANTS SUMMARY

This section provides a summary of the core structural invariants declared in this appendix. These are the foundational, non-negotiable rules that govern the economic spine of the WebWaka platform.

| Invariant | Definition |
| :--- | :--- |
| **Double-Entry Rule** | All financial transactions must be recorded as balanced debits and credits (`Σ Debits = Σ Credits`). |
| **Sovereign Domain Rule** | `COM` and `FIN` are independent domains with strictly defined responsibilities. Their internal logic and state must remain separate. |
| **Event-Only Communication Rule** | All cross-domain interaction must occur asynchronously through the exchange of immutable, versioned event contracts. |
| **Idempotency Requirement** | All financial event consumers must be idempotent, preventing duplicate transactions from event replays. |
| **Compensation-Over-Mutation Rule** | Financial records are never deleted or modified. Errors are corrected by creating new, compensating transactions. |
| **Federation Version Safety Rule** | All changes to event contracts or ledger structures must be managed through a coordinated, federation-aware versioning and migration process. |

---

## SECTION X — HARD STOP

This document authorizes **lifecycle definition only**.

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
*   **Scope:** COM–FIN Interaction Only

---
