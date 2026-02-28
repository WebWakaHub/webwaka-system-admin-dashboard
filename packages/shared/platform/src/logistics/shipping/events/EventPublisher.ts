/**
 * EventPublisher
 * 
 * Publishes shipping lifecycle events to the event bus.
 */

import { Shipment } from '../models';

export interface EventBus {
  publish(eventName: string, payload: any): Promise<void>;
}

export class EventPublisher {
  constructor(private eventBus: EventBus) {}

  async publishShipmentCreated(shipment: Shipment): Promise<void> {
    await this.eventBus.publish('shipping.shipment_created', {
      tenant_id: shipment.tenant_id,
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      order_id: shipment.order_id,
      carrier_code: shipment.carrier_code,
      service_type: shipment.service_type,
      shipping_cost: shipment.shipping_cost,
      timestamp: new Date().toISOString()
    });
  }

  async publishLabelGenerated(shipment: Shipment): Promise<void> {
    await this.eventBus.publish('shipping.label_generated', {
      tenant_id: shipment.tenant_id,
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      tracking_number: shipment.tracking_number,
      label_url: shipment.label_url,
      timestamp: new Date().toISOString()
    });
  }

  async publishShipmentInTransit(shipment: Shipment): Promise<void> {
    await this.eventBus.publish('shipping.shipment_in_transit', {
      tenant_id: shipment.tenant_id,
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      tracking_number: shipment.tracking_number,
      shipped_at: shipment.shipped_at?.toISOString(),
      estimated_delivery_date: shipment.estimated_delivery_date?.toISOString(),
      timestamp: new Date().toISOString()
    });
  }

  async publishShipmentDelivered(shipment: Shipment): Promise<void> {
    await this.eventBus.publish('shipping.shipment_delivered', {
      tenant_id: shipment.tenant_id,
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      tracking_number: shipment.tracking_number,
      order_id: shipment.order_id,
      delivered_at: shipment.delivered_at?.toISOString(),
      delivery_signature: shipment.delivery_signature,
      timestamp: new Date().toISOString()
    });
  }

  async publishShipmentCancelled(shipment: Shipment): Promise<void> {
    await this.eventBus.publish('shipping.shipment_cancelled', {
      tenant_id: shipment.tenant_id,
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      order_id: shipment.order_id,
      timestamp: new Date().toISOString()
    });
  }

  async publishShipmentException(shipment: Shipment, reason: string): Promise<void> {
    await this.eventBus.publish('shipping.shipment_exception', {
      tenant_id: shipment.tenant_id,
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      tracking_number: shipment.tracking_number,
      reason,
      timestamp: new Date().toISOString()
    });
  }
}
