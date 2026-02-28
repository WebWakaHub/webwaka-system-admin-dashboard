# SocialplatformSystem Data Model

## System ID: SYS-SOC-SOCIALPLATFORM

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

## Hash: 6c9f5598
