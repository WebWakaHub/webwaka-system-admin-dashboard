# ValidationExecutor — Interface Design

**Cell:** CEL-VALIDATEEXEC-v0.1.0
**Category:** Security & Trust

## 1. Cell Interface

```typescript
export interface IValidationExecutor {
  execute(command: ValidationExecutorCommand, context: ExecutionContext): Promise<ValidationExecutorResult>;
  executeOffline(command: ValidationExecutorCommand, context: ExecutionContext): Promise<OfflineReceipt>;
  sync(): Promise<SyncResult>;
  getState(): CellState;
  getMetrics(): CellMetric[];
  dispose(): Promise<void>;
}
```

## 2. Organelle Interfaces

```typescript
export interface IRuleDefiner {
  receive(input: RawInput): Promise<ValidatedInput>;
  validate(input: RawInput): ValidationResult;
}

export interface IRuleExecutor {
  process(input: ValidatedInput, context: ExecutionContext): Promise<ProcessedOutput>;
  canProcess(input: ValidatedInput): boolean;
}

export interface IValidationReporter {
  route(output: ProcessedOutput): Promise<RoutingDecision>;
  getRoutes(): RouteDefinition[];
}

export interface IRuleCache {
  deliver(output: ProcessedOutput, route: RoutingDecision): Promise<DeliveryResult>;
  deliverOffline(output: ProcessedOutput): Promise<OfflineReceipt>;
}
```

## 3. Event Interface

```typescript
export interface ValidationExecutorEvents {
  onStateChange(handler: (state: CellState) => void): Unsubscribe;
  onError(handler: (error: CellError) => void): Unsubscribe;
  onMetric(handler: (metric: CellMetric) => void): Unsubscribe;
  onOfflineQueueChange(handler: (queue: OfflineQueueEntry[]) => void): Unsubscribe;
}
```

## 4. Configuration Interface

```typescript
export interface ValidationExecutorConfig {
  maxRetries: number;
  timeoutMs: number;  // Default: 30000 (Nigeria-optimized)
  offlineStorageKey: string;
  enableTelemetry: boolean;
  locale: string;  // Default: 'en-NG'
}
```
