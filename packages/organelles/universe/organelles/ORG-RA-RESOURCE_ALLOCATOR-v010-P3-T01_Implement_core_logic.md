# [ORG-RA-RESOURCE_ALLOCATOR-v0.1.0-P3-T01] Implement Core Logic

**Issue:** #276 | **Phase:** 3 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Core Implementation

### Reservation (FSM)
- 4-state lifecycle: RESERVED → CONSUMED/RELEASED/EXPIRED
- Immutable reservation_id and amount

### ResourceAllocatorOrganelle
- Implements IResourceAllocator with 6 methods
- Constructor injection of 5 ports
- Guard order: validate context → check idempotency → CapacityGuard.checkAndReserve() → persist → schedule expiry → emit

### CapacityGuard
- AtomicCapacityGuard: compare-and-swap on utilization counter
- Checks both global capacity and per-subject quota atomically

### ExpiryScheduler
- InMemoryExpiryScheduler: uses setTimeout per reservation
- Triggers releaseResource() on expiry

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
