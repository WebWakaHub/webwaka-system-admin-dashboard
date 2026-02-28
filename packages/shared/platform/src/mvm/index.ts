/**
 * MVM (Multi-Vendor Management) Module
 * Complete multi-vendor marketplace implementation
 */

export * from './models';
export * from './services';
export * from './api';
export * from './events';

import { VendorService, ProductService, OrderService, CommissionService, PayoutService } from './services';
import { createMVMRouter } from './api';
import { createMVMEventHandler } from './events';

/**
 * MVM Module Factory
 * Creates and initializes all MVM services
 */
export class MVMModule {
  public vendorService: VendorService;
  public productService: ProductService;
  public orderService: OrderService;
  public commissionService: CommissionService;
  public payoutService: PayoutService;

  constructor() {
    this.vendorService = new VendorService();
    this.productService = new ProductService();
    this.orderService = new OrderService();
    this.commissionService = new CommissionService();
    this.payoutService = new PayoutService();
  }

  /**
   * Get the API router for Express
   */
  getRouter() {
    return createMVMRouter(
      this.vendorService,
      this.productService,
      this.orderService,
      this.commissionService,
      this.payoutService
    );
  }

  /**
   * Get the event handler
   */
  getEventHandler(commissionRate?: number) {
    return createMVMEventHandler(
      this.orderService,
      this.commissionService,
      this.payoutService,
      commissionRate
    );
  }
}

export default MVMModule;
