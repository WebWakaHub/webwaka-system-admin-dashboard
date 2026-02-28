/**
 * Property Management - Property Controller
 * 
 * HTTP request handlers for property management endpoints.
 * 
 * @module hospitality-property-management/api/controllers/property-controller
 * @author webwakaagent4
 */

import { Request, Response } from 'express';
import { PropertyService } from '../../services/property-service';
import { RatePlanService } from '../../services/rate-plan-service';

export class PropertyController {
  private propertyService: PropertyService;
  private ratePlanService: RatePlanService;

  constructor(propertyService: PropertyService, ratePlanService: RatePlanService) {
    this.propertyService = propertyService;
    this.ratePlanService = ratePlanService;
  }

  /**
   * Create property
   */
  async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId; // From auth middleware
      const property = await this.propertyService.createProperty(tenantId, req.body);
      res.status(201).json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * List properties
   */
  async listProperties(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { page, limit, status, type, search } = req.query;

      const result = await this.propertyService.listProperties(tenantId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as any,
        type: type as string,
        search: search as string,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get property
   */
  async getProperty(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { id } = req.params;

      const property = await this.propertyService.getProperty(tenantId, id);
      res.json(property);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Update property
   */
  async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { id } = req.params;

      const property = await this.propertyService.updateProperty(tenantId, id, req.body);
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { id } = req.params;

      await this.propertyService.deleteProperty(tenantId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Activate property
   */
  async activateProperty(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { id } = req.params;

      const property = await this.propertyService.activateProperty(tenantId, id);
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Deactivate property
   */
  async deactivateProperty(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { id } = req.params;

      const property = await this.propertyService.deactivateProperty(tenantId, id);
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Room type methods (stubs)
  async createRoomType(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async listRoomTypes(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async getRoomType(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async updateRoomType(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async deleteRoomType(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  // Rate plan methods
  async createRatePlan(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { id: propertyId } = req.params;

      const ratePlan = await this.ratePlanService.createRatePlan(tenantId, propertyId, req.body);
      res.status(201).json(ratePlan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listRatePlans(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { id: propertyId } = req.params;
      const { roomTypeId } = req.query;

      const ratePlans = await this.ratePlanService.getRatePlans(
        tenantId,
        propertyId,
        roomTypeId as string
      );
      res.json(ratePlans);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRatePlan(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async updateRatePlan(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { rpId } = req.params;

      const ratePlan = await this.ratePlanService.updateRatePlan(tenantId, rpId, req.body);
      res.json(ratePlan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRatePlan(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { rpId } = req.params;

      await this.ratePlanService.deleteRatePlan(tenantId, rpId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Availability methods (stubs)
  async getAvailability(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async updateAvailability(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async blockDates(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  async unblockDates(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }

  // Analytics methods (stub)
  async getAnalytics(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: 'Not implemented' });
  }
}
