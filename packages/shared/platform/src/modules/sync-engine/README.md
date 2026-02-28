# Sync Engine Module

The Offline-First Sync Engine is a core module of the WebWaka platform responsible for synchronizing data between client-side applications (browser, PWA) and backend services. It ensures that the platform remains fully functional in low-connectivity environments.

## Features

- **Offline Storage:** Uses IndexedDB for client-side storage
- **Two-Way Synchronization:** Bidirectional data sync between client and server
- **Conflict Resolution:** Automatic conflict resolution using last-write-wins strategy
- **Real-Time Updates:** WebSocket-based real-time synchronization
- **Offline Mutation Queueing:** Queues changes made while offline
- **Multi-Tenant Support:** All data is tenant-scoped

## Architecture

```
┌─────────────────┐
│  Application    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sync Engine     │
│    Client       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Offline Storage │
│   (IndexedDB)   │
└─────────────────┘

         │
         ▼ (HTTP/WebSocket)
         
┌─────────────────┐
│ Sync Engine     │
│    Server       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend Services│
└─────────────────┘
```

## Usage

### Client-Side

```typescript
import { initializeSyncEngineClient } from './modules/sync-engine';

// Initialize the client
const syncClient = await initializeSyncEngineClient(
  'tenant-id',
  'user-id',
  {
    syncIntervalMs: 30000,
    enableRealTimeSync: true,
  }
);

// Create data
const productId = await syncClient.create('products', {
  name: 'Product 1',
  price: 1000,
});

// Read data
const product = await syncClient.get('products', productId);

// Update data
await syncClient.update('products', productId, {
  name: 'Product 1 Updated',
  price: 1200,
});

// Delete data
await syncClient.delete('products', productId);

// Manual sync
await syncClient.sync();

// Check sync status
const status = syncClient.getSyncStatus(); // 'idle' | 'syncing' | 'error'
```

### Server-Side

```typescript
import { initializeSyncEngineServer } from './modules/sync-engine';

// Initialize the server
const syncServer = initializeSyncEngineServer();

// Handle GET /api/v1/sync/changes
const changes = await syncServer.getChanges({
  lastSyncTimestamp: '2026-02-16T12:00:00.000Z',
  tenantId: 'tenant-id',
  userId: 'user-id',
});

// Handle POST /api/v1/sync/changes
await syncServer.postChanges({
  changes: [
    {
      id: 'change-1',
      type: 'create',
      entity: 'products',
      entityId: 'product-1',
      data: { name: 'Product 1', price: 1000 },
      timestamp: new Date(),
      tenantId: 'tenant-id',
      userId: 'user-id',
    },
  ],
  tenantId: 'tenant-id',
  userId: 'user-id',
});
```

## Configuration

Environment variables:

- `SYNC_INTERVAL_MS`: Sync interval in milliseconds (default: 30000)
- `SYNC_MAX_RETRIES`: Maximum number of retries (default: 3)
- `SYNC_CONFLICT_STRATEGY`: Conflict resolution strategy (default: 'last-write-wins')
- `SYNC_ENABLE_REALTIME`: Enable real-time sync (default: true)

## Testing

```bash
# Run unit tests
npm test src/modules/sync-engine

# Run with coverage
npm test src/modules/sync-engine -- --coverage
```

## Implementation Status

- ✅ Types and interfaces
- ✅ Configuration
- ✅ Offline storage (IndexedDB)
- ✅ Sync Engine Client
- ✅ Sync Engine Server
- ✅ Conflict resolution (last-write-wins)
- ⏳ Real-time updates (WebSocket) - To be implemented in Week 27
- ⏳ Delta synchronization - To be implemented in future version
- ⏳ Custom conflict resolution strategies - To be implemented in future version

## Dependencies

- IndexedDB (browser API)
- WebSockets (for real-time sync)
- API Layer (for HTTP requests)
- Event System (for event broadcasting)

## Compliance

- ✅ Offline-First architecture
- ✅ Multi-Tenant data scoping
- ✅ Mobile-First & PWA-First compatible
- ✅ Nigerian-First & Africa-First compliant
