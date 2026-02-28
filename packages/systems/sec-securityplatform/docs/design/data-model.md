# SecurityplatformSystem Data Model

## System ID: SYS-SEC-SECURITYPLATFORM

## Core Entities
```typescript
interface SystemCommand {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  locale: 'en-NG';
  timezone: 'Africa/Lagos';
}

interface OfflineQueueEntry {
  id: string;
  command: SystemCommand;
  timestamp: number;
  retryCount: number;
  maxRetries: 3;
}
```

## Hash: 8866800b
