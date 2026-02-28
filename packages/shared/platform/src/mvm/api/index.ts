/**
 * MVM API Endpoints
 * REST API for multi-vendor management
 */

import { Router, Request, Response } from 'express';
import { VendorService, ProductService, OrderService, CommissionService, PayoutService } from '../services';
import { createVendor, createProduct, createOrder, createOrderItem } from '../models';

export const createMVMRouter = (
  vendorService: VendorService,
  productService: ProductService,
  orderService: OrderService,
  commissionService: CommissionService,
  payoutService: PayoutService
): Router => {
  const router = Router();

  /**
   * Vendor Endpoints
   */

  // POST /api/v1/mvm/vendors - Register a new vendor
  router.post('/vendors', (req: Request, res: Response) => {
    try {
      const { email, store_name, business_name, business_address, payment_method, payment_details } = req.body;
      
      // Input validation
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      if (!store_name || typeof store_name !== 'string' || store_name.trim().length === 0) {
        return res.status(400).json({ error: 'Store name is required' });
      }
      if (!business_name || typeof business_name !== 'string' || business_name.trim().length === 0) {
        return res.status(400).json({ error: 'Business name is required' });
      }
      if (!business_address || typeof business_address !== 'string' || business_address.trim().length === 0) {
        return res.status(400).json({ error: 'Business address is required' });
      }
      if (!payment_method || typeof payment_method !== 'string' || payment_method.trim().length === 0) {
        return res.status(400).json({ error: 'Payment method is required' });
      }
      
      const vendor = createVendor({
        email,
        store_name,
        business_name,
        business_address,
        payment_method,
        payment_details,
        status: 'pending',
      });
      const registered = vendorService.registerVendor(vendor);
      res.status(201).json(registered);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/v1/mvm/vendors/:vendorId - Get vendor details
  router.get('/vendors/:vendorId', (req: Request, res: Response) => {
    try {
      const vendor = vendorService.getVendor(req.params.vendorId);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/v1/mvm/vendors/:vendorId - Update vendor profile
  router.put('/vendors/:vendorId', (req: Request, res: Response) => {
    try {
      const updated = vendorService.updateVendor(req.params.vendorId, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/v1/mvm/vendors/:vendorId/approve - Approve vendor
  router.post('/vendors/:vendorId/approve', (req: Request, res: Response) => {
    try {
      const approved = vendorService.approveVendor(req.params.vendorId);
      res.json(approved);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Product Endpoints
   */

  // POST /api/v1/mvm/products - Create a new product
  router.post('/products', (req: Request, res: Response) => {
    try {
      const { vendor_id, name, description, price, currency, inventory_count, images } = req.body;
      
      // Input validation
      if (!vendor_id || typeof vendor_id !== 'string' || vendor_id.trim().length === 0) {
        return res.status(400).json({ error: 'Vendor ID is required' });
      }
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      if (typeof inventory_count !== 'number' || inventory_count < 0) {
        return res.status(400).json({ error: 'Inventory count must be a non-negative number' });
      }
      
      const product = createProduct({
        vendor_id,
        name,
        description,
        price,
        currency,
        inventory_count,
        images: images || [],
        status: 'active',
      });
      const created = productService.createProduct(product);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/v1/mvm/products/:productId - Get product details
  router.get('/products/:productId', (req: Request, res: Response) => {
    try {
      const product = productService.getProduct(req.params.productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/v1/mvm/vendors/:vendorId/products - Get vendor's products
  router.get('/vendors/:vendorId/products', (req: Request, res: Response) => {
    try {
      const products = productService.getVendorProducts(req.params.vendorId);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/v1/mvm/products/:productId - Update product
  router.put('/products/:productId', (req: Request, res: Response) => {
    try {
      const updated = productService.updateProduct(req.params.productId, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/v1/mvm/products/:productId - Delete product
  router.delete('/products/:productId', (req: Request, res: Response) => {
    try {
      productService.deleteProduct(req.params.productId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Order Endpoints
   */

  // GET /api/v1/mvm/vendors/:vendorId/orders - Get vendor's orders
  router.get('/vendors/:vendorId/orders', (req: Request, res: Response) => {
    try {
      const orderItems = orderService.getVendorOrderItems(req.params.vendorId);
      res.json(orderItems);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/v1/mvm/order-items/:orderItemId/status - Update order item status
  router.put('/order-items/:orderItemId/status', (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const updated = orderService.updateOrderItemStatus(req.params.orderItemId, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Commission Endpoints
   */

  // GET /api/v1/mvm/vendors/:vendorId/commissions - Get vendor's commissions
  router.get('/vendors/:vendorId/commissions', (req: Request, res: Response) => {
    try {
      const commissions = commissionService.getVendorCommissions(req.params.vendorId);
      const total = commissionService.getTotalCommissionForVendor(req.params.vendorId);
      res.json({ commissions, total });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Payout Endpoints
   */

  // GET /api/v1/mvm/vendors/:vendorId/payouts - Get vendor's payout history
  router.get('/vendors/:vendorId/payouts', (req: Request, res: Response) => {
    try {
      const payouts = payoutService.getVendorPayoutHistory(req.params.vendorId);
      res.json(payouts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/v1/mvm/payouts/pending - Get all pending payouts (admin only)
  router.get('/payouts/pending', (req: Request, res: Response) => {
    try {
      const pending = payoutService.getPendingPayouts();
      res.json(pending);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/v1/mvm/payouts/:payoutId/mark-paid - Mark payout as paid (admin only)
  router.post('/payouts/:payoutId/mark-paid', (req: Request, res: Response) => {
    try {
      const marked = payoutService.markPayoutAsPaid(req.params.payoutId);
      res.json(marked);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};
