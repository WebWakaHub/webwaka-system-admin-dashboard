/**
 * EventPublisher
 * 
 * Publishes warehouse lifecycle events to the event bus.
 */

import { Warehouse, PickingList } from '../models';

export interface EventBus {
  publish(eventName: string, payload: any): Promise<void>;
}

export class EventPublisher {
  constructor(private eventBus: EventBus) {}

  async publishWarehouseCreated(warehouse: Warehouse): Promise<void> {
    await this.eventBus.publish('warehouse.created', {
      tenant_id: warehouse.tenant_id,
      warehouse_id: warehouse.id,
      warehouse_code: warehouse.code,
      warehouse_name: warehouse.name,
      timestamp: new Date().toISOString()
    });
  }

  async publishPickingListCreated(pickingList: PickingList): Promise<void> {
    await this.eventBus.publish('warehouse.picking_list_created', {
      tenant_id: pickingList.tenant_id,
      picking_list_id: pickingList.id,
      picking_list_number: pickingList.picking_list_number,
      warehouse_id: pickingList.warehouse_id,
      order_ids: pickingList.order_ids,
      picking_type: pickingList.picking_type,
      priority: pickingList.priority,
      timestamp: new Date().toISOString()
    });
  }

  async publishPickingStarted(pickingList: PickingList): Promise<void> {
    await this.eventBus.publish('warehouse.picking_started', {
      tenant_id: pickingList.tenant_id,
      picking_list_id: pickingList.id,
      picking_list_number: pickingList.picking_list_number,
      warehouse_id: pickingList.warehouse_id,
      assigned_to: pickingList.assigned_to,
      started_at: pickingList.started_at?.toISOString(),
      timestamp: new Date().toISOString()
    });
  }

  async publishPickingCompleted(pickingList: PickingList): Promise<void> {
    await this.eventBus.publish('warehouse.picking_completed', {
      tenant_id: pickingList.tenant_id,
      picking_list_id: pickingList.id,
      picking_list_number: pickingList.picking_list_number,
      warehouse_id: pickingList.warehouse_id,
      order_ids: pickingList.order_ids,
      completed_at: pickingList.completed_at?.toISOString(),
      timestamp: new Date().toISOString()
    });
  }

  async publishPackingCompleted(packing_list_id: string, order_id: string, tenant_id: string): Promise<void> {
    await this.eventBus.publish('warehouse.packing_completed', {
      tenant_id,
      packing_list_id,
      order_id,
      timestamp: new Date().toISOString()
    });
  }
}
