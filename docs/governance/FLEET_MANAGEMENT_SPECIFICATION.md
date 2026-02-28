# Fleet Management Module - Specification

**Module:** Logistics Suite - Fleet Management  
**Version:** 1.0  
**Agent:** webwakaagent3  
**Step:** 372  
**Date:** 2026-02-13

---

## Overview

The Fleet Management module provides comprehensive tools for managing vehicle fleets, drivers, maintenance schedules, and operational efficiency in Nigerian logistics operations.

---

## Core Features

### 1. Vehicle Management
- Vehicle registration and profiles
- Vehicle types (trucks, vans, motorcycles, etc.)
- Vehicle specifications (capacity, fuel type, etc.)
- Vehicle status tracking (active, maintenance, inactive)
- Vehicle documents (registration, insurance, permits)

### 2. Driver Management
- Driver profiles and credentials
- License verification
- Driver assignment to vehicles
- Driver performance tracking
- Driver availability management

### 3. Maintenance Management
- Scheduled maintenance tracking
- Maintenance history
- Service reminders
- Cost tracking
- Vendor management

### 4. Fuel Management
- Fuel consumption tracking
- Fuel efficiency metrics
- Fuel cost management
- Refueling history

### 5. Fleet Analytics
- Fleet utilization metrics
- Cost per kilometer
- Maintenance cost analysis
- Driver performance metrics
- Fleet efficiency reports

---

## Data Models

