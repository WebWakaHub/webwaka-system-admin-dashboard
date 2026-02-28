# EventDispatcher — Interface Design

**Cell:** CEL-EVENTDISPATCH-v0.1.0
**Category:** Eventing & State

## 1. Cell Interface

```typescript
export interface IEventDispatcher {
  execute(command: EventDispatcherCommand, context: ExecutionContext): Promise<EventDispatcherResult>;
  executeOffline(command: EventDispatcherCommand, context: ExecutionContext): Promise<OfflineReceipt>;
  sync(): Promise<SyncResult>;
  getState(): CellState;
  getMetrics(): CellMetric[];
  dispose(): Promise<void>;
}
```

## 2. Organelle Interfaces

```typescript
export interface IEventCapture {
  receive(input: RawInput): Promise<ValidatedInput>;
  validate(input: RawInput): ValidationResult;
}

export interface IEventValidator {
  process(input: ValidatedInput, context: ExecutionContext): Promise<ProcessedOutput>;
  canProcess(input: ValidatedInput): boolean;
}

export interface IEventRouter {
  route(output: ProcessedOutput): Promise<RoutingDecision>;
  getRoutes(): RouteDefinition[];
}

export interface IEventDelivery {
  deliver(output: ProcessedOutput, route: RoutingDecision): Promise<DeliveryResult>;
  deliverOffline(output: ProcessedOutput): Promise<OfflineReceipt>;
}
```

## 3. Event Interface

```typescript
export interface EventDispatcherEvents {
  onStateChange(handler: (state: CellState) => void): Unsubscribe;
  onError(handler: (error: CellError) => void): Unsubscribe;
  onMetric(handler: (metric: CellMetric) => void): Unsubscribe;
  onOfflineQueueChange(handler: (queue: OfflineQueueEntry[]) => void): Unsubscribe;
}
```

## 4. Configuration Interface

```typescript
export interface EventDispatcherConfig {
  maxRetries: number;
  timeoutMs: number;  // Default: 30000 (Nigeria-optimized)
  offlineStorageKey: string;
  enableTelemetry: boolean;
  locale: string;  // Default: 'en-NG'
}
```
