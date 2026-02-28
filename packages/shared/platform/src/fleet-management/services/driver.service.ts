/**
 * Fleet Management - Driver Service
 */

import { EventEmitter } from 'events';
import { Driver } from '../models/driver';

export class DriverService {
  constructor(
    private repository: any,
    private eventEmitter: EventEmitter
  ) {}

  async createDriver(data: Partial<Driver>): Promise<Driver> {
    const driver = new Driver(data);
    await this.repository.create(driver);
    this.eventEmitter.emit('driver.created', { driver });
    return driver;
  }

  async getDriver(id: string, tenantId: string): Promise<Driver> {
    const driver = await this.repository.findById(id, tenantId);
    return driver;
  }

  async listDrivers(tenantId: string, filters?: any): Promise<Driver[]> {
    const drivers = await this.repository.findByTenant(tenantId, filters);
    return drivers;
  }

  async updateDriver(id: string, tenantId: string, data: Partial<Driver>): Promise<Driver> {
    const driver = await this.repository.findById(id, tenantId);
    Object.assign(driver, data);
    driver.updatedAt = new Date();
    await this.repository.update(driver);
    this.eventEmitter.emit('driver.updated', { driver });
    return driver;
  }

  async deleteDriver(id: string, tenantId: string): Promise<void> {
    await this.repository.delete(id, tenantId);
    this.eventEmitter.emit('driver.deleted', { driverId: id, tenantId });
  }

  async assignVehicle(driverId: string, vehicleId: string, tenantId: string): Promise<Driver> {
    const driver = await this.repository.findById(driverId, tenantId);
    driver.currentVehicleId = vehicleId;
    driver.status = 'assigned';
    driver.updatedAt = new Date();
    await this.repository.update(driver);
    this.eventEmitter.emit('driver.vehicle_assigned', { driverId, vehicleId, tenantId });
    return driver;
  }

  async updateStatus(driverId: string, status: string, tenantId: string): Promise<Driver> {
    const driver = await this.repository.findById(driverId, tenantId);
    driver.status = status as any;
    driver.updatedAt = new Date();
    await this.repository.update(driver);
    this.eventEmitter.emit('driver.status_changed', { driverId, status, tenantId });
    return driver;
  }

  async getDriverPerformance(driverId: string, tenantId: string): Promise<any> {
    const driver = await this.repository.findById(driverId, tenantId);
    return {
      driverId: driver.id,
      name: `${driver.firstName} ${driver.lastName}`,
      totalTrips: driver.totalTrips,
      rating: driver.rating || 0,
      status: driver.status,
    };
  }
}
