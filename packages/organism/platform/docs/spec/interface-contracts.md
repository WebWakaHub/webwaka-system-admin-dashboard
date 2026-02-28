# ORG-WEBWAKA-PLATFORM — Interface Contracts Specification

## Cross-System Communication Protocol

### Event Bus Contract
All inter-system communication flows through the organism event bus.
Systems MUST NOT communicate directly — all messages route through
the organism's cross-system governance layer.

```typescript
interface OrganismEvent {
  sourceSystem: string;      // e.g., "SYS-FIN-FINANCEPLATFORM"
  targetSystem: string;      // e.g., "SYS-CRM-CUSTOMERPLATFORM"
  eventType: string;         // Domain event type
  payload: unknown;          // Serializable payload
  timestamp: number;         // Unix timestamp
  correlationId: string;     // Cross-system trace ID
  offlineQueued: boolean;    // Whether queued offline
  nigeriaFirst: {
    locale: 'en-NG';
    timezone: 'Africa/Lagos';
    currency: 'NGN';
  };
}
```

### System Health Contract
Each system exposes a health endpoint conforming to:
```typescript
interface SystemHealth {
  systemId: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastSync: number;
  offlineQueueDepth: number;
  version: string;
}
```

### Constitutional Compliance Contract
```typescript
interface ConstitutionalCompliance {
  systemId: string;
  invariantsChecked: number;
  invariantsPassed: number;
  lastAuditTimestamp: number;
  constitutionVersion: string;
}
```
