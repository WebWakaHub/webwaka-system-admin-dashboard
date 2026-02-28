# ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — Release Notes

**Agent:** webwakaagent4 (Engineering & Delivery)
**Issue:** #521 (P6-T02 Ratification Task 2)
**Version:** 0.1.0
**Release Date:** 2026-02-27

## Summary

Initial release of the External Adapter organelle — a unified interface for all external service integrations in the WebWaka platform. Provides vendor lifecycle management, request routing, circuit breaking, rate limiting, response caching, compliance filtering, and offline queuing.

## Features

### Core Capabilities
- **ExternalAdapter facade** — Single entry point for all external service requests
- **RequestRouter** — Service-to-vendor indirection with runtime vendor swapping
- **CircuitBreaker** — Per-vendor circuit breaker with CLOSED/OPEN/HALF_OPEN states
- **RateLimiter** — Token bucket rate limiting with per-(vendor, tenant) isolation
- **RetryEngine** — Configurable retry with exponential backoff and jitter
- **ComplianceFilter** — Request validation and audit trail creation
- **ResponseCache** — LRU cache with TTL and prefix-based invalidation

### Nigeria-First Vendors
- **PaystackAdapter** — Nigerian payment gateway integration
- **FlutterwaveAdapter** — Nigerian payment gateway integration
- Both support NGN currency, Nigerian bank transfers, and mobile money

### Offline-First Support
- **OfflineQueue** — In-memory queue with size and byte limits
- Priority-based admission (LOW priority auto-queues when offline)
- Automatic queue drain on connectivity restoration

## API Surface

| Export | Type | Description |
|:---|:---|:---|
| `ExternalAdapter` | Class | Main facade |
| `PaystackAdapter` | Class | Paystack vendor adapter |
| `FlutterwaveAdapter` | Class | Flutterwave vendor adapter |
| `IVendorAdapter` | Interface | Custom vendor adapter contract |
| `IExternalServicePort` | Interface | Primary port interface |
| All types and errors | Types | Full type system |

## Dependencies

- No external runtime dependencies
- Requires: `IInstrumentationPort` (optional, from ORG-IN-INSTRUMENTATION_PROBE)

## Known Limitations

- In-memory offline queue (not persisted across restarts)
- Single vendor per service mapping (no failover routing yet)
- Rate limiter state not shared across instances

## Downstream Consumers

- Cell-universe components that require external service integration
- Tissue-level payment processing workflows
- Organ-level marketplace transaction orchestration
