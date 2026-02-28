import { DataSource } from 'typeorm';
import { Message, MessageType, MessageChannel, MessageStatus } from '../models/Message';
import { MessageRecipient, RecipientStatus } from '../models/MessageRecipient';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMessageDto {
  subject?: string;
  body: string;
  messageType: MessageType;
  channel: MessageChannel;
  recipientFilter?: {
    all?: boolean;
    memberIds?: string[];
    groupIds?: string[];
    tags?: string[];
  };
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export class MessageService {
  constructor(private dataSource: DataSource) {}

  /**
   * Create a new message
   */
  async createMessage(
    churchId: string,
    userId: string,
    dto: CreateMessageDto
  ): Promise<Message> {
    const messageRepository = this.dataSource.getRepository(Message);

    const message = messageRepository.create({
      messageId: uuidv4(),
      churchId,
      subject: dto.subject,
      body: dto.body,
      messageType: dto.messageType,
      channel: dto.channel,
      status: dto.scheduledAt ? MessageStatus.SCHEDULED : MessageStatus.DRAFT,
      scheduledAt: dto.scheduledAt,
      createdBy: userId,
      metadata: dto.metadata,
      recipientCount: 0,
      deliveredCount: 0,
      failedCount: 0,
    });

    return await messageRepository.save(message);
  }

  /**
   * Send a message immediately
   */
  async sendMessage(messageId: string): Promise<Message> {
    const messageRepository = this.dataSource.getRepository(Message);
    
    const message = await messageRepository.findOne({ where: { messageId } });
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.status !== MessageStatus.DRAFT && message.status !== MessageStatus.SCHEDULED) {
      throw new Error('Only draft or scheduled messages can be sent');
    }

    // Update status to sending
    await messageRepository.update({ messageId }, {
      status: MessageStatus.SENDING,
      sentAt: new Date(),
    });

    // TODO: Implement actual sending logic based on channel
    // - SMS: Call Termii API
    // - Email: Call email service
    // - Push: Call FCM
    // - In-app: Store in database

    // Update status to sent
    await messageRepository.update({ messageId }, {
      status: MessageStatus.SENT,
    });

    return (await messageRepository.findOne({ where: { messageId }}))!;
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: string): Promise<Message | null> {
    const messageRepository = this.dataSource.getRepository(Message);
    return await messageRepository.findOne({ where: { messageId } });
  }

  /**
   * Cancel a scheduled message
   */
  async cancelMessage(messageId: string): Promise<Message> {
    const messageRepository = this.dataSource.getRepository(Message);
    
    const message = await messageRepository.findOne({ where: { messageId } });
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.status !== MessageStatus.SCHEDULED) {
      throw new Error('Only scheduled messages can be cancelled');
    }

    await messageRepository.update({ messageId }, {
      status: MessageStatus.CANCELLED,
    });

    return (await messageRepository.findOne({ where: { messageId }}))!;
  }

  /**
   * Get message recipients
   */
  async getMessageRecipients(messageId: string): Promise<MessageRecipient[]> {
    const recipientRepository = this.dataSource.getRepository(MessageRecipient);
    return await recipientRepository.find({ where: { messageId } });
  }

  /**
   * Get message analytics
   */
  async getMessageAnalytics(messageId: string): Promise<{
    totalRecipients: number;
    delivered: number;
    failed: number;
    read: number;
    deliveryRate: number;
    readRate: number;
  }> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const recipients = await this.getMessageRecipients(messageId);
    const delivered = recipients.filter(r => r.status === RecipientStatus.DELIVERED).length;
    const failed = recipients.filter(r => r.status === RecipientStatus.FAILED).length;
    const read = recipients.filter(r => r.status === RecipientStatus.READ).length;

    return {
      totalRecipients: message.recipientCount,
      delivered,
      failed,
      read,
      deliveryRate: message.recipientCount > 0 ? (delivered / message.recipientCount) * 100 : 0,
      readRate: delivered > 0 ? (read / delivered) * 100 : 0,
    };
  }
}
