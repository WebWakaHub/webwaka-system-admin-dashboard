# Aggregator — Interface Design

**Cell:** CEL-AGGREGATE-v0.1.0
**Category:** Data & Persistence

## 1. Cell Interface

```typescript
export interface IAggregator {
  execute(command: AggregatorCommand, context: ExecutionContext): Promise<AggregatorResult>;
  executeOffline(command: AggregatorCommand, context: ExecutionContext): Promise<OfflineReceipt>;
  sync(): Promise<SyncResult>;
  getState(): CellState;
  getMetrics(): CellMetric[];
  dispose(): Promise<void>;
}
```

## 2. Organelle Interfaces

```typescript
export interface IDataCollector {
  receive(input: RawInput): Promise<ValidatedInput>;
  validate(input: RawInput): ValidationResult;
}

export interface IDataMerger {
  process(input: ValidatedInput, context: ExecutionContext): Promise<ProcessedOutput>;
  canProcess(input: ValidatedInput): boolean;
}

export interface IDataReducer {
  route(output: ProcessedOutput): Promise<RoutingDecision>;
  getRoutes(): RouteDefinition[];
}

export interface IAggregateEmitter {
  deliver(output: ProcessedOutput, route: RoutingDecision): Promise<DeliveryResult>;
  deliverOffline(output: ProcessedOutput): Promise<OfflineReceipt>;
}
```

## 3. Event Interface

```typescript
export interface AggregatorEvents {
  onStateChange(handler: (state: CellState) => void): Unsubscribe;
  onError(handler: (error: CellError) => void): Unsubscribe;
  onMetric(handler: (metric: CellMetric) => void): Unsubscribe;
  onOfflineQueueChange(handler: (queue: OfflineQueueEntry[]) => void): Unsubscribe;
}
```

## 4. Configuration Interface

```typescript
export interface AggregatorConfig {
  maxRetries: number;
  timeoutMs: number;  // Default: 30000 (Nigeria-optimized)
  offlineStorageKey: string;
  enableTelemetry: boolean;
  locale: string;  // Default: 'en-NG'
}
```
