# ResourceRegistry — Interface Design

**Cell:** CEL-RESOURCEREG-v0.1.0
**Category:** Resource & Asset Control

## 1. Cell Interface

```typescript
export interface IResourceRegistry {
  execute(command: ResourceRegistryCommand, context: ExecutionContext): Promise<ResourceRegistryResult>;
  executeOffline(command: ResourceRegistryCommand, context: ExecutionContext): Promise<OfflineReceipt>;
  sync(): Promise<SyncResult>;
  getState(): CellState;
  getMetrics(): CellMetric[];
  dispose(): Promise<void>;
}
```

## 2. Organelle Interfaces

```typescript
export interface IResourceRegistrar {
  receive(input: RawInput): Promise<ValidatedInput>;
  validate(input: RawInput): ValidationResult;
}

export interface IResourceDiscovery {
  process(input: ValidatedInput, context: ExecutionContext): Promise<ProcessedOutput>;
  canProcess(input: ValidatedInput): boolean;
}

export interface IResourceAllocator {
  route(output: ProcessedOutput): Promise<RoutingDecision>;
  getRoutes(): RouteDefinition[];
}

export interface IResourceReleaser {
  deliver(output: ProcessedOutput, route: RoutingDecision): Promise<DeliveryResult>;
  deliverOffline(output: ProcessedOutput): Promise<OfflineReceipt>;
}
```

## 3. Event Interface

```typescript
export interface ResourceRegistryEvents {
  onStateChange(handler: (state: CellState) => void): Unsubscribe;
  onError(handler: (error: CellError) => void): Unsubscribe;
  onMetric(handler: (metric: CellMetric) => void): Unsubscribe;
  onOfflineQueueChange(handler: (queue: OfflineQueueEntry[]) => void): Unsubscribe;
}
```

## 4. Configuration Interface

```typescript
export interface ResourceRegistryConfig {
  maxRetries: number;
  timeoutMs: number;  // Default: 30000 (Nigeria-optimized)
  offlineStorageKey: string;
  enableTelemetry: boolean;
  locale: string;  // Default: 'en-NG'
}
```
