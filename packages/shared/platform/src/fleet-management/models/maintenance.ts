/**
 * Fleet Management - Maintenance and Fuel Models
 */

export type MaintenanceType = 'scheduled' | 'repair' | 'inspection';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export class MaintenanceRecord {
  id?: string;
  tenantId: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  vendor?: string;
  mileageAtService: number;
  status: MaintenanceStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<MaintenanceRecord>) {
    this.id = data.id || Date.now().toString();
    this.tenantId = data.tenantId!;
    this.vehicleId = data.vehicleId!;
    this.type = data.type!;
    this.description = data.description!;
    this.scheduledDate = data.scheduledDate!;
    this.completedDate = data.completedDate;
    this.cost = data.cost || 0;
    this.vendor = data.vendor;
    this.mileageAtService = data.mileageAtService!;
    this.status = data.status || 'scheduled';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

export class FuelRecord {
  id?: string;
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

  constructor(data: Partial<FuelRecord>) {
    this.id = data.id || Date.now().toString();
    this.tenantId = data.tenantId!;
    this.vehicleId = data.vehicleId!;
    this.driverId = data.driverId!;
    this.date = data.date || new Date();
    this.quantity = data.quantity!;
    this.cost = data.cost!;
    this.pricePerLiter = data.pricePerLiter!;
    this.mileage = data.mileage!;
    this.location = data.location;
    this.createdAt = data.createdAt || new Date();
  }
}
