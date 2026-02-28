/**
 * Order Controller
 * 
 * REST API endpoints for order management.
 * Handles HTTP requests, authentication, and response formatting.
 */

import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import {
  CreateOrderDTO,
  UpdateOrderDTO,
  ConfirmOrderDTO,
  CancelOrderDTO,
  ShipOrderDTO,
  DeliverOrderDTO,
  OrderFilterDTO,
  OrderStatus,
  PaymentStatus
} from '../types';

export class OrderController {
  constructor(private orderService: OrderService) {}

  /**
   * POST /api/v1/orders - Create order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id; // Extracted from JWT token
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const dto: CreateOrderDTO = {
        tenant_id,
        customer_id: req.body.customer_id,
        items: req.body.items,
        shipping_address: req.body.shipping_address,
        billing_address: req.body.billing_address,
        notes: req.body.notes,
        currency: req.body.currency
      };

      const order = await this.orderService.createOrder(dto);
      res.status(201).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/orders/:id - Get order by ID
   */
  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const order = await this.orderService.getOrder(id, tenant_id);

      if (!order) {
        res.status(404).json({ status: 'error', error: 'Order not found' });
        return;
      }

      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/orders - List orders with filters
   */
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const filters: OrderFilterDTO = {
        tenant_id,
        customer_id: req.query.customer_id as string,
        status: req.query.status as OrderStatus,
        payment_status: req.query.payment_status as PaymentStatus,
        from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
        to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await this.orderService.listOrders(filters);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * PUT /api/v1/orders/:id - Update order
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const dto: UpdateOrderDTO = {
        shipping_address: req.body.shipping_address,
        billing_address: req.body.billing_address,
        notes: req.body.notes
      };

      const order = await this.orderService.updateOrder(id, tenant_id, dto);

      if (!order) {
        res.status(404).json({ status: 'error', error: 'Order not found' });
        return;
      }

      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/orders/:id/confirm - Confirm order
   */
  async confirmOrder(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const dto: ConfirmOrderDTO = {
        payment_method: req.body.payment_method,
        payment_reference: req.body.payment_reference
      };

      const order = await this.orderService.confirmOrder(id, tenant_id, dto);
      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/orders/:id/cancel - Cancel order
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const dto: CancelOrderDTO = {
        reason: req.body.reason,
        refund_amount: req.body.refund_amount
      };

      const order = await this.orderService.cancelOrder(id, tenant_id, dto);
      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/orders/:id/ship - Mark order as shipped
   */
  async shipOrder(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const dto: ShipOrderDTO = {
        carrier_code: req.body.carrier_code,
        tracking_number: req.body.tracking_number,
        shipment_date: new Date(req.body.shipment_date)
      };

      const order = await this.orderService.shipOrder(id, tenant_id, dto);
      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/orders/:id/deliver - Mark order as delivered
   */
  async deliverOrder(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const dto: DeliverOrderDTO = {
        delivery_date: new Date(req.body.delivery_date),
        delivered_to: req.body.delivered_to,
        signature: req.body.signature,
        photo_url: req.body.photo_url
      };

      const order = await this.orderService.deliverOrder(id, tenant_id, dto);
      res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/orders/statistics - Get order statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const from_date = req.query.from_date ? new Date(req.query.from_date as string) : undefined;
      const to_date = req.query.to_date ? new Date(req.query.to_date as string) : undefined;

      const stats = await this.orderService.getStatistics(tenant_id, from_date, to_date);
      res.status(200).json({ status: 'success', data: stats });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }
}
