/**
 * ShippingService
 * 
 * Core business logic for shipping operations.
 */

import { DataSource, Repository } from 'typeorm';
import { Shipment, TrackingEvent, Carrier } from '../models';
import {
  CreateShipmentDTO,
  UpdateShipmentDTO,
  RateQuoteRequest,
  RateQuote,
  TrackingEventDTO,
  ShipmentFilterDTO,
  ShipmentStatus,
  CarrierCode,
  ServiceType
} from '../types';
import { EventPublisher } from '../events/EventPublisher';

export class ShippingService {
  private shipmentRepo: Repository<Shipment>;
  private trackingEventRepo: Repository<TrackingEvent>;
  private carrierRepo: Repository<Carrier>;

  constructor(
    private dataSource: DataSource,
    private eventPublisher: EventPublisher
  ) {
    this.shipmentRepo = dataSource.getRepository(Shipment);
    this.trackingEventRepo = dataSource.getRepository(TrackingEvent);
    this.carrierRepo = dataSource.getRepository(Carrier);
  }

  // Shipment Management
  async createShipment(dto: CreateShipmentDTO): Promise<Shipment> {
    // Validate carrier
    const carrier = await this.carrierRepo.findOne({
      where: { id: dto.carrier_id, tenant_id: dto.tenant_id }
    });

    if (!carrier) {
      throw new Error('Carrier not found');
    }

    if (!carrier.isActive()) {
      throw new Error('Carrier is not active');
    }

    if (!carrier.supportsService(dto.service_type)) {
      throw new Error(`Carrier does not support service type ${dto.service_type}`);
    }

    // Generate shipment number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const shipment_number = `SHIP-${timestamp}-${random}`;

    // Calculate totals
    const total_weight_kg = dto.packages.reduce((sum, pkg) => sum + pkg.weight_kg, 0);
    const total_declared_value = dto.packages.reduce((sum, pkg) => sum + pkg.declared_value, 0);

    // Calculate shipping cost
    const shipping_cost = await this.calculateShippingCost(
      carrier.carrier_code,
      dto.service_type,
      total_weight_kg,
      dto.from_address,
      dto.to_address
    );

    // Calculate insurance cost (1% of declared value)
    const insurance_cost = total_declared_value * 0.01;

    // Create shipment
    const shipment = this.shipmentRepo.create({
      ...dto,
      shipment_number,
      carrier_code: carrier.carrier_code,
      total_weight_kg,
      total_declared_value,
      shipping_cost,
      insurance_cost,
      total_cost: shipping_cost + insurance_cost,
      status: ShipmentStatus.PENDING
    });

    const saved = await this.shipmentRepo.save(shipment);
    await this.eventPublisher.publishShipmentCreated(saved);
    return saved;
  }

  async getShipment(id: string, tenant_id: string): Promise<Shipment | null> {
    return await this.shipmentRepo.findOne({
      where: { id, tenant_id },
      relations: ['tracking_events']
    });
  }

