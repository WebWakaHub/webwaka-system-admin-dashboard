# EcommerceSystem — Interface Design
## System ID: SYS-COM-ECOMMERCE

### Public API Surface
- `ProductCatalogService`: Exposes product catalog operations
- `ShoppingCartService`: Exposes shopping cart operations
- `CheckoutEngineService`: Exposes checkout engine operations
- `OrderManagerService`: Exposes order manager operations
- `PaymentGatewayService`: Exposes payment gateway operations

### Event Contracts
- `ProductCatalogEvent`: Domain events from product catalog
- `ShoppingCartEvent`: Domain events from shopping cart
- `CheckoutEngineEvent`: Domain events from checkout engine
- `OrderManagerEvent`: Domain events from order manager
- `PaymentGatewayEvent`: Domain events from payment gateway

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
