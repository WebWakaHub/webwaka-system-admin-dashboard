# SecurityplatformSystem Interfaces

## System ID: SYS-SEC-SECURITYPLATFORM

## Public API
```typescript
interface ISecurityplatformSystem {
  coordinate(command: SystemCommand): Promise<SystemResult>;
  coordinateOffline(command: SystemCommand): Promise<string>;
  sync(): Promise<SyncResult>;
  getHealth(): Promise<HealthStatus>;
}
```

## Events
- `SYS-SEC-SECURITYPLATFORM.coordinated` - System coordination complete
- `SYS-SEC-SECURITYPLATFORM.synced` - Offline sync complete
- `SYS-SEC-SECURITYPLATFORM.health` - Health status update

## Hash: 8866800b
