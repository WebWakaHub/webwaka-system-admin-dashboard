/**
 * Shipment Primitive
 * Represents a shipment with tracking and status
 */

export enum ShipmentStatus {
  PENDING = 'pending',
  PICKED = 'picked',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
}

export interface IShipmentEvent {
  id: string;
  status: ShipmentStatus;
  location?: string;
  timestamp: Date;
  notes?: string;
}

export interface IShipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber?: string;
  status: ShipmentStatus;
  events: IShipmentEvent[];
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Shipment {
  private _id: string;
  private _orderId: string;
  private _carrier: string;
  private _trackingNumber?: string;
  private _status: ShipmentStatus = ShipmentStatus.PENDING;
  private _events: IShipmentEvent[] = [];
  private _estimatedDelivery?: Date;
  private _actualDelivery?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: string, orderId: string, carrier: string) {
    if (!id || id.trim() === '') {
      throw new Error('Shipment ID is required');
    }

    if (!orderId || orderId.trim() === '') {
      throw new Error('Order ID is required');
    }

    if (!carrier || carrier.trim() === '') {
      throw new Error('Carrier is required');
    }

    this._id = id;
    this._orderId = orderId;
    this._carrier = carrier;
    this._createdAt = new Date();
    this._updatedAt = new Date();

    // Record initial event
    this._recordEvent(ShipmentStatus.PENDING, undefined, 'Shipment created');
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get orderId(): string {
    return this._orderId;
  }

  get carrier(): string {
    return this._carrier;
  }

  get trackingNumber(): string | undefined {
    return this._trackingNumber;
  }

  get status(): ShipmentStatus {
    return this._status;
  }

  get events(): IShipmentEvent[] {
    return [...this._events];
  }

  get estimatedDelivery(): Date | undefined {
    return this._estimatedDelivery ? new Date(this._estimatedDelivery) : undefined;
  }

  get actualDelivery(): Date | undefined {
    return this._actualDelivery ? new Date(this._actualDelivery) : undefined;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Set tracking number
   */
  setTrackingNumber(trackingNumber: string): void {
    if (!trackingNumber || trackingNumber.trim() === '') {
      throw new Error('Tracking number is required');
    }

    this._trackingNumber = trackingNumber;
    this._updatedAt = new Date();
  }

  /**
   * Set estimated delivery date
   */
  setEstimatedDelivery(date: Date): void {
    if (!date || !(date instanceof Date)) {
      throw new Error('Valid date is required');
    }

    this._estimatedDelivery = date;
    this._updatedAt = new Date();
  }

  /**
   * Mark as picked
   */
  markPicked(location?: string, notes?: string): void {
    if (this._status !== ShipmentStatus.PENDING) {
      throw new Error(`Cannot mark picked from status ${this._status}`);
    }

    this._status = ShipmentStatus.PICKED;
    this._recordEvent(ShipmentStatus.PICKED, location, notes);
    this._updatedAt = new Date();
  }

  /**
   * Mark as packed
   */
  markPacked(location?: string, notes?: string): void {
    if (![ShipmentStatus.PENDING, ShipmentStatus.PICKED].includes(this._status)) {
      throw new Error(`Cannot mark packed from status ${this._status}`);
    }

    this._status = ShipmentStatus.PACKED;
    this._recordEvent(ShipmentStatus.PACKED, location, notes);
    this._updatedAt = new Date();
  }

  /**
   * Mark as shipped
   */
  markShipped(location?: string, notes?: string): void {
    if (![ShipmentStatus.PENDING, ShipmentStatus.PICKED, ShipmentStatus.PACKED].includes(this._status)) {
      throw new Error(`Cannot mark shipped from status ${this._status}`);
    }

    this._status = ShipmentStatus.SHIPPED;
    this._recordEvent(ShipmentStatus.SHIPPED, location, notes);
    this._updatedAt = new Date();
  }

  /**
   * Mark as in transit
   */
  markInTransit(location?: string, notes?: string): void {
    if (![ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT].includes(this._status)) {
      throw new Error(`Cannot mark in transit from status ${this._status}`);
    }

    this._status = ShipmentStatus.IN_TRANSIT;
    this._recordEvent(ShipmentStatus.IN_TRANSIT, location, notes);
    this._updatedAt = new Date();
  }

  /**
   * Mark as out for delivery
   */
  markOutForDelivery(location?: string, notes?: string): void {
    if (![ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY].includes(this._status)) {
      throw new Error(`Cannot mark out for delivery from status ${this._status}`);
    }

    this._status = ShipmentStatus.OUT_FOR_DELIVERY;
    this._recordEvent(ShipmentStatus.OUT_FOR_DELIVERY, location, notes);
    this._updatedAt = new Date();
  }

  /**
   * Mark as delivered
   */
  markDelivered(location?: string, notes?: string): void {
    if (![ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.IN_TRANSIT].includes(this._status)) {
      throw new Error(`Cannot mark delivered from status ${this._status}`);
    }

    this._status = ShipmentStatus.DELIVERED;
    this._actualDelivery = new Date();
    this._recordEvent(ShipmentStatus.DELIVERED, location, notes);
    this._updatedAt = new Date();
  }

  /**
   * Mark as failed
   */
  markFailed(reason?: string): void {
    if ([ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED].includes(this._status)) {
      throw new Error(`Cannot mark failed from status ${this._status}`);
    }

    this._status = ShipmentStatus.FAILED;
    this._recordEvent(ShipmentStatus.FAILED, undefined, reason);
    this._updatedAt = new Date();
  }

  /**
   * Mark as returned
   */
  markReturned(reason?: string): void {
    if (this._status !== ShipmentStatus.DELIVERED) {
      throw new Error(`Cannot mark returned from status ${this._status}`);
    }

    this._status = ShipmentStatus.RETURNED;
    this._recordEvent(ShipmentStatus.RETURNED, undefined, reason);
    this._updatedAt = new Date();
  }

  /**
   * Check if delivered
   */
  isDelivered(): boolean {
    return this._status === ShipmentStatus.DELIVERED;
  }

  /**
   * Check if failed
   */
  isFailed(): boolean {
    return this._status === ShipmentStatus.FAILED;
  }

  /**
   * Get current location from latest event
   */
  getCurrentLocation(): string | undefined {
    if (this._events.length === 0) {
      return undefined;
    }

    return this._events[this._events.length - 1].location;
  }

  /**
   * Record event
   */
  private _recordEvent(status: ShipmentStatus, location?: string, notes?: string): void {
    this._events.push({
      id: `${this._id}-${Date.now()}`,
      status,
      location,
      timestamp: new Date(),
      notes,
    });
  }

  /**
   * Get event timeline
   */
  getTimeline(limit: number = 50): IShipmentEvent[] {
    return this._events.slice(-limit);
  }

  /**
   * Convert to JSON
   */
  toJSON(): IShipment {
    return {
      id: this._id,
      orderId: this._orderId,
      carrier: this._carrier,
      trackingNumber: this._trackingNumber,
      status: this._status,
      events: this._events,
      estimatedDelivery: this._estimatedDelivery,
      actualDelivery: this._actualDelivery,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
