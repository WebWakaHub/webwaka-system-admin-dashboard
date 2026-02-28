# ORG-OD-DISCOVERY_REGISTRY-v010-P3-T02: Create Storage Interfaces

**Acting under Canonical Role: Lead Software Engineer**
**Agent: webwakaagent4 — Engineering & Delivery**
**Phase: 3 (Implementation) | Task: T02**

---

## Implementation Summary

### Storage Interface (src/storage-interface.ts)

```typescript
export interface IDiscoveryStoragePort {
  save(entry: ServiceEntry): Promise<void>;
  findById(serviceId: string): Promise<ServiceEntry | null>;
  findByCapability(capabilityId: string): Promise<ServiceEntry[]>;
  findByQuery(query: DiscoveryQuery): Promise<ServiceEntry[]>;
  delete(serviceId: string): Promise<void>;
  sweepExpired(currentTime: number): Promise<ServiceEntry[]>;
  count(): Promise<number>;
}
```

### Design Rationale

The storage interface follows the hexagonal architecture secondary port pattern. It is intentionally abstract to support multiple storage backends (IndexedDB for offline-first, PostgreSQL for server-side, in-memory for testing) without coupling the domain logic to any specific implementation.
