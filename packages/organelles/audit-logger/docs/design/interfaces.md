# AuditLogger — Interface Contracts

## Primary Interface

```typescript
interface IAuditLogger {
  readonly id: string;
  readonly state: AuditLoggerState;
  
  execute(command: AuditLoggerCommand): Promise<AuditLoggerResult>;
  query(query: AuditLoggerQuery): AuditLoggerQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IAuditLoggerStorage {
  save(entity: AuditLoggerEntity): Promise<void>;
  load(id: string): Promise<AuditLoggerEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IAuditLoggerEvents {
  emit(event: AuditLoggerEvent): void;
  subscribe(handler: (event: AuditLoggerEvent) => void): () => void;
}
```
