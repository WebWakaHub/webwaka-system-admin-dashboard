/**
 * Inventory Primitive
 * Manages product stock across locations
 */

export interface IInventoryLocation {
  id: string;
  name: string;
  quantity: number;
  reserved: number;
}

export interface IInventoryEvent {
  id: string;
  type: 'add' | 'remove' | 'reserve' | 'release' | 'adjust';
  quantity: number;
  reason?: string;
  timestamp: Date;
}

export interface IInventory {
  id: string;
  productId: string;
  totalQuantity: number;
  totalReserved: number;
  locations: IInventoryLocation[];
  events: IInventoryEvent[];
  lastUpdated: Date;
}

export class Inventory {
  private _id: string;
  private _productId: string;
  private _locations: Map<string, IInventoryLocation> = new Map();
  private _events: IInventoryEvent[] = [];
  private _lastUpdated: Date;

  constructor(id: string, productId: string) {
    if (!id || id.trim() === '') {
      throw new Error('Inventory ID is required');
    }

    if (!productId || productId.trim() === '') {
      throw new Error('Product ID is required');
    }

    this._id = id;
    this._productId = productId;
    this._lastUpdated = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get totalQuantity(): number {
    let total = 0;
    this._locations.forEach(loc => {
      total += loc.quantity;
    });
    return total;
  }

  get totalReserved(): number {
    let total = 0;
    this._locations.forEach(loc => {
      total += loc.reserved;
    });
    return total;
  }

  get totalAvailable(): number {
    return this.totalQuantity - this.totalReserved;
  }

  get locations(): IInventoryLocation[] {
    return Array.from(this._locations.values());
  }

  get events(): IInventoryEvent[] {
    return [...this._events];
  }

  get lastUpdated(): Date {
    return new Date(this._lastUpdated);
  }

  /**
   * Add location
   */
  addLocation(locationId: string, locationName: string): void {
    if (!locationId || locationId.trim() === '') {
      throw new Error('Location ID is required');
    }

    if (this._locations.has(locationId)) {
      throw new Error(`Location ${locationId} already exists`);
    }

    this._locations.set(locationId, {
      id: locationId,
      name: locationName,
      quantity: 0,
      reserved: 0,
    });

    this._lastUpdated = new Date();
  }

  /**
   * Add inventory to location
   */
  addInventory(locationId: string, quantity: number, reason?: string): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    const location = this._locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    location.quantity += quantity;
    this._recordEvent('add', quantity, reason);
    this._lastUpdated = new Date();
  }

  /**
   * Remove inventory from location
   */
  removeInventory(locationId: string, quantity: number, reason?: string): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    const location = this._locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    if (location.quantity < quantity) {
      throw new Error(`Insufficient inventory at location ${locationId}: ${location.quantity} < ${quantity}`);
    }

    location.quantity -= quantity;
    this._recordEvent('remove', quantity, reason);
    this._lastUpdated = new Date();
  }

  /**
   * Reserve inventory
   */
  reserve(locationId: string, quantity: number, reason?: string): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    const location = this._locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    const available = location.quantity - location.reserved;
    if (available < quantity) {
      throw new Error(`Insufficient available inventory at location ${locationId}: ${available} < ${quantity}`);
    }

    location.reserved += quantity;
    this._recordEvent('reserve', quantity, reason);
    this._lastUpdated = new Date();
  }

  /**
   * Release reserved inventory
   */
  release(locationId: string, quantity: number, reason?: string): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    const location = this._locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    if (location.reserved < quantity) {
      throw new Error(`Insufficient reserved inventory at location ${locationId}: ${location.reserved} < ${quantity}`);
    }

    location.reserved -= quantity;
    this._recordEvent('release', quantity, reason);
    this._lastUpdated = new Date();
  }

  /**
   * Check availability
   */
  isAvailable(quantity: number = 1): boolean {
    return this.totalAvailable >= quantity;
  }

  /**
   * Check availability at location
   */
  isAvailableAtLocation(locationId: string, quantity: number = 1): boolean {
    const location = this._locations.get(locationId);
    if (!location) {
      return false;
    }

    const available = location.quantity - location.reserved;
    return available >= quantity;
  }

  /**
   * Get location inventory
   */
  getLocationInventory(locationId: string): IInventoryLocation | undefined {
    return this._locations.get(locationId);
  }

  /**
   * Find best location for inventory
   */
  findBestLocation(quantity: number): IInventoryLocation | undefined {
    let bestLocation: IInventoryLocation | undefined;
    let maxAvailable = 0;

    this._locations.forEach(location => {
      const available = location.quantity - location.reserved;
      if (available >= quantity && available > maxAvailable) {
        bestLocation = location;
        maxAvailable = available;
      }
    });

    return bestLocation;
  }

  /**
   * Adjust inventory (for corrections)
   */
  adjustInventory(locationId: string, adjustment: number, reason?: string): void {
    if (!Number.isInteger(adjustment)) {
      throw new Error('Adjustment must be an integer');
    }

    const location = this._locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    const newQuantity = location.quantity + adjustment;
    if (newQuantity < 0) {
      throw new Error(`Adjustment would result in negative inventory: ${location.quantity} + ${adjustment}`);
    }

    location.quantity = newQuantity;
    this._recordEvent('adjust', Math.abs(adjustment), reason || `Adjustment: ${adjustment}`);
    this._lastUpdated = new Date();
  }

  /**
   * Record event
   */
  private _recordEvent(type: 'add' | 'remove' | 'reserve' | 'release' | 'adjust', quantity: number, reason?: string): void {
    this._events.push({
      id: `${this._id}-${Date.now()}`,
      type,
      quantity,
      reason,
      timestamp: new Date(),
    });

    // Keep only last 1000 events
    if (this._events.length > 1000) {
      this._events = this._events.slice(-1000);
    }
  }

  /**
   * Get event history
   */
  getEventHistory(limit: number = 100): IInventoryEvent[] {
    return this._events.slice(-limit);
  }

  /**
   * Convert to JSON
   */
  toJSON(): IInventory {
    return {
      id: this._id,
      productId: this._productId,
      totalQuantity: this.totalQuantity,
      totalReserved: this.totalReserved,
      locations: this.locations,
      events: this._events,
      lastUpdated: this._lastUpdated,
    };
  }
}
