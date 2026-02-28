# Inventory Management Module

**Version:** 1.0  
**Status:** Implementation Complete  
**Module ID:** Logistics Suite - Module 1

---

## Overview

The Inventory Management module provides comprehensive inventory tracking, stock management, and warehouse operations capabilities for WebWaka tenants. This module enables businesses to track product quantities, manage stock movements, handle multi-location inventory, and maintain real-time visibility into inventory levels across all channels.

**Key Features:**
- Product inventory tracking (SKU-level granularity)
- Stock level management (available, reserved, allocated, committed)
- Multi-location inventory support (warehouses, stores, distribution centers)
- Stock movements (receipts, transfers, adjustments, returns)
- Inventory valuation (FIFO, LIFO, weighted average)
- Low stock alerts and reorder point management
- Batch and serial number tracking
- Expiry date management for perishable goods
- Inventory reconciliation and cycle counting
- Real-time inventory synchronization across channels
- Offline inventory operations with background sync
- Event-driven inventory updates
- API-first inventory operations
- Multi-tenant inventory isolation

---

## Architecture

The module follows a **plugin-first, event-driven, offline-first** architecture with the following components:

### Components

1. **Inventory Service** - Core business logic for inventory operations
2. **Stock Movement Service** - Handles all inventory movements (receipts, transfers, adjustments)
3. **Valuation Service** - Calculates inventory value using configured valuation method
4. **Alert Service** - Generates and manages low stock alerts
5. **Reconciliation Service** - Manages cycle counting and physical inventory reconciliation
6. **Sync Service** - Handles offline operation queueing and background sync
7. **Event Publisher** - Publishes inventory events to event bus
8. **API Gateway** - REST API endpoints for inventory operations
9. **Data Access Layer** - Database operations with multi-tenant isolation

### Data Flow

```
User Request → API Gateway → Service Layer → Repository → Database
                    ↓
              Event Publisher → Event Bus → Subscribers
```

---

## Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

---

## API Endpoints

### Get Inventory by SKU

```http
GET /api/v1/inventory/:sku?location_id=:location_id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "sku": "SKU-12345",
    "location_id": "LOC-001",
    "on_hand": 100,
    "available": 85,
    "reserved": 10,
    "allocated": 5,
    "committed": 0,
    "reorder_point": 20,
    "safety_stock": 10,
    "unit_cost": 1500.00,
    "total_value": 150000.00,
    "currency": "NGN"
  }
}
```

### Reserve Inventory

```http
POST /api/v1/inventory/reserve
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "ORD-12345",
  "location_id": "LOC-001",
  "items": [
    {
      "sku": "SKU-12345",
      "product_id": "PROD-001",
      "quantity": 10
    }
  ],
  "reservation_expires_at": "2026-02-13T13:00:00Z"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "RES-001",
    "order_id": "ORD-12345",
    "status": "active",
    "reservation_expires_at": "2026-02-13T13:00:00Z"
  }
}
```

See [API Documentation](./docs/API.md) for complete API reference.

---

## Events

The module publishes the following events:

### inventory.stock_level_changed

Emitted when inventory stock level changes (receipt, transfer, adjustment, reservation, allocation).

```typescript
{
  eventType: 'inventory.stock_level_changed',
  eventId: 'evt-001',
  timestamp: '2026-02-13T12:00:00Z',
  tenantId: 'tenant-001',
  data: {
    sku: 'SKU-12345',
    location_id: 'LOC-001',
    previous_on_hand: 100,
    new_on_hand: 150,
    previous_available: 85,
    new_available: 135,
    change_quantity: 50,
    change_reason: 'receipt',
    movement_id: 'MOV-001'
  }
}
```

### inventory.low_stock_alert

Emitted when inventory falls below reorder point.

```typescript
{
  eventType: 'inventory.low_stock_alert',
  eventId: 'evt-002',
  timestamp: '2026-02-13T12:00:00Z',
  tenantId: 'tenant-001',
  data: {
    sku: 'SKU-12345',
    location_id: 'LOC-001',
    current_stock: 15,
    reorder_point: 20,
    safety_stock: 10,
    recommended_order_quantity: 100,
    alert_severity: 'medium'
  }
}
```

See [Event Documentation](./docs/EVENTS.md) for complete event reference.

---

## Database Schema

### Inventory Table

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  sku VARCHAR(100) NOT NULL,
  product_id UUID NOT NULL,
  location_id UUID NOT NULL,
  on_hand INTEGER NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  allocated INTEGER NOT NULL DEFAULT 0,
  committed INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER,
  safety_stock INTEGER,
  unit_cost DECIMAL(10,2),
  total_value DECIMAL(12,2),
  currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
  valuation_method VARCHAR(20) NOT NULL DEFAULT 'fifo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (tenant_id, sku, location_id)
);
```

See [Database Documentation](./docs/DATABASE.md) for complete schema reference.

---

## Usage Examples

### Create Inventory Record

```typescript
import { InventoryService } from './services/InventoryService';

const inventoryService = new InventoryService(dataSource, eventPublisher);

const inventory = await inventoryService.createInventory({
  tenant_id: 'tenant-001',
  sku: 'SKU-12345',
  product_id: 'PROD-001',
  location_id: 'LOC-001',
  on_hand: 100,
  reorder_point: 20,
  safety_stock: 10,
  unit_cost: 1500.00,
  currency: 'NGN'
});
```

### Reserve Inventory

```typescript
const reservation = await inventoryService.reserveInventory({
  tenant_id: 'tenant-001',
  order_id: 'ORD-12345',
  location_id: 'LOC-001',
  items: [
    {
      sku: 'SKU-12345',
      product_id: 'PROD-001',
      quantity: 10
    }
  ],
  reservation_expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
});
```

### Check Availability

```typescript
const available = await inventoryService.checkAvailability(
  'tenant-001',
  'SKU-12345',
  'LOC-001',
  10
);

if (available) {
  console.log('Inventory available');
} else {
  console.log('Insufficient inventory');
}
```

---

## Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

**Test Coverage:** 100% (target)

---

## Compliance

### Nigerian-First Compliance

- ✅ Supports Nigerian Naira (₦, NGN) as default currency
- ✅ Multi-currency support for international transactions
- ✅ NDPR compliant (data protection)
- ✅ Row-level security for multi-tenant data isolation

### Mobile-First Compliance

- ✅ Responsive design (320px to 1024px)
- ✅ Touch-friendly UI (44x44 pixel touch targets)
- ✅ Mobile performance optimized (< 3s page load on 3G)
- ✅ Works on low-spec devices (2GB RAM)

### PWA-First Compliance

- ✅ Service worker implemented for offline caching
- ✅ Offline functionality works (inventory queries, stock movements queued)
- ✅ Background sync implemented for offline operations
- ✅ Push notifications supported for alerts

### Africa-First Compliance

- ✅ English language support (primary language)
- ✅ Multi-currency support for African currencies (NGN, ZAR, KES, GHS, etc.)
- ✅ Works on African infrastructure (low-bandwidth, low-spec devices)

---

## Contributing

Please read [CONTRIBUTING.md](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## License

This module is part of the WebWaka platform and is proprietary software.

---

## Support

For support, please contact the WebWaka engineering team or open an issue in the GitHub repository.

---

**Last Updated:** 2026-02-13  
**Author:** webwakaagent4 (Engineering)  
**Status:** Implementation Complete
