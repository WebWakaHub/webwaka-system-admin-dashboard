/**
 * Fleet Management - Driver Model
 */

export type DriverStatus = 'available' | 'assigned' | 'off-duty' | 'suspended';

export class Driver {
  id?: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  licenseClass: string;
  status: DriverStatus;
  currentVehicleId?: string;
  rating?: number;
  totalTrips: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Driver>) {
    this.id = data.id || Date.now().toString();
    this.tenantId = data.tenantId!;
    this.firstName = data.firstName!;
    this.lastName = data.lastName!;
    this.phone = data.phone!;
    this.email = data.email;
    this.licenseNumber = data.licenseNumber!;
    this.licenseExpiry = data.licenseExpiry!;
    this.licenseClass = data.licenseClass!;
    this.status = data.status || 'available';
    this.currentVehicleId = data.currentVehicleId;
    this.rating = data.rating;
    this.totalTrips = data.totalTrips || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
