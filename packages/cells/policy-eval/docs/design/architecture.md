# PolicyEvaluator — Architecture Design

**Cell:** CEL-POLICYEVAL-v0.1.0
**Category:** Configuration & Policy

## 1. Component Architecture

```
┌─────────────────────────────────────────────┐
│                  PolicyEvaluator                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ PolicyLoad │→│ PolicyPars │→│ PolicyEngi │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ↑              │              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OfflineQ  │  │ AuditLog │  │ PolicyEnfo │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## 2. Dependency Injection

All organelles are injected via constructor:
```typescript
constructor(
  private readonly policyLoader: IPolicyLoader,
  private readonly policyParser: IPolicyParser,
  private readonly policyEngine: IPolicyEngine,
  private readonly policyEnforcer: IPolicyEnforcer,
  private readonly offlineStore: IOfflineStore,
  private readonly auditLogger: IAuditLogger,
  private readonly config: PolicyEvaluatorConfig,
)
```

## 3. Offline-First Architecture

```
┌─────────────────────────────┐
│       Service Worker        │
│  ┌───────────────────────┐  │
│  │   Offline Queue       │  │
│  │   (IndexedDB)         │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │   Sync Manager        │  │
│  │   (Background Sync)   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## 4. Nigeria-First Network Strategy

- Default timeout: 30s (accounts for high-latency networks)
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Data compression: gzip for all payloads > 1KB
- Image optimization: WebP with fallback to JPEG
- Request batching: aggregate requests during poor connectivity
