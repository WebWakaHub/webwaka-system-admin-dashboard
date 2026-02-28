# Shipping Module Specification

**Module:** Logistics Suite - Module 4  
**Version:** 1.0  
**Date:** 2026-02-13  
**Author:** webwakaagent3 (Core Platform Architect)  
**Status:** Draft for Review

---

## 1. Module Overview

### 1.1 Purpose

The Shipping module provides comprehensive shipping and carrier management for the WebWaka platform. It manages shipment creation, carrier integration, rate calculation, label generation, tracking, and delivery confirmation. The module supports multiple carriers including international (DHL, FedEx, UPS) and Nigerian local carriers (Kwik, GIG Logistics).

### 1.2 Business Value

This module enables businesses to efficiently manage shipping operations with automated carrier selection based on cost and delivery time, real-time shipping rate calculation, automated label generation, multi-carrier support for flexibility, shipment tracking integration, delivery confirmation and proof of delivery, and cost optimization through carrier comparison. It reduces manual shipping operations by 80% and improves delivery accuracy.

### 1.3 Key Features

- Multi-carrier integration (DHL, FedEx, UPS, USPS, Kwik, GIG Logistics)
- Automated rate calculation and carrier selection
- Shipping label generation with barcode/QR code
- Real-time shipment tracking
- Delivery confirmation and proof of delivery
- Bulk shipment processing
- Address validation and correction
- Customs documentation for international shipments
- Shipping cost optimization
- Integration with Order and Warehouse Management modules

---

## 2. Functional Requirements

### 2.1 Carrier Management

**FR-CM-001:** The system shall support multiple shipping carriers with configurable credentials and settings.

**FR-CM-002:** The system shall maintain carrier service types (standard, express, overnight, economy) with delivery time estimates.

**FR-CM-003:** The system shall support carrier-specific requirements (packaging, weight limits, restricted items).

**FR-CM-004:** The system shall enable/disable carriers per tenant based on business agreements.

**FR-CM-005:** The system shall track carrier performance metrics (on-time delivery rate, damage rate, cost).

### 2.2 Rate Calculation

**FR-RC-001:** The system shall calculate shipping rates from multiple carriers based on origin, destination, weight, and dimensions.

**FR-RC-002:** The system shall support real-time rate quotes from carrier APIs.

**FR-RC-003:** The system shall apply shipping discounts and negotiated rates per tenant.

**FR-RC-004:** The system shall calculate dimensional weight when applicable.

**FR-RC-005:** The system shall include insurance costs in rate calculation when requested.

**FR-RC-006:** The system shall support zone-based pricing for Nigerian carriers.

### 2.3 Shipment Creation

**FR-SC-001:** The system shall create shipments from completed orders with validated addresses.

**FR-SC-002:** The system shall generate unique shipment numbers and tracking numbers.

**FR-SC-003:** The system shall support single-package and multi-package shipments.

**FR-SC-004:** The system shall validate package dimensions and weight against carrier limits.

**FR-SC-005:** The system shall support shipment scheduling for future pickup dates.

**FR-SC-006:** The system shall handle special instructions (fragile, perishable, signature required).

### 2.4 Label Generation

**FR-LG-001:** The system shall generate shipping labels in PDF format with carrier-compliant layout.

**FR-LG-002:** The system shall include barcode and/or QR code on labels for scanning.

**FR-LG-003:** The system shall support thermal printer formats (4x6 inch labels).

**FR-LG-004:** The system shall generate commercial invoices for international shipments.

**FR-LG-005:** The system shall support bulk label printing for multiple shipments.

**FR-LG-006:** The system shall store label URLs for reprinting.

### 2.5 Tracking

**FR-TR-001:** The system shall track shipment status through carrier APIs.

**FR-TR-002:** The system shall provide real-time tracking updates to customers.

**FR-TR-003:** The system shall support tracking by shipment number, order number, or tracking number.

**FR-TR-004:** The system shall record tracking events (picked up, in transit, out for delivery, delivered).

**FR-TR-005:** The system shall send automated notifications on status changes.