  async listShipments(filters: ShipmentFilterDTO): Promise<{ shipments: Shipment[]; total: number }> {
    const { tenant_id, status, carrier_id, order_id, date_from, date_to, page = 1, limit = 20 } = filters;
    
    const query = this.shipmentRepo.createQueryBuilder('shipment')
      .where('shipment.tenant_id = :tenant_id', { tenant_id });

    if (status) {
      query.andWhere('shipment.status = :status', { status });
    }

    if (carrier_id) {
      query.andWhere('shipment.carrier_id = :carrier_id', { carrier_id });
    }

    if (order_id) {
      query.andWhere('shipment.order_id = :order_id', { order_id });
    }

    if (date_from) {
      query.andWhere('shipment.created_at >= :date_from', { date_from });
    }

    if (date_to) {
      query.andWhere('shipment.created_at <= :date_to', { date_to });
    }

    const [shipments, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('shipment.created_at', 'DESC')
      .getManyAndCount();

    return { shipments, total };
  }

  async updateShipment(id: string, tenant_id: string, dto: UpdateShipmentDTO): Promise<Shipment> {
    const shipment = await this.getShipment(id, tenant_id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    Object.assign(shipment, dto);
    return await this.shipmentRepo.save(shipment);
  }

  async generateLabel(id: string, tenant_id: string): Promise<Shipment> {
    const shipment = await this.getShipment(id, tenant_id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Generate tracking number
    const tracking_number = `TRK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Generate label URL (in real implementation, this would call carrier API)
    const label_url = `https://labels.webwaka.com/${tracking_number}.pdf`;

    shipment.generateLabel(label_url, tracking_number);
    const saved = await this.shipmentRepo.save(shipment);

    // Create tracking event
    await this.addTrackingEvent({
      shipment_id: shipment.id,
      tracking_number,
      event_type: 'label_created',
      event_description: 'Shipping label created',
      event_location: shipment.from_address.city,
      event_timestamp: new Date()
    });

    await this.eventPublisher.publishLabelGenerated(saved);
    return saved;
  }

  async markShipped(id: string, tenant_id: string): Promise<Shipment> {
    const shipment = await this.getShipment(id, tenant_id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    shipment.markShipped();
    const saved = await this.shipmentRepo.save(shipment);

    // Create tracking event
    await this.addTrackingEvent({
      shipment_id: shipment.id,
      tracking_number: shipment.tracking_number,
      event_type: 'in_transit',
      event_description: 'Package in transit',
      event_location: shipment.from_address.city,
      event_timestamp: new Date()
    });

    await this.eventPublisher.publishShipmentInTransit(saved);
    return saved;
  }

  async markDelivered(id: string, tenant_id: string, signature?: string): Promise<Shipment> {
    const shipment = await this.getShipment(id, tenant_id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    shipment.markDelivered(signature);
    const saved = await this.shipmentRepo.save(shipment);

    // Create tracking event
    await this.addTrackingEvent({
      shipment_id: shipment.id,
      tracking_number: shipment.tracking_number,
      event_type: 'delivered',
      event_description: 'Package delivered',
      event_location: shipment.to_address.city,
      event_timestamp: new Date()
    });

    await this.eventPublisher.publishShipmentDelivered(saved);
    return saved;
  }

  async cancelShipment(id: string, tenant_id: string): Promise<Shipment> {
    const shipment = await this.getShipment(id, tenant_id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    shipment.cancel();
    const saved = await this.shipmentRepo.save(shipment);
    await this.eventPublisher.publishShipmentCancelled(saved);
    return saved;
  }

  // Rate Calculation
  async getRateQuotes(request: RateQuoteRequest): Promise<RateQuote[]> {
    const { tenant_id, from_address, to_address, packages, service_types } = request;

    // Get active carriers for tenant
    const carriers = await this.carrierRepo.find({
      where: { tenant_id, status: 'active' }
    });

    const quotes: RateQuote[] = [];
    const total_weight_kg = packages.reduce((sum, pkg) => sum + pkg.weight_kg, 0);

    for (const carrier of carriers) {
      const services = service_types || carrier.supported_services;

      for (const service_type of services) {
        if (!carrier.supportsService(service_type)) continue;

        const rate = await this.calculateShippingCost(
          carrier.carrier_code,
          service_type,
          total_weight_kg,
          from_address,
          to_address
        );

        const estimated_days = this.getEstimatedDeliveryDays(carrier.carrier_code, service_type);
        const estimated_delivery_date = new Date();
        estimated_delivery_date.setDate(estimated_delivery_date.getDate() + estimated_days);

        quotes.push({
          carrier_id: carrier.id,
          carrier_code: carrier.carrier_code,
          carrier_name: carrier.carrier_name,
          service_type,
          rate,
          currency: 'NGN',
          estimated_days,
          estimated_delivery_date
        });
      }
    }

    // Sort by rate (cheapest first)
    return quotes.sort((a, b) => a.rate - b.rate);
  }

  // Tracking
  async addTrackingEvent(dto: TrackingEventDTO): Promise<TrackingEvent> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: dto.shipment_id }
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const event = this.trackingEventRepo.create({
      ...dto,
      tenant_id: shipment.tenant_id
    });

    return await this.trackingEventRepo.save(event);
  }

  async getTrackingEvents(shipment_id: string, tenant_id: string): Promise<TrackingEvent[]> {
    return await this.trackingEventRepo.find({
      where: { shipment_id, tenant_id },
      order: { event_timestamp: 'ASC' }
    });
  }

  async trackByTrackingNumber(tracking_number: string, tenant_id: string): Promise<{
    shipment: Shipment;
    events: TrackingEvent[];
  }> {
    const shipment = await this.shipmentRepo.findOne({
      where: { tracking_number, tenant_id }
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const events = await this.getTrackingEvents(shipment.id, tenant_id);

    return { shipment, events };
  }

  // Private helper methods
  private async calculateShippingCost(
    carrier_code: CarrierCode,
    service_type: ServiceType,
    weight_kg: number,
    from_address: any,
    to_address: any
  ): Promise<number> {
    // Base rates by carrier
    const baseRates: Record<CarrierCode, number> = {
      [CarrierCode.DHL]: 20,
      [CarrierCode.FEDEX]: 18,
      [CarrierCode.UPS]: 19,
      [CarrierCode.USPS]: 15,
      [CarrierCode.KWIK]: 10,
      [CarrierCode.GIG]: 8
    };

    // Service type multipliers
    const serviceMultipliers: Record<ServiceType, number> = {
      [ServiceType.ECONOMY]: 0.8,
      [ServiceType.STANDARD]: 1.0,
      [ServiceType.EXPRESS]: 1.5,
      [ServiceType.OVERNIGHT]: 2.0,
      [ServiceType.SAME_DAY]: 3.0
    };

    const baseRate = baseRates[carrier_code] || 15;
    const serviceMultiplier = serviceMultipliers[service_type] || 1.0;
    const weightCost = weight_kg * 2;

    // Calculate distance-based cost (simplified)
    const distanceCost = from_address.state === to_address.state ? 0 : 5;

    return (baseRate + weightCost + distanceCost) * serviceMultiplier;
  }

  private getEstimatedDeliveryDays(carrier_code: CarrierCode, service_type: ServiceType): number {
    const estimates: Record<ServiceType, number> = {
      [ServiceType.SAME_DAY]: 0,
      [ServiceType.OVERNIGHT]: 1,
      [ServiceType.EXPRESS]: 2,
      [ServiceType.STANDARD]: 5,
      [ServiceType.ECONOMY]: 7
    };

    return estimates[service_type] || 5;
  }
}
