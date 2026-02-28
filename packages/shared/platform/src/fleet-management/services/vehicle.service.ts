/**
 * Fleet Management - Vehicle Service
 */

import { EventEmitter } from 'events';
import { Vehicle, GeoLocation } from '../models/vehicle';

export class VehicleService {
  constructor(
    private repository: any,
    private eventEmitter: EventEmitter
  ) {}

  async createVehicle(data: Partial<Vehicle>, userId: string): Promise<Vehicle> {
    const vehicle = new Vehicle(data);
    await this.repository.create(vehicle);
    this.eventEmitter.emit('vehicle.created', { vehicle, userId });
    return vehicle;
  }

  async getVehicle(id: string, tenantId: string): Promise<Vehicle> {
    const vehicle = await this.repository.findById(id, tenantId);
    return vehicle;
  }

  async listVehicles(tenantId: string, filters?: any): Promise<Vehicle[]> {
    const vehicles = await this.repository.findByTenant(tenantId, filters);
    return vehicles;
  }

  async updateVehicle(id: string, tenantId: string, data: Partial<Vehicle>, userId: string): Promise<Vehicle> {
    const vehicle = await this.repository.findById(id, tenantId);
    Object.assign(vehicle, data);
    vehicle.updatedAt = new Date();
    await this.repository.update(vehicle);
    this.eventEmitter.emit('vehicle.updated', { vehicle, userId });
    return vehicle;
  }

  async deleteVehicle(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repository.delete(id, tenantId);
    this.eventEmitter.emit('vehicle.deleted', { vehicleId: id, tenantId, userId });
  }

  async assignDriver(vehicleId: string, driverId: string, tenantId: string): Promise<Vehicle> {
    const vehicle = await this.repository.findById(vehicleId, tenantId);
    vehicle.currentDriverId = driverId;
    vehicle.updatedAt = new Date();
    await this.repository.update(vehicle);
    this.eventEmitter.emit('vehicle.driver_assigned', { vehicleId, driverId, tenantId });
    return vehicle;
  }

  async updateLocation(vehicleId: string, location: GeoLocation, tenantId: string): Promise<Vehicle> {
    const vehicle = await this.repository.findById(vehicleId, tenantId);
    vehicle.currentLocation = location;
    vehicle.updatedAt = new Date();
    await this.repository.update(vehicle);
    this.eventEmitter.emit('vehicle.location_updated', { vehicleId, location, tenantId });
    return vehicle;
  }

  async updateMileage(vehicleId: string, mileage: number, tenantId: string): Promise<Vehicle> {
    const vehicle = await this.repository.findById(vehicleId, tenantId);
    vehicle.mileage = mileage;
    vehicle.updatedAt = new Date();
    await this.repository.update(vehicle);
    return vehicle;
  }

  async updateStatus(vehicleId: string, status: string, tenantId: string): Promise<Vehicle> {
    const vehicle = await this.repository.findById(vehicleId, tenantId);
    vehicle.status = status as any;
    vehicle.updatedAt = new Date();
    await this.repository.update(vehicle);
    this.eventEmitter.emit('vehicle.status_changed', { vehicleId, status, tenantId });
    return vehicle;
  }
}