### Vehicle
```typescript
interface Vehicle {
  id: string;
  tenantId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: 'truck' | 'van' | 'motorcycle' | 'car' | 'bus';
  capacity: {
    weight: number; // kg
    volume?: number; // cubic meters
    passengers?: number;
  };
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  status: 'active' | 'maintenance' | 'inactive' | 'retired';
  currentDriverId?: string;
  currentLocation?: GeoLocation;
  mileage: number; // km
  documents: {
    registration: DocumentInfo;
    insurance: DocumentInfo;
    roadworthiness: DocumentInfo;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Driver
```typescript
interface Driver {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  licenseClass: string;
  status: 'available' | 'assigned' | 'off-duty' | 'suspended';
  currentVehicleId?: string;
  rating?: number;
  totalTrips: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### MaintenanceRecord
```typescript
interface MaintenanceRecord {
  id: string;
  tenantId: string;
  vehicleId: string;
  type: 'scheduled' | 'repair' | 'inspection';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  vendor?: string;
  mileageAtService: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### FuelRecord
```typescript
interface FuelRecord {
  id: string;
  tenantId: string;
  vehicleId: string;
  driverId: string;
  date: Date;
  quantity: number; // liters
  cost: number; // NGN
  pricePerLiter: number;
  mileage: number;
  location?: string;
  createdAt: Date;
}
```

---

## Services

### 1. VehicleService
- `createVehicle(data)` - Register new vehicle
- `getVehicle(id, tenantId)` - Get vehicle details
- `listVehicles(tenantId, filters)` - List vehicles with filters
- `updateVehicle(id, tenantId, data)` - Update vehicle information
- `deleteVehicle(id, tenantId)` - Remove vehicle from fleet
- `assignDriver(vehicleId, driverId, tenantId)` - Assign driver to vehicle
- `updateLocation(vehicleId, location, tenantId)` - Update vehicle location
- `updateMileage(vehicleId, mileage, tenantId)` - Update vehicle mileage

### 2. DriverService
- `createDriver(data)` - Register new driver
- `getDriver(id, tenantId)` - Get driver details
- `listDrivers(tenantId, filters)` - List drivers with filters
- `updateDriver(id, tenantId, data)` - Update driver information
- `deleteDriver(id, tenantId)` - Remove driver
- `assignVehicle(driverId, vehicleId, tenantId)` - Assign vehicle to driver
- `updateStatus(driverId, status, tenantId)` - Update driver status
- `getDriverPerformance(driverId, tenantId)` - Get performance metrics

### 3. MaintenanceService
- `scheduleMainten ance(data)` - Schedule maintenance
- `getMaintenance(id, tenantId)` - Get maintenance details
- `listMaintenance(tenantId, filters)` - List maintenance records
- `updateMaintenance(id, tenantId, data)` - Update maintenance record
- `completeMaintenance(id, tenantId, data)` - Mark maintenance complete
- `cancelMaintenance(id, tenantId)` - Cancel scheduled maintenance
- `getMaintenanceHistory(vehicleId, tenantId)` - Get vehicle maintenance history

### 4. FuelService
- `recordFuel(data)` - Record fuel purchase
- `getFuelRecord(id, tenantId)` - Get fuel record
- `listFuelRecords(tenantId, filters)` - List fuel records
- `getFuelConsumption(vehicleId, tenantId, period)` - Calculate fuel consumption
- `getFuelCost(tenantId, period)` - Calculate fuel costs
- `getFuelEfficiency(vehicleId, tenantId)` - Calculate fuel efficiency

### 5. FleetAnalyticsService
- `getFleetUtilization(tenantId, period)` - Fleet utilization metrics
- `getMaintenanceCosts(tenantId, period)` - Maintenance cost analysis
- `getFuelCosts(tenantId, period)` - Fuel cost analysis
- `getDriverPerformance(tenantId, period)` - Driver performance metrics
- `getCostPerKilometer(tenantId, period)` - Cost per km analysis
- `getFleetEfficiency(tenantId)` - Overall fleet efficiency

---

## Events

### Vehicle Events
- `vehicle.created` - Vehicle registered
- `vehicle.updated` - Vehicle information updated
- `vehicle.deleted` - Vehicle removed
- `vehicle.driver_assigned` - Driver assigned to vehicle
- `vehicle.location_updated` - Vehicle location updated
- `vehicle.status_changed` - Vehicle status changed

### Driver Events
- `driver.created` - Driver registered
- `driver.updated` - Driver information updated
- `driver.deleted` - Driver removed
- `driver.vehicle_assigned` - Vehicle assigned to driver
- `driver.status_changed` - Driver status changed

### Maintenance Events
- `maintenance.scheduled` - Maintenance scheduled
- `maintenance.started` - Maintenance started
- `maintenance.completed` - Maintenance completed
- `maintenance.cancelled` - Maintenance cancelled

### Fuel Events
- `fuel.recorded` - Fuel purchase recorded

---

## Nigerian Context

### Vehicle Types
- **Danfo** (minibuses for public transport)
- **Keke NAPEP** (tricycles)
- **Okada** (motorcycles)
- **Trucks** (various sizes)
- **Vans** (delivery vehicles)

### Regulatory Compliance
- **FRSC** (Federal Road Safety Corps) compliance
- **VIO** (Vehicle Inspection Office) requirements
- **Road worthiness certificates**
- **Insurance requirements**
- **State-specific regulations**

### Nigerian States Coverage
- All 36 states + FCT
- State-specific vehicle registration formats
- Local government area tracking

---

## API Endpoints

### Vehicles
- `POST /api/v1/fleet/vehicles` - Create vehicle
- `GET /api/v1/fleet/vehicles/:id` - Get vehicle
- `GET /api/v1/fleet/vehicles` - List vehicles
- `PUT /api/v1/fleet/vehicles/:id` - Update vehicle
- `DELETE /api/v1/fleet/vehicles/:id` - Delete vehicle
- `POST /api/v1/fleet/vehicles/:id/assign-driver` - Assign driver
- `PUT /api/v1/fleet/vehicles/:id/location` - Update location
- `PUT /api/v1/fleet/vehicles/:id/mileage` - Update mileage

### Drivers
- `POST /api/v1/fleet/drivers` - Create driver
- `GET /api/v1/fleet/drivers/:id` - Get driver
- `GET /api/v1/fleet/drivers` - List drivers
- `PUT /api/v1/fleet/drivers/:id` - Update driver
- `DELETE /api/v1/fleet/drivers/:id` - Delete driver
- `POST /api/v1/fleet/drivers/:id/assign-vehicle` - Assign vehicle
- `PUT /api/v1/fleet/drivers/:id/status` - Update status

### Maintenance
- `POST /api/v1/fleet/maintenance` - Schedule maintenance
- `GET /api/v1/fleet/maintenance/:id` - Get maintenance
- `GET /api/v1/fleet/maintenance` - List maintenance
- `PUT /api/v1/fleet/maintenance/:id` - Update maintenance
- `POST /api/v1/fleet/maintenance/:id/complete` - Complete maintenance

### Fuel
- `POST /api/v1/fleet/fuel` - Record fuel
- `GET /api/v1/fleet/fuel/:id` - Get fuel record
- `GET /api/v1/fleet/fuel` - List fuel records
- `GET /api/v1/fleet/fuel/consumption/:vehicleId` - Get consumption

### Analytics
- `GET /api/v1/fleet/analytics/utilization` - Fleet utilization
- `GET /api/v1/fleet/analytics/maintenance-costs` - Maintenance costs
- `GET /api/v1/fleet/analytics/fuel-costs` - Fuel costs
- `GET /api/v1/fleet/analytics/driver-performance` - Driver performance

---

## Security & Privacy

### Data Protection
- Driver personal information encrypted
- License information secured
- Access control by tenant
- Audit logging for all operations

### Compliance
- NDPR (Nigeria Data Protection Regulation) compliant
- GDPR-ready for international operations
- Role-based access control

---

## Performance Requirements

- Vehicle list query: < 100ms
- Location update: < 50ms
- Analytics calculation: < 500ms
- Support for 10,000+ vehicles per tenant

---

## Success Criteria

✓ All CRUD operations functional  
✓ Driver-vehicle assignment working  
✓ Maintenance scheduling functional  
✓ Fuel tracking operational  
✓ Analytics providing insights  
✓ Nigerian context validated  
✓ Event-driven architecture  
✓ API endpoints documented  

---

**Specification Author:** webwakaagent3  
**Date:** 2026-02-13  
**Status:** ✓ SPECIFICATION COMPLETE
