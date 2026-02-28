import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { MessageService } from '../services/MessageService';

export class MessageController {
  private messageService: MessageService;

  constructor(dataSource: DataSource) {
    this.messageService = new MessageService(dataSource);
  }

  /**
   * POST /api/v1/messages
   * Create and optionally send a message
   */
  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user.churchId;
      const userId = req.user.userId;
      const dto = req.body;

      const message = await this.messageService.createMessage(churchId, userId, dto);

      // If sendNow is true, send immediately
      if (req.body.sendNow) {
        await this.messageService.sendMessage(message.messageId);
      }

      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/messages/:id
   * Get message by ID
   */
  async getMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const message = await this.messageService.getMessage(id);

      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      res.status(200).json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/messages/:id/send
   * Send a message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const message = await this.messageService.sendMessage(id);

      res.status(200).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/messages/:id/cancel
   * Cancel a scheduled message
   */
  async cancelMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const message = await this.messageService.cancelMessage(id);

      res.status(200).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/messages/:id/recipients
   * Get message recipients
   */
  async getMessageRecipients(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const recipients = await this.messageService.getMessageRecipients(id);

      res.status(200).json({ recipients });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/messages/:id/analytics
   * Get message analytics
   */
  async getMessageAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const analytics = await this.messageService.getMessageAnalytics(id);

      res.status(200).json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