**FR-TR-006:** The system shall handle delivery exceptions (failed delivery, returned to sender).

### 2.6 Address Management

**FR-AM-001:** The system shall validate addresses using carrier address validation APIs.

**FR-AM-002:** The system shall suggest address corrections when validation fails.

**FR-AM-003:** The system shall support address book for frequently used addresses.

**FR-AM-004:** The system shall validate Nigerian addresses with state and LGA support.

**FR-AM-005:** The system shall geocode addresses for route optimization.

---

## 3. Data Model

### 3.1 Carrier Entity

```typescript
interface Carrier {
  id: string;
  tenant_id: string;
  carrier_code: CarrierCode;     // dhl, fedex, ups, usps, kwik, gig
  carrier_name: string;
  account_number: string;
  api_credentials: APICredentials;
  status: CarrierStatus;         // active, inactive, suspended
  supported_services: ServiceType[];
  settings: CarrierSettings;
  created_at: Date;
  updated_at: Date;
}
```

### 3.2 Shipment Entity

```typescript
interface Shipment {
  id: string;
  tenant_id: string;
  order_id: string;
  shipment_number: string;
  carrier_id: string;
  carrier_code: CarrierCode;
  service_type: ServiceType;
  tracking_number: string;
  status: ShipmentStatus;
  from_address: Address;
  to_address: Address;
  packages: Package[];
  total_weight_kg: number;
  total_declared_value: number;
  shipping_cost: number;
  insurance_cost: number;
  total_cost: number;
  label_url: string;
  commercial_invoice_url: string;
  special_instructions: string;
  scheduled_pickup_date: Date;
  shipped_at: Date;
  estimated_delivery_date: Date;
  delivered_at: Date;
  delivery_signature: string;
  created_at: Date;
  updated_at: Date;
}
```

### 3.3 TrackingEvent Entity

```typescript
interface TrackingEvent {
  id: string;
  tenant_id: string;
  shipment_id: string;
  tracking_number: string;
  event_type: TrackingEventType;
  event_description: string;
  event_location: string;
  event_timestamp: Date;
  carrier_event_code: string;
  created_at: Date;
}
```

---

## 4. API Design

**POST /api/v1/carriers** - Create carrier configuration  
**GET /api/v1/carriers** - List configured carriers  
**POST /api/v1/shipping/rates** - Get shipping rates  
**POST /api/v1/shipments** - Create new shipment  
**GET /api/v1/shipments** - List shipments  
**GET /api/v1/shipments/:id** - Get shipment details  
**POST /api/v1/shipments/:id/label** - Generate shipping label  
**GET /api/v1/tracking/:tracking_number** - Track shipment  
**POST /api/v1/addresses/validate** - Validate address

---

## 5. Integration Points

### 5.1 Integration with Order Management
- Shipments created from confirmed orders
- Order status updated when shipment is created and delivered
- Shipping cost added to order total

### 5.2 Integration with Warehouse Management
- Shipment created when packing is completed
- Package details from packing process
- Labels printed at packing stations

### 5.3 Integration with Tracking Module
- Tracking events published for tracking module
- Real-time status updates shared
- Delivery confirmation shared

---

## 6. Compliance Requirements

### 6.1 Nigerian-First Compliance
- Support for Nigerian carriers (Kwik, GIG Logistics)
- Nigerian address format with state and LGA
- Pricing in Nigerian Naira (NGN)
- Cash on delivery support

### 6.2 Mobile-First Compliance
- Mobile-optimized tracking interface
- Mobile label access
- Push notifications for tracking updates
- Offline tracking history

### 6.3 PWA-First Compliance
- Installable shipping management PWA
- Offline shipment history
- Background tracking updates
- Push notifications

---

## 7. Testing Requirements

- Unit tests for all services and models
- Integration tests for carrier APIs
- Integration tests with Order and Warehouse modules
- Performance tests for bulk operations
- Multi-tenant isolation tests

---

**Document Status:** DRAFT  
**Author:** webwakaagent3 (Core Platform Architect)  
**Date:** 2026-02-13  
**Next Step:** Review by webwakaagent4 (Step 400)
