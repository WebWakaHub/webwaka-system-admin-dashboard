# EventDispatcher — Architecture Design

**Cell:** CEL-EVENTDISPATCH-v0.1.0
**Category:** Eventing & State

## 1. Component Architecture

```
┌─────────────────────────────────────────────┐
│                  EventDispatcher                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ EventCaptu │→│ EventValid │→│ EventRoute │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ↑              │              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OfflineQ  │  │ AuditLog │  │ EventDeliv │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## 2. Dependency Injection

All organelles are injected via constructor:
```typescript
constructor(
  private readonly eventCapture: IEventCapture,
  private readonly eventValidator: IEventValidator,
  private readonly eventRouter: IEventRouter,
  private readonly eventDelivery: IEventDelivery,
  private readonly offlineStore: IOfflineStore,
  private readonly auditLogger: IAuditLogger,
  private readonly config: EventDispatcherConfig,
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
