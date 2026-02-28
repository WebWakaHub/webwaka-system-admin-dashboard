# BoundaryContext — Interface Contracts

```typescript
interface IBoundaryContext {
  readonly id: string;
  readonly state: BoundaryContextState;
  execute(command: BoundaryContextCommand): Promise<BoundaryContextResult>;
  query(query: BoundaryContextQuery): BoundaryContextQueryResult;
  reset(): void;
  terminate(): void;
}

interface IBoundaryContextStorage {
  save(id: string, data: Record<string, unknown>): Promise<void>;
  load(id: string): Promise<Record<string, unknown> | null>;
  delete(id: string): Promise<boolean>;
  list(): Promise<string[]>;
}
```
