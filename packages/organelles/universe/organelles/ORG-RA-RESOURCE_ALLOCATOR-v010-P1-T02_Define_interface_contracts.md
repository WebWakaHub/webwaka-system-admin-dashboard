# [ORG-RA-RESOURCE_ALLOCATOR-v0.1.0-P1-T02] Define Interface Contracts

**Issue:** #269 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Primary Interface: IResourceAllocator

```typescript
interface IResourceAllocator {
  registerResourceType(req: RegisterResourceTypeRequest): Promise<Result<ResourceTypeConfig, AllocationError>>;
  reserveResource(req: ReserveResourceRequest): Promise<Result<Reservation, AllocationError>>;
  consumeResource(req: ConsumeResourceRequest): Promise<Result<Reservation, AllocationError>>;
  releaseResource(req: ReleaseResourceRequest): Promise<Result<Reservation, AllocationError>>;
  getUtilization(req: GetUtilizationRequest): Promise<Result<UtilizationReport, AllocationError>>;
  getQuota(req: GetQuotaRequest): Promise<Result<QuotaStatus, AllocationError>>;
}
```

## Port Interfaces

- **IResourceStorageAdapter**: saveResourceType, findResourceType, saveReservation, findReservation, findByIdempotencyKey, getUtilization, getSubjectUsage
- **ICapacityGuard**: checkAndReserve(resourceTypeId, amount, subjectId): Promise<boolean>
- **IExpiryScheduler**: schedule(reservationId, expiresAt): void
- **IAllocationEventEmitter**: emit(AllocationEvent)
- **IAllocationObservability**: recordReservation, recordConsumption, recordRelease, recordExpiry

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
