/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — RequestRouter
 * Routes requests to the correct vendor adapter by serviceId
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #509 (P3-T02)
 */

import { IRequestRouterPort, IVendorAdapter } from '../ports';
import { ServiceNotFoundError } from '../errors';

export class RequestRouter implements IRequestRouterPort {
  private readonly vendors = new Map<string, IVendorAdapter>();
  private readonly serviceToVendor = new Map<string, string>();

  resolve(serviceId: string, _operation: string): IVendorAdapter {
    const vendorId = this.serviceToVendor.get(serviceId);
    if (!vendorId) {
      throw new ServiceNotFoundError(serviceId);
    }

    const adapter = this.vendors.get(vendorId);
    if (!adapter) {
      throw new ServiceNotFoundError(serviceId);
    }

    return adapter;
  }

  registerVendor(adapter: IVendorAdapter): void {
    this.vendors.set(adapter.vendorId, adapter);
  }

  registerServiceMapping(serviceId: string, vendorId: string): void {
    if (!this.vendors.has(vendorId)) {
      throw new Error(`Cannot map service '${serviceId}' to unregistered vendor '${vendorId}'`);
    }
    this.serviceToVendor.set(serviceId, vendorId);
  }

  removeVendor(vendorId: string): void {
    this.vendors.delete(vendorId);
    for (const [serviceId, vid] of this.serviceToVendor.entries()) {
      if (vid === vendorId) {
        this.serviceToVendor.delete(serviceId);
      }
    }
  }

  listVendors(): string[] {
    return Array.from(this.vendors.keys());
  }

  listServices(): string[] {
    return Array.from(this.serviceToVendor.keys());
  }

  getVendorForService(serviceId: string): string | undefined {
    return this.serviceToVendor.get(serviceId);
  }
}
