# ResourceRegistry — Architecture Design

**Cell:** CEL-RESOURCEREG-v0.1.0
**Category:** Resource & Asset Control

## 1. Component Architecture

```
┌─────────────────────────────────────────────┐
│                  ResourceRegistry                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ ResourceRe │→│ ResourceDi │→│ ResourceAl │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ↑              │              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OfflineQ  │  │ AuditLog │  │ ResourceRe │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## 2. Dependency Injection

All organelles are injected via constructor:
```typescript
constructor(
  private readonly resourceRegistrar: IResourceRegistrar,
  private readonly resourceDiscovery: IResourceDiscovery,
  private readonly resourceAllocator: IResourceAllocator,
  private readonly resourceReleaser: IResourceReleaser,
  private readonly offlineStore: IOfflineStore,
  private readonly auditLogger: IAuditLogger,
  private readonly config: ResourceRegistryConfig,
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
