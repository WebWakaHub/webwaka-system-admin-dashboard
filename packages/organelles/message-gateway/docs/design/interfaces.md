# MessageGateway — Interface Contracts

## Primary Interface

```typescript
interface IMessageGateway {
  readonly id: string;
  readonly state: MessageGatewayState;
  
  execute(command: MessageGatewayCommand): Promise<MessageGatewayResult>;
  query(query: MessageGatewayQuery): MessageGatewayQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IMessageGatewayStorage {
  save(entity: MessageGatewayEntity): Promise<void>;
  load(id: string): Promise<MessageGatewayEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IMessageGatewayEvents {
  emit(event: MessageGatewayEvent): void;
  subscribe(handler: (event: MessageGatewayEvent) => void): () => void;
}
```
