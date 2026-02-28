/**
 * SVM API Routes
 * Defines REST API endpoints for SVM module
 */

import { MVMService } from '../services/MVMService';
import { InventorySyncService } from '../services/InventorySyncService';
import { Money } from '../../commerce/primitives/Money';

export class SVMRoutes {
  private mvmService: MVMService;
  private syncService: InventorySyncService;

  constructor(mvmService: MVMService, syncService: InventorySyncService) {
    this.mvmService = mvmService;
    this.syncService = syncService;
  }

  /**
   * POST /api/v1/mvm/accounts - Create MVM account
   */
  createAccount(
    accountId: string,
    businessName: string,
    email: string,
    passwordHash: string,
    currency: string = 'NGN',
    language: string = 'en'
  ): Record<string, unknown> {
    const account = this.mvmService.createAccount(
      accountId,
      businessName,
      email,
      passwordHash,
      currency,
      language
    );
    return { success: true, data: account.toJSON() };
  }

  /**
   * GET /api/v1/mvm/accounts/:accountId - Get MVM account
   */
  getAccount(accountId: string): Record<string, unknown> {
    const account = this.mvmService.getAccount(accountId);
    return { success: true, data: account.toJSON() };
  }

  /**
   * PUT /api/v1/mvm/accounts/:accountId - Update MVM account
   */
  updateAccount(
    accountId: string,
    businessName: string,
    email: string
  ): Record<string, unknown> {
    const account = this.mvmService.updateAccount(
      accountId,
      businessName,
      email
    );
    return { success: true, data: account.toJSON() };
  }

  /**
   * POST /api/v1/mvm/products - Add product
   */
  addProduct(
    productId: string,
    accountId: string,
    name: string,
    description: string,
    price: Money,
    images: string[] = []
  ): Record<string, unknown> {
    const product = this.mvmService.addProduct(
      productId,
      accountId,
      name,
      description,
      price,
      images
    );
    return { success: true, data: product.toJSON() };
  }

  /**
   * GET /api/v1/mvm/products - Get all products
   */
  getProducts(accountId: string): Record<string, unknown> {
    const products = this.mvmService.getProductsByAccount(accountId);
    return {
      success: true,
      data: products.map((p) => p.toJSON()),
    };
  }

  /**
   * GET /api/v1/mvm/products/:productId - Get product by ID
   */
  getProduct(productId: string): Record<string, unknown> {
    const product = this.mvmService.getProduct(productId);
    return { success: true, data: product.toJSON() };
  }

  /**
   * PUT /api/v1/mvm/products/:productId - Update product
   */
  updateProduct(
    productId: string,
    name: string,
    description: string,
    price: Money
  ): Record<string, unknown> {
    const product = this.mvmService.updateProduct(
      productId,
      name,
      description,
      price
    );
    return { success: true, data: product.toJSON() };
  }

  /**
   * DELETE /api/v1/mvm/products/:productId - Delete product
   */
  deleteProduct(productId: string): Record<string, unknown> {
    this.mvmService.deleteProduct(productId);
    return { success: true, message: 'Product deleted' };
  }

  /**
   * POST /api/v1/mvm/inventory - Set inventory level
   */
  setInventory(
    inventoryId: string,
    productId: string,
    stockLevel: number
  ): Record<string, unknown> {
    const inventory = this.mvmService.setInventory(
      inventoryId,
      productId,
      stockLevel
    );
    return { success: true, data: inventory.toJSON() };
  }

  /**
   * GET /api/v1/mvm/inventory - Get all inventory
   */
  getInventory(accountId: string): Record<string, unknown> {
    const inventory = this.mvmService.getInventoryByAccount(accountId);
    return {
      success: true,
      data: inventory.map((i) => i.toJSON()),
    };
  }

  /**
   * POST /api/v1/inventory/sync - Trigger manual inventory sync
   */
  async triggerSync(): Promise<Record<string, unknown>> {
    await this.syncService.triggerManualSync();
    const status = this.syncService.getSyncStatus();
    return { success: true, data: status };
  }
}
