/**
 * MVM Service
 * Manages MVM accounts, products, and inventory
 */

import { MVMAccountModel } from '../models/MVMAccount';
import { SVMProductModel } from '../models/Product';
import { InventoryModel } from '../models/Inventory';
import { Money } from '../../commerce/primitives/Money';

export class MVMService {
  private accounts: Map<string, MVMAccountModel> = new Map();
  private products: Map<string, SVMProductModel> = new Map();
  private inventory: Map<string, InventoryModel> = new Map();

  /**
   * Create a new MVM account
   */
  createAccount(
    accountId: string,
    businessName: string,
    email: string,
    passwordHash: string,
    currency: string = 'NGN',
    language: string = 'en'
  ): MVMAccountModel {
    // Validate inputs
    if (!accountId || accountId.trim().length === 0) {
      throw new Error('Account ID is required');
    }
    if (!businessName || businessName.trim().length === 0) {
      throw new Error('Business name is required');
    }
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }
    if (!passwordHash || passwordHash.trim().length === 0) {
      throw new Error('Password hash is required');
    }
    if (this.accounts.has(accountId)) {
      throw new Error(`Account ${accountId} already exists`);
    }

    const account = new MVMAccountModel(
      accountId,
      businessName,
      email,
      passwordHash,
      currency,
      language
    );
    this.accounts.set(accountId, account);
    return account;
  }

  /**
   * Get MVM account by ID
   */
  getAccount(accountId: string): MVMAccountModel {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }
    return account;
  }

  /**
   * Update MVM account
   */
  updateAccount(
    accountId: string,
    businessName: string,
    email: string
  ): MVMAccountModel {
    const account = this.getAccount(accountId);
    account.updateProfile(businessName, email);
    return account;
  }

  /**
   * Add a product
   */
  addProduct(
    productId: string,
    accountId: string,
    name: string,
    description: string,
    price: Money,
    images: string[] = []
  ): SVMProductModel {
    // Validate inputs
    if (!productId || productId.trim().length === 0) {
      throw new Error('Product ID is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Product name is required');
    }
    if (price.amount <= 0) {
      throw new Error('Product price must be greater than 0');
    }
    if (this.products.has(productId)) {
      throw new Error(`Product ${productId} already exists`);
    }

    // Verify account exists
    this.getAccount(accountId);

    const product = new SVMProductModel(
      productId,
      accountId,
      name,
      description,
      price,
      images
    );
    this.products.set(productId, product);
    return product;
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): SVMProductModel {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    return product;
  }

  /**
   * Get all products for an account
   */
  getProductsByAccount(accountId: string): SVMProductModel[] {
    // Verify account exists
    this.getAccount(accountId);

    const products: SVMProductModel[] = [];
    for (const product of this.products.values()) {
      if (product.accountId === accountId) {
        products.push(product);
      }
    }
    return products;
  }

  /**
   * Update product
   */
  updateProduct(
    productId: string,
    name: string,
    description: string,
    price: Money
  ): SVMProductModel {
    const product = this.getProduct(productId);
    product.updateDetails(name, description, price);
    return product;
  }

  /**
   * Delete product
   */
  deleteProduct(productId: string): void {
    if (!this.products.has(productId)) {
      throw new Error(`Product ${productId} not found`);
    }
    this.products.delete(productId);
    // Also delete inventory
    const inventoryToDelete: string[] = [];
    for (const [id, inv] of this.inventory.entries()) {
      if (inv.productId === productId) {
        inventoryToDelete.push(id);
      }
    }
    inventoryToDelete.forEach((id) => this.inventory.delete(id));
  }

  /**
   * Set inventory level
   */
  setInventory(
    inventoryId: string,
    productId: string,
    stockLevel: number
  ): InventoryModel {
    // Validate inputs
    if (!inventoryId || inventoryId.trim().length === 0) {
      throw new Error('Inventory ID is required');
    }
    if (stockLevel < 0) {
      throw new Error('Stock level cannot be negative');
    }
    // Verify product exists
    this.getProduct(productId);

    let inventory = this.inventory.get(inventoryId);
    if (!inventory) {
      inventory = new InventoryModel(inventoryId, productId, stockLevel);
      this.inventory.set(inventoryId, inventory);
    } else {
      inventory.setStockLevel(stockLevel);
    }
    return inventory;
  }

  /**
   * Get inventory by product ID
   */
  getInventoryByProduct(productId: string): InventoryModel | undefined {
    for (const inventory of this.inventory.values()) {
      if (inventory.productId === productId) {
        return inventory;
      }
    }
    return undefined;
  }

  /**
   * Get all inventory for an account
   */
  getInventoryByAccount(accountId: string): InventoryModel[] {
    // Verify account exists
    this.getAccount(accountId);

    const inventories: InventoryModel[] = [];
    const accountProducts = this.getProductsByAccount(accountId);
    const productIds = new Set(accountProducts.map((p) => p.productId));

    for (const inventory of this.inventory.values()) {
      if (productIds.has(inventory.productId)) {
        inventories.push(inventory);
      }
    }
    return inventories;
  }

  /**
   * Adjust stock level
   */
  adjustStock(productId: string, quantity: number): InventoryModel {
    // Validate inputs
    if (!productId || productId.trim().length === 0) {
      throw new Error('Product ID is required');
    }
    const inventory = this.getInventoryByProduct(productId);
    if (!inventory) {
      throw new Error(`No inventory found for product ${productId}`);
    }
    if (inventory.stockLevel + quantity < 0) {
      throw new Error('Insufficient stock for requested adjustment');
    }
    inventory.adjustStock(quantity);
    return inventory;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
