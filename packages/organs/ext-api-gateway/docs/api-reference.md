# ApiGateway Organ — API Reference
## Organ ID: ORGX-EXT-API_GATEWAY

### Classes

#### `ApiGatewayOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ApiGatewayCommand): Promise<ApiGatewayEvent>` — Execute a domain command
- `executeOffline(command: ApiGatewayCommand): ApiGatewayEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ApiGatewayHealth` — Get organ health status
- `registerAIProvider(provider: ApiGatewayAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ApiGatewayCommand` — Domain command structure
- `ApiGatewayEvent` — Domain event structure
- `ApiGatewayQuery` — Domain query structure
- `ApiGatewayState` — Domain state structure
- `ApiGatewayHealth` — Organ health status
- `ApiGatewayAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 9ed8f7b4_
