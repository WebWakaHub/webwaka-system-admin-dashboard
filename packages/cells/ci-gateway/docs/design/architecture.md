# CIGateway — Architecture Design

**Cell:** CEL-CIGATEWAY-v0.1.0
**Category:** Communication & Interaction

## 1. Component Architecture

```
┌─────────────────────────────────────────────┐
│                  CIGateway                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ ChannelRec │→│ MessageVal │→│ ProtocolNo │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ↑              │              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OfflineQ  │  │ AuditLog │  │ Interactio │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## 2. Dependency Injection

All organelles are injected via constructor:
```typescript
constructor(
  private readonly channelReceiver: IChannelReceiver,
  private readonly messageValidator: IMessageValidator,
  private readonly protocolNormalizer: IProtocolNormalizer,
  private readonly interactionRouter: IInteractionRouter,
  private readonly offlineStore: IOfflineStore,
  private readonly auditLogger: IAuditLogger,
  private readonly config: CIGatewayConfig,
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
