# CIGateway — Interface Design

**Cell:** CEL-CIGATEWAY-v0.1.0
**Category:** Communication & Interaction

## 1. Cell Interface

```typescript
export interface ICIGateway {
  execute(command: CIGatewayCommand, context: ExecutionContext): Promise<CIGatewayResult>;
  executeOffline(command: CIGatewayCommand, context: ExecutionContext): Promise<OfflineReceipt>;
  sync(): Promise<SyncResult>;
  getState(): CellState;
  getMetrics(): CellMetric[];
  dispose(): Promise<void>;
}
```

## 2. Organelle Interfaces

```typescript
export interface IChannelReceiver {
  receive(input: RawInput): Promise<ValidatedInput>;
  validate(input: RawInput): ValidationResult;
}

export interface IMessageValidator {
  process(input: ValidatedInput, context: ExecutionContext): Promise<ProcessedOutput>;
  canProcess(input: ValidatedInput): boolean;
}

export interface IProtocolNormalizer {
  route(output: ProcessedOutput): Promise<RoutingDecision>;
  getRoutes(): RouteDefinition[];
}

export interface IInteractionRouter {
  deliver(output: ProcessedOutput, route: RoutingDecision): Promise<DeliveryResult>;
  deliverOffline(output: ProcessedOutput): Promise<OfflineReceipt>;
}
```

## 3. Event Interface

```typescript
export interface CIGatewayEvents {
  onStateChange(handler: (state: CellState) => void): Unsubscribe;
  onError(handler: (error: CellError) => void): Unsubscribe;
  onMetric(handler: (metric: CellMetric) => void): Unsubscribe;
  onOfflineQueueChange(handler: (queue: OfflineQueueEntry[]) => void): Unsubscribe;
}
```

## 4. Configuration Interface

```typescript
export interface CIGatewayConfig {
  maxRetries: number;
  timeoutMs: number;  // Default: 30000 (Nigeria-optimized)
  offlineStorageKey: string;
  enableTelemetry: boolean;
  locale: string;  // Default: 'en-NG'
}
```
