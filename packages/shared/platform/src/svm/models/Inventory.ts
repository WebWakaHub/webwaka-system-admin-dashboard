/**
 * Inventory Model
 * Represents inventory levels for a product
 */

export interface InventoryItem {
  readonly inventoryId: string;
  readonly productId: string;
  stockLevel: number;
  updatedAt: Date;
}

export class InventoryModel implements InventoryItem {
  readonly inventoryId: string;
  readonly productId: string;
  stockLevel: number;
  updatedAt: Date;

  constructor(inventoryId: string, productId: string, stockLevel: number) {
    this.inventoryId = inventoryId;
    this.productId = productId;
    this.stockLevel = stockLevel;
    this.updatedAt = new Date();
  }

  setStockLevel(stockLevel: number): void {
    if (stockLevel < 0) {
      throw new Error('Stock level cannot be negative');
    }
    this.stockLevel = stockLevel;
    this.updatedAt = new Date();
  }

  adjustStock(quantity: number): void {
    const newLevel = this.stockLevel + quantity;
    if (newLevel < 0) {
      throw new Error('Insufficient stock');
    }
    this.stockLevel = newLevel;
    this.updatedAt = new Date();
  }

  decreaseStock(quantity: number): void {
    this.adjustStock(-quantity);
  }

  increaseStock(quantity: number): void {
    this.adjustStock(quantity);
  }

  toJSON(): Record<string, unknown> {
    return {
      inventoryId: this.inventoryId,
      productId: this.productId,
      stockLevel: this.stockLevel,
      updatedAt: this.updatedAt,
    };
  }
}
