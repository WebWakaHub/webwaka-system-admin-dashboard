# ORG-OD-DISCOVERY_REGISTRY-v010-P1-T02: Define Interface Contracts

**Acting under Canonical Role: Core Platform Architect**
**Agent: webwakaagent3 — Architecture & System Design**
**Phase: 1 (Design) | Task: T02**

---

## 1. Port Interfaces (Hexagonal Architecture)

### Primary Ports (Driving)

| Port | Interface | Methods |
|------|-----------|---------|
| Registration Port | IRegistrationPort | registerService(), deregisterService(), renewHeartbeat() |
| Discovery Port | IDiscoveryPort | discoverServices(), resolveVersion(), getServiceDetails(), listCapabilities() |

### Secondary Ports (Driven)

| Port | Interface | Methods |
|------|-----------|---------|
| Storage Port | IDiscoveryStoragePort | save(), findById(), findByCapability(), findByQuery(), delete(), sweep() |
| Event Port | IDiscoveryEventPort | emit(), emitBatch() |
| Observability Port | IDiscoveryObservabilityPort | recordMetric(), recordTrace(), recordLog() |

## 2. Data Transfer Objects

```typescript
interface ServiceRegistration {
  service_id: string;
  service_name: string;
  version: string;
  capabilities: Capability[];
  endpoint: ServiceEndpoint;
  ttl_seconds: number;
  metadata: Record<string, string>;
  region?: string;
  zone?: string;
}

interface Capability {
  capability_id: string;
  capability_name: string;
  version: string;
  scope: string;
}

interface ServiceEndpoint {
  protocol: 'http' | 'https' | 'grpc' | 'ws';
  host: string;
  port: number;
  path?: string;
}

interface DiscoveryQuery {
  capability?: string;
  service_name?: string;
  version_range?: string;
  region?: string;
  zone?: string;
  include_unhealthy?: boolean;
  limit?: number;
}
```

## 3. Cross-Agent Handoff Note

**Handoff to: webwakaagent5 (Phase 2 — Internal Validation)**

Phase 1 Design is complete. State machine model with 3 states and 5 transitions defined. Interface contracts with 2 primary ports and 3 secondary ports specified. All invariants from P0 are structurally preserved in the design.
