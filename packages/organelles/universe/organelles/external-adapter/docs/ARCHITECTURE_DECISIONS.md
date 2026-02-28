# ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — Architecture Decision Records

**Agent:** webwakaagent4 (Engineering & Delivery)
**Issue:** #518 (P5-T03 Documentation Task 3)

## ADR-001: Facade Pattern for External Service Orchestration

**Status:** Accepted
**Context:** Multiple subsystems (circuit breaker, rate limiter, retry, cache, compliance) must coordinate for every external request.
**Decision:** Use a single `ExternalAdapter` facade class that orchestrates all subsystems in a fixed pipeline order.
**Consequences:** Simple API surface for consumers. Pipeline order is fixed but covers all cross-cutting concerns. Adding new pipeline stages requires modifying the facade.

## ADR-002: Service-to-Vendor Indirection via RequestRouter

**Status:** Accepted
**Context:** Consumers should reference logical services (e.g., "payment") not specific vendors (e.g., "paystack").
**Decision:** Introduce `RequestRouter` that maps service IDs to vendor adapters, allowing runtime vendor swapping.
**Consequences:** Vendor changes don't affect consumers. Supports A/B testing between vendors. Adds one level of indirection.

## ADR-003: Circuit Breaker Per Vendor

**Status:** Accepted
**Context:** Vendor failures should not cascade across unrelated services.
**Decision:** Each vendor gets its own circuit breaker instance with independent state tracking.
**Consequences:** Paystack outage doesn't affect Flutterwave. Requires per-vendor configuration. State machine transitions are vendor-isolated.

## ADR-004: Rate Limiter with Tenant Isolation

**Status:** Accepted
**Context:** Multi-tenant platform requires fair resource sharing across tenants.
**Decision:** Rate limiting tracks consumption per (vendor, tenant) pair, preventing one tenant from exhausting another's quota.
**Consequences:** Fair access guaranteed. Higher memory usage for tracking. Tenant-specific rate limits possible.

## ADR-005: Offline Queue with Priority-Based Admission

**Status:** Accepted
**Context:** Nigerian mobile networks experience frequent connectivity drops. Requests must survive offline periods.
**Decision:** LOW priority requests are automatically queued when offline or rate-limited. HIGH/NORMAL priority requests fail fast.
**Consequences:** Non-critical operations (analytics, logging) survive offline. Critical operations (payments) get immediate feedback. Queue has bounded size to prevent memory exhaustion.

## ADR-006: Nigeria-First Vendor Selection

**Status:** Accepted
**Context:** WebWaka targets the Nigerian market first. Payment and communication vendors must have strong Nigerian presence.
**Decision:** Ship with Paystack and Flutterwave as reference vendor adapters. All examples use NGN currency and Nigerian patterns.
**Consequences:** Immediate value for Nigerian deployments. International vendors can be added via the same adapter interface. Documentation reflects Nigerian use cases.

## ADR-007: Response Cache with Prefix-Based Invalidation

**Status:** Accepted
**Context:** Repeated verification calls (e.g., transaction status) should be cached to reduce vendor API usage.
**Decision:** LRU cache with TTL support and prefix-based invalidation (e.g., invalidate all "payment:verify:*" entries).
**Consequences:** Reduces vendor API calls. Cache coherence managed by TTL and explicit invalidation. Memory bounded by max entries configuration.

## ADR-008: Compliance Filter as First Pipeline Stage

**Status:** Accepted
**Context:** All external requests must pass compliance checks before any network activity.
**Decision:** ComplianceFilter runs first in the pipeline, before cache lookup or vendor routing.
**Consequences:** Non-compliant requests never reach vendors. Audit trail created before any external communication. Adds latency to every request but ensures governance compliance.
