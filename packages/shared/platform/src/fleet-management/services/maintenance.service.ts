/**
 * Fleet Management - Maintenance and Fuel Services
 */

import { EventEmitter } from 'events';
import { MaintenanceRecord, FuelRecord } from '../models/maintenance';

export class MaintenanceService {
  constructor(
    private repository: any,
    private eventEmitter: EventEmitter
  ) {}

  async scheduleMaintenance(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const maintenance = new MaintenanceRecord(data);
    await this.repository.create(maintenance);
    this.eventEmitter.emit('maintenance.scheduled', { maintenance });
    return maintenance;
  }

  async getMaintenance(id: string, tenantId: string): Promise<MaintenanceRecord> {
    const maintenance = await this.repository.findById(id, tenantId);
    return maintenance;
  }

  async listMaintenance(tenantId: string, filters?: any): Promise<MaintenanceRecord[]> {
    const records = await this.repository.findByTenant(tenantId, filters);
    return records;
  }

  async updateMaintenance(id: string, tenantId: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const maintenance = await this.repository.findById(id, tenantId);
    Object.assign(maintenance, data);
    maintenance.updatedAt = new Date();
    await this.repository.update(maintenance);
    return maintenance;
  }

  async completeMaintenance(id: string, tenantId: string, data: { cost: number; completedDate: Date }): Promise<MaintenanceRecord> {
    const maintenance = await this.repository.findById(id, tenantId);
    maintenance.status = 'completed';
    maintenance.completedDate = data.completedDate;
    maintenance.cost = data.cost;
    maintenance.updatedAt = new Date();
    await this.repository.update(maintenance);
    this.eventEmitter.emit('maintenance.completed', { maintenance });
    return maintenance;
  }

  async cancelMaintenance(id: string, tenantId: string): Promise<MaintenanceRecord> {
    const maintenance = await this.repository.findById(id, tenantId);
    maintenance.status = 'cancelled';
    maintenance.updatedAt = new Date();
    await this.repository.update(maintenance);
    this.eventEmitter.emit('maintenance.cancelled', { maintenanceId: id, tenantId });
    return maintenance;
  }

  async getMaintenanceHistory(vehicleId: string, tenantId: string): Promise<MaintenanceRecord[]> {
    const history = await this.repository.findByVehicle(vehicleId, tenantId);
    return history;
  }
}

export class FuelService {
  constructor(
    private repository: any,
    private eventEmitter: EventEmitter
  ) {}

  async recordFuel(data: Partial<FuelRecord>): Promise<FuelRecord> {
    const fuelRecord = new FuelRecord(data);
    await this.repository.create(fuelRecord);
    this.eventEmitter.emit('fuel.recorded', { fuelRecord });
    return fuelRecord;
  }

  async getFuelRecord(id: string, tenantId: string): Promise<FuelRecord> {
    const record = await this.repository.findById(id, tenantId);
    return record;
  }

  async listFuelRecords(tenantId: string, filters?: any): Promise<FuelRecord[]> {
    const records = await this.repository.findByTenant(tenantId, filters);
    return records;
  }

  async getFuelConsumption(vehicleId: string, tenantId: string, period?: any): Promise<number> {
    const records = await this.repository.findByVehicle(vehicleId, tenantId, period);
    const totalLiters = records.reduce((sum: number, r: FuelRecord) => sum + r.quantity, 0);
    return totalLiters;
  }

  async getFuelCost(tenantId: string, period?: any): Promise<number> {
    const records = await this.repository.findByTenant(tenantId, period);
    const totalCost = records.reduce((sum: number, r: FuelRecord) => sum + r.cost, 0);
    return totalCost;
  }

  async getFuelEfficiency(vehicleId: string, tenantId: string): Promise<number> {
    const records = await this.repository.findByVehicle(vehicleId, tenantId);
    if (records.length < 2) return 0;
    
    const sorted = records.sort((a: FuelRecord, b: FuelRecord) => a.mileage - b.mileage);
    const totalDistance = sorted[sorted.length - 1].mileage - sorted[0].mileage;
    const totalFuel = records.reduce((sum: number, r: FuelRecord) => sum + r.quantity, 0);
    
    return totalDistance / totalFuel; // km per liter
  }
}
