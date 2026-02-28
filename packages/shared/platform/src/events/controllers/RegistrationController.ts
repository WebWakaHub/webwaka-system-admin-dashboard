import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { RegistrationService } from '../services/RegistrationService';
import { CreateRegistrationDto } from '../dto/CreateRegistrationDto';

export class RegistrationController {
  private registrationService: RegistrationService;

  constructor(dataSource: DataSource) {
    this.registrationService = new RegistrationService(dataSource);
  }

  /**
   * POST /api/v1/registrations
   * Register for an event
   */
  async registerForEvent(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user.churchId;
      const dto: CreateRegistrationDto = req.body;

      const result = await this.registrationService.registerForEvent(churchId, dto);

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/registrations/:id/cancel
   * Cancel a registration
   */
  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const registration = await this.registrationService.cancelRegistration(id);

      res.status(200).json(registration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/registrations/qr/:qrCode
   * Get registration by QR code
   */
  async getRegistrationByQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { qrCode } = req.params;

      const registration = await this.registrationService.getRegistrationByQRCode(qrCode);

      if (!registration) {
        res.status(404).json({ error: 'Registration not found' });
        return;
      }

      res.status(200).json(registration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/events/:eventId/registrations
   * Get event registrations
   */
  async getEventRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { status } = req.query;

      const registrations = await this.registrationService.getEventRegistrations(
        eventId,
        status as any
      );

      res.status(200).json({ registrations });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/members/:memberId/registrations
   * Get member's registrations
   */
  async getMemberRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;

      const registrations = await this.registrationService.getMemberRegistrations(memberId);

      res.status(200).json({ registrations });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
