/**
 * ShippingController
 * 
 * REST API endpoints for shipping management.
 */

import { Request, Response } from 'express';
import { ShippingService } from '../services/ShippingService';
import { CreateShipmentDTO, RateQuoteRequest } from '../types';

export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  /**
   * POST /api/v1/shipments - Create shipment
   */
  async createShipment(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const dto: CreateShipmentDTO = { tenant_id, ...req.body };
      const shipment = await this.shippingService.createShipment(dto);
      res.status(201).json({ status: 'success', data: shipment });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/shipments/:id - Get shipment
   */
  async getShipment(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const shipment = await this.shippingService.getShipment(id, tenant_id);

      if (!shipment) {
        res.status(404).json({ status: 'error', error: 'Shipment not found' });
        return;
      }

      res.status(200).json({ status: 'success', data: shipment });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/shipments - List shipments
   */
  async listShipments(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const filters = {
        tenant_id,
        status: req.query.status as any,
        carrier_id: req.query.carrier_id as string,
        order_id: req.query.order_id as string,
        date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
        date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await this.shippingService.listShipments(filters);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/shipments/:id/label - Generate label
   */
  async generateLabel(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const shipment = await this.shippingService.generateLabel(id, tenant_id);
      res.status(200).json({ status: 'success', data: shipment });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/shipments/:id/ship - Mark shipped
   */
  async markShipped(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const shipment = await this.shippingService.markShipped(id, tenant_id);
      res.status(200).json({ status: 'success', data: shipment });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/shipments/:id/deliver - Mark delivered
   */
  async markDelivered(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { signature } = req.body;
      const shipment = await this.shippingService.markDelivered(id, tenant_id, signature);
      res.status(200).json({ status: 'success', data: shipment });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/shipments/:id/cancel - Cancel shipment
   */
  async cancelShipment(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const shipment = await this.shippingService.cancelShipment(id, tenant_id);
      res.status(200).json({ status: 'success', data: shipment });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/shipping/rates - Get rate quotes
   */
  async getRateQuotes(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const request: RateQuoteRequest = { tenant_id, ...req.body };
      const quotes = await this.shippingService.getRateQuotes(request);
      res.status(200).json({ status: 'success', data: quotes });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/tracking/:tracking_number - Track shipment
   */
  async trackShipment(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tracking_number } = req.params;
      const result = await this.shippingService.trackByTrackingNumber(tracking_number, tenant_id);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(404).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/shipments/:id/tracking - Get tracking events
   */
  async getTrackingEvents(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const events = await this.shippingService.getTrackingEvents(id, tenant_id);
      res.status(200).json({ status: 'success', data: events });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }
}
