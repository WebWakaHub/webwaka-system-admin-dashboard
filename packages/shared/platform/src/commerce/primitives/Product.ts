/**
 * Product Primitive
 * Represents a product with variants, pricing, and inventory
 */

import { Money } from './Money';

export interface IProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price?: Money;
  sku?: string;
}

export interface IProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: Money;
  variants: IProductVariant[];
  categories: string[];
  inventory: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private _id: string;
  private _sku: string;
  private _name: string;
  private _description: string;
  private _price: Money;
  private _variants: IProductVariant[] = [];
  private _categories: string[] = [];
  private _inventory: number = 0;
  private _images: string[] = [];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    sku: string,
    name: string,
    description: string,
    price: Money,
  ) {
    // Validate inputs
    if (!id || id.trim() === '') {
      throw new Error('Product ID is required');
    }

    if (!sku || sku.trim() === '') {
      throw new Error('Product SKU is required');
    }

    if (!name || name.trim() === '') {
      throw new Error('Product name is required');
    }

    if (!price) {
      throw new Error('Product price is required');
    }

    this._id = id;
    this._sku = sku;
    this._name = name;
    this._description = description;
    this._price = price;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get sku(): string {
    return this._sku;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): Money {
    return this._price;
  }

  get variants(): IProductVariant[] {
    return [...this._variants];
  }

  get categories(): string[] {
    return [...this._categories];
  }

  get inventory(): number {
    return this._inventory;
  }

  get images(): string[] {
    return [...this._images];
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Set product name
   */
  setName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Product name is required');
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  /**
   * Set product description
   */
  setDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  /**
   * Set product price
   */
  setPrice(price: Money): void {
    if (!price) {
      throw new Error('Price is required');
    }
    this._price = price;
    this._updatedAt = new Date();
  }

  /**
   * Add a variant
   */
  addVariant(variant: IProductVariant): void {
    if (!variant.id || variant.id.trim() === '') {
      throw new Error('Variant ID is required');
    }

    if (this._variants.some(v => v.id === variant.id)) {
      throw new Error(`Variant with ID ${variant.id} already exists`);
    }

    this._variants.push({ ...variant });
    this._updatedAt = new Date();
  }

  /**
   * Remove a variant
   */
  removeVariant(variantId: string): void {
    const index = this._variants.findIndex(v => v.id === variantId);
    if (index === -1) {
      throw new Error(`Variant with ID ${variantId} not found`);
    }

    this._variants.splice(index, 1);
    this._updatedAt = new Date();
  }

  /**
   * Get a variant by ID
   */
  getVariant(variantId: string): IProductVariant | undefined {
    return this._variants.find(v => v.id === variantId);
  }

  /**
   * Add to category
   */
  addCategory(category: string): void {
    if (!category || category.trim() === '') {
      throw new Error('Category is required');
    }

    if (!this._categories.includes(category)) {
      this._categories.push(category);
      this._updatedAt = new Date();
    }
  }

  /**
   * Remove from category
   */
  removeCategory(category: string): void {
    const index = this._categories.indexOf(category);
    if (index !== -1) {
      this._categories.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  /**
   * Set inventory quantity
   */
  setInventory(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('Inventory must be a non-negative integer');
    }
    this._inventory = quantity;
    this._updatedAt = new Date();
  }

  /**
   * Add inventory
   */
  addInventory(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('Quantity must be a non-negative integer');
    }
    this._inventory += quantity;
    this._updatedAt = new Date();
  }

  /**
   * Remove inventory
   */
  removeInventory(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('Quantity must be a non-negative integer');
    }

    if (this._inventory < quantity) {
      throw new Error(`Insufficient inventory: ${this._inventory} < ${quantity}`);
    }

    this._inventory -= quantity;
    this._updatedAt = new Date();
  }

  /**
   * Check availability
   */
  isAvailable(quantity: number = 1): boolean {
    return this._inventory >= quantity;
  }

  /**
   * Add image
   */
  addImage(imageUrl: string): void {
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error('Image URL is required');
    }

    if (!this._images.includes(imageUrl)) {
      this._images.push(imageUrl);
      this._updatedAt = new Date();
    }
  }

  /**
   * Remove image
   */
  removeImage(imageUrl: string): void {
    const index = this._images.indexOf(imageUrl);
    if (index !== -1) {
      this._images.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  /**
   * Get variant price (or product price if no variant price)
   */
  getVariantPrice(variantId: string): Money {
    const variant = this.getVariant(variantId);
    if (!variant) {
      throw new Error(`Variant with ID ${variantId} not found`);
    }
    return variant.price || this._price;
  }

  /**
   * Convert to JSON
   */
  toJSON(): IProduct {
    return {
      id: this._id,
      sku: this._sku,
      name: this._name,
      description: this._description,
      price: this._price,
      variants: this._variants,
      categories: this._categories,
      inventory: this._inventory,
      images: this._images,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
