# IdentityResolver — Architecture Design

**Cell:** CEL-IDRESOLVE-v0.1.0
**Category:** Identity & Access

## 1. Component Architecture

```
┌─────────────────────────────────────────────┐
│                  IdentityResolver                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Authentica │→│ Authorizer │→│ IdentityMa │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ↑              │              ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ OfflineQ  │  │ AuditLog │  │ TokenManag │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## 2. Dependency Injection

All organelles are injected via constructor:
```typescript
constructor(
  private readonly authenticator: IAuthenticator,
  private readonly authorizer: IAuthorizer,
  private readonly identityMapper: IIdentityMapper,
  private readonly tokenManager: ITokenManager,
  private readonly offlineStore: IOfflineStore,
  private readonly auditLogger: IAuditLogger,
  private readonly config: IdentityResolverConfig,
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
