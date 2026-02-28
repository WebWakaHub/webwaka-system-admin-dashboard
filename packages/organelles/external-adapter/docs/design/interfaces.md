# ExternalAdapter — Interface Contracts

```typescript
interface IExternalAdapter {
  readonly id: string;
  readonly state: ExternalAdapterState;
  execute(command: ExternalAdapterCommand): Promise<ExternalAdapterResult>;
  query(query: ExternalAdapterQuery): ExternalAdapterQueryResult;
  reset(): void;
  terminate(): void;
}
```
