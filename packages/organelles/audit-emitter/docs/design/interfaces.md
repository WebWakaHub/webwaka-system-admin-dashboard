# AuditEmitter — Interface Contracts

```typescript
interface IAuditEmitter {
  readonly id: string;
  readonly state: AuditEmitterState;
  execute(command: AuditEmitterCommand): Promise<AuditEmitterResult>;
  query(query: AuditEmitterQuery): AuditEmitterQueryResult;
  reset(): void;
  terminate(): void;
}
```
