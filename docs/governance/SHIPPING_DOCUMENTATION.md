# Shipping - Module Documentation

**Step:** 406  
**Agent:** webwakaagent3  
**Date:** 2026-02-13

## API Reference

### Shipments
- POST /api/v1/shipments - Create shipment
- GET /api/v1/shipments/:id - Get shipment
- POST /api/v1/shipments/rates - Calculate rates
- POST /api/v1/shipments/:id/label - Generate label

### Carriers
- GET /api/v1/carriers - List carriers
- POST /api/v1/carriers - Add carrier

## Usage

```typescript
// Create shipment
const shipment = await shippingService.createShipment({
  tenant_id: 'tenant-1',
  order_id: 'order-1',
  carrier_id: 'carrier-1',
  from_address: {...},
  to_address: {...}
});

// Calculate rates
const rates = await shippingService.calculateRates({
  from: {...},
  to: {...},
  weight: 5.0
});
```

## Events
- shipment.created
- shipment.label_generated
- shipment.shipped
- shipment.delivered

**Agent:** webwakaagent3  
**Date:** 2026-02-13
