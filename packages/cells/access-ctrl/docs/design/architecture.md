# AccessController — Architecture Design

**Cell:** CEL-ACCESSCTRL-v0.1.0
**Category:** Security & Trust

## 1. Component Architecture

```
┌─────────────────────────────────────────────┐
│                  AccessController                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Permission │→│ AccessEval │→│ PolicyEnfo │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ↑              │              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OfflineQ  │  │ AuditLog │  │ AuditLogge │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## 2. Dependency Injection

All organelles are injected via constructor:
```typescript
constructor(
  private readonly permissionDefiner: IPermissionDefiner,
  private readonly accessEvaluator: IAccessEvaluator,
  private readonly policyEnforcer: IPolicyEnforcer,
  private readonly auditLogger: IAuditLogger,
  private readonly offlineStore: IOfflineStore,
  private readonly auditLogger: IAuditLogger,
  private readonly config: AccessControllerConfig,
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
