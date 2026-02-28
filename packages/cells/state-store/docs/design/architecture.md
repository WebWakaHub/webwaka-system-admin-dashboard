# StateStore — Architecture Design

**Cell:** CEL-STATESTORE-v0.1.0
**Category:** Data & Persistence

## 1. Component Architecture

```
┌─────────────────────────────────────────────┐
│                  StateStore                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ StateWrite │→│ StateReade │→│ ConflictRe │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ↑              │              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OfflineQ  │  │ AuditLog │  │ SyncManage │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## 2. Dependency Injection

All organelles are injected via constructor:
```typescript
constructor(
  private readonly stateWriter: IStateWriter,
  private readonly stateReader: IStateReader,
  private readonly conflictResolver: IConflictResolver,
  private readonly syncManager: ISyncManager,
  private readonly offlineStore: IOfflineStore,
  private readonly auditLogger: IAuditLogger,
  private readonly config: StateStoreConfig,
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
