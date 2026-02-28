/**
 * Fleet Management - Vehicle Model
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DocumentInfo {
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
}

export interface VehicleCapacity {
  weight: number; // kg
  volume?: number; // cubic meters
  passengers?: number;
}

export type VehicleType = 'truck' | 'van' | 'motorcycle' | 'car' | 'bus' | 'danfo' | 'keke' | 'okada';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type VehicleStatus = 'active' | 'maintenance' | 'inactive' | 'retired';

export class Vehicle {
  id?: string;
  tenantId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  capacity: VehicleCapacity;
  fuelType: FuelType;
  status: VehicleStatus;
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

  constructor(data: Partial<Vehicle>) {
    this.id = data.id || Date.now().toString();
    this.tenantId = data.tenantId!;
    this.registrationNumber = data.registrationNumber!;
    this.make = data.make!;
    this.model = data.model!;
    this.year = data.year!;
    this.type = data.type!;
    this.capacity = data.capacity!;
    this.fuelType = data.fuelType!;
    this.status = data.status || 'active';
    this.currentDriverId = data.currentDriverId;
    this.currentLocation = data.currentLocation;
    this.mileage = data.mileage || 0;
    this.documents = data.documents!;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
