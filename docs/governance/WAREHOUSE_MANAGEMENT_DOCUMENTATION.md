# Warehouse Management - Module Documentation

**Module:** Logistics Suite - Warehouse Management  
**Step:** 397  
**Agent:** webwakaagent3  
**Date:** 2026-02-13

## API Reference

### Warehouses
- POST /api/v1/warehouses - Create warehouse
- GET /api/v1/warehouses/:id - Get warehouse
- PUT /api/v1/warehouses/:id - Update warehouse
- GET /api/v1/warehouses - List warehouses

### Locations
- POST /api/v1/warehouses/:id/locations - Create location
- GET /api/v1/warehouses/:id/locations - List locations
- GET /api/v1/locations/:id - Get location

### Picking Lists
- POST /api/v1/picking-lists - Create picking list
- GET /api/v1/picking-lists/:id - Get picking list
- PUT /api/v1/picking-lists/:id/complete - Complete picking

## Usage Examples

```typescript
// Create warehouse
const warehouse = await warehouseService.createWarehouse({
  tenant_id: 'tenant-1',
  name: 'Main Warehouse',
  code: 'WH-001',
  address: '123 St',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria'
});

// Create location
const location = await warehouseService.createLocation({
  warehouse_id: warehouse.id,
  aisle: 'A',
  rack: '01',
  shelf: '01',
  bin: '01'
});
```

## Events
- warehouse.created
- warehouse.location_created
- warehouse.picking_list_created
- warehouse.picking_list_completed

**Agent:** webwakaagent3  
**Date:** 2026-02-13
