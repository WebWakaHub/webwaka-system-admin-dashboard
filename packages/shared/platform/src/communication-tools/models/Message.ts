import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MessageType {
  BROADCAST = 'BROADCAST',
  GROUP = 'GROUP',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum MessageChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum MessageStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('messages')
@Index(['churchId', 'status'])
@Index(['churchId', 'messageType'])
@Index(['scheduledAt'])
export class Message {
  @PrimaryColumn('uuid')
  messageId!: string;

  @Column('uuid')
  @Index()
  churchId!: string;

  @Column('varchar', { length: 255, nullable: true })
  subject?: string;

  @Column('text')
  body!: string;

  @Column({
    type: 'enum',
    enum: MessageType,
  })
  messageType!: MessageType;

  @Column({
    type: 'enum',
    enum: MessageChannel,
  })
  channel!: MessageChannel;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.DRAFT,
  })
  status!: MessageStatus;

  @Column('timestamp', { nullable: true })
  scheduledAt?: Date;

  @Column('timestamp', { nullable: true })
  sentAt?: Date;

  @Column('int', { default: 0 })
  recipientCount!: number;

  @Column('int', { default: 0 })
  deliveredCount!: number;

  @Column('int', { default: 0 })
  failedCount!: number;

  @Column('uuid')
  createdBy!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
